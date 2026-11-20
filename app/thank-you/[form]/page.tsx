import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ThankYouActions,
  ThankYouExplore,
  ThankYouHero,
  ThankYouSteps,
  type ThankYouStep,
} from "@/components/thank-you/ThankYouSections";
import { UI_TEXT } from "@/lib/uiText";
import { pageMetadata } from "@/lib/seo";
import { THANK_YOU_FORMS, isThankYouForm, thankYouPath, type ThankYouForm } from "@/lib/thankYou";
import { WHATSAPP_DRAFTS, withWhatsAppText } from "@/lib/whatsapp";
import { getHomepageData, getSiteChrome } from "@/server/homepage";
import { getContactPage, getJoinPage, getThankYouPage } from "@/server/sitePages";

// Thank-you page — where every form leads once it is sent (lib/thankYou.ts):
//   /thank-you/request      "Request workers" (homepage and service pages)
//   /thank-you/enquiry      Contact page enquiry
//   /thank-you/application  Join our crew application
// One URL per form, so ads and analytics can count each as a conversion.
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
// Only the three forms; any other /thank-you/<x> is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return THANK_YOU_FORMS.map((form) => ({ form }));
}

interface PageProps {
  params: Promise<{ form: string }>;
}

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { form } = await params;
  if (!isThankYouForm(form)) return {};
  const [page, chrome] = await Promise.all([getThankYouPage(), getSiteChrome()]);
  return {
    ...pageMetadata({
      path: thankYouPath(form),
      title: page.meta.title,
      description: page.meta.description,
      siteName: chrome.brand.name,
    }),
    // A conversion page: never a search result, but its links may be followed.
    robots: { index: false, follow: true },
  };
}

export default async function ThankYouPage({ params }: PageProps) {
  const { form } = await params;
  if (!isThankYouForm(form)) notFound();
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
