import type { Metadata } from "next";
import { ThankYouVariant } from "@/components/thank-you/ThankYouNote";
import {
  ThankYouActions,
  ThankYouExplore,
  ThankYouHero,
  ThankYouSteps,
  type ThankYouStep,
} from "@/components/thank-you/ThankYouSections";
import { UI_TEXT } from "@/lib/uiText";
import { pageMetadata } from "@/lib/seo";
import { THANK_YOU_PATH, type ThankYouForm } from "@/lib/thankYou";
import { PageSeo } from "@/components/seo/SeoTags";
import { WHATSAPP_DRAFTS, withWhatsAppText } from "@/lib/whatsapp";
import { getHomepageData, getSiteChrome } from "@/server/homepage";
import { getContactPage, getJoinPage, getThankYouPage } from "@/server/sitePages";

// Thank-you page — /thank-you, where every form leads once it is sent
// (lib/thankYou.ts). One version per form, picked in the browser from the
// note the form left (ThankYouVariant; "request" when there is none):
//   request      "Request workers" (homepage and service pages)
//   enquiry      Contact page enquiry
//   application  Join our crew application
//
// Copy: the page's own text from jmt-admin (Dashboard → Thank You, with
// data/thankYouPage.ts as the fallback); each form's success title and message
// and the next steps from where editors already set them (Homepage → Contact,
// Contact page, Join Our Crew); phone, WhatsApp and hours from Contact details.
// The visitor's name and what they sent come from the browser (ThankYouNote).
//
// Not for search engines: noindex, and not in the sitemap.

// Matches SITE_PAGE_REVALIDATE_SECONDS / HOMEPAGE_REVALIDATE_SECONDS (must be a literal here).
export const revalidate = 600;

/** The form's own success title and message, as set in the admin. */
async function sentCopy(form: ThankYouForm): Promise<{ title: string; message: string }> {
  if (form === "request") {
    const { successTitle, successText } = (await getHomepageData()).contactCopy.form;
    return { title: successTitle, message: successText };
  }
  if (form === "enquiry") {
    const { successTitle, messages } = (await getContactPage()).form;
    return { title: successTitle, message: messages.success };
  }
  const { successTitle, success } = (await getJoinPage()).form.messages;
  return { title: successTitle, message: success };
}

export async function generateMetadata(): Promise<Metadata> {
  const [page, chrome] = await Promise.all([getThankYouPage(), getSiteChrome()]);
  return {
    ...pageMetadata({
      path: THANK_YOU_PATH,
      title: page.meta.title,
      description: page.meta.description,
      siteName: chrome.brand.name,
    }),
    // A conversion page: never a search result, but its links may be followed.
    robots: { index: false, follow: true },
  };
}

/** The page as shown after `form`. */
async function ThankYouContent({ form }: { form: ThankYouForm }) {
  const worker = form === "application";

  const [page, chrome, sent, contactPage, joinPage] = await Promise.all([
    getThankYouPage(),
    getSiteChrome(),
    sentCopy(form),
    getContactPage(),
    getJoinPage(),
  ]);
  const { contact } = chrome;

  const done: ThankYouStep = {
    when: page.progress.doneWhen,
    title: worker ? page.progress.doneApplication : page.progress.doneRequest,
    text: page.progress.doneText,
  };
  // Contractors: the Contact page's "What happens next". Workers: "How hiring
  // works" from the Join page, without its first step ("Apply"), which is done.
  const steps: ThankYouStep[] = worker
    ? joinPage.hiring.steps.slice(1).map((step, i) => ({
        when: `${page.progress.stepLabel} ${String(i + 2).padStart(2, "0")}`,
        title: step.title,
        text: step.text,
      }))
    : contactPage.steps.items;

  const ready = worker
    ? { label: joinPage.hiring.keepReady.label, items: joinPage.hiring.keepReady.items.map((item) => item.text) }
    : page.ready;

  return (
    <>
      <ThankYouHero form={form} copy={page.hero} summary={page.summary} sentTitle={sent.title} message={sent.message} />
      <ThankYouSteps copy={page.progress} done={done} steps={steps} />
      <ThankYouActions
        copy={page.actions}
        contact={contact}
        whatsappHref={withWhatsAppText(contact.whatsappHref, worker ? WHATSAPP_DRAFTS.joinSent : page.actions.whatsappDraft)}
        whatsappText={worker ? joinPage.form.messages.whatsapp : page.actions.whatsappText}
        opensWhatsApp={UI_TEXT.opensWhatsApp}
        saveHref={contact.phoneHref ? "/thank-you/jmt-contact.vcf" : null}
        ready={ready}
        noFee={worker ? joinPage.benefits.noFee : null}
      />
      <ThankYouExplore copy={page.explore} links={worker ? page.explore.workerLinks : page.explore.links} />
    </>
  );
}

export default function ThankYouPage() {
  return (
    <>
      <PageSeo path={THANK_YOU_PATH} />
      <ThankYouVariant
        variants={{
          request: <ThankYouContent form="request" />,
          enquiry: <ThankYouContent form="enquiry" />,
          application: <ThankYouContent form="application" />,
        }}
      />
    </>
  );
}
