import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContactHero from "@/components/contact/ContactHero";
import ContactOptions from "@/components/contact/ContactOptions";
import NextSteps from "@/components/contact/NextSteps";
import OfficeDetails from "@/components/contact/OfficeDetails";
import WorkersLine from "@/components/contact/WorkersLine";
import MobileBar from "@/components/homepage/MobileBar/MobileBar";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { breadcrumbJsonLd, jsonLdHtml, pageMetadata } from "@/lib/seo";
import { contactPath, sitePagePath } from "@/lib/siteLinks";
import { getHomepageData, getSiteChrome } from "@/server/homepage";
import { getContactPage } from "@/server/sitePages";
import type { HomeImage } from "@/types/homepage";

// Contact page — Figma "JMT" → "Contact page — Desktop 1440" (302:2) and
// "Contact page — Mobile 390" (304:2). URL: /contact (English), /bn/contact,
// /hi/contact. Navbar and footer come from app/[lang]/layout.tsx; phone,
// WhatsApp, email and hours from the admin (chrome.contact); the rest of the
// copy from jmt-admin (Dashboard → Contact), with
// data/contactPage.ts as the fallback (server/sitePages.ts). The enquiry form posts to jmt-admin's
// /api/lead/contact (app/actions/contactLead.ts).

// Matches HOMEPAGE_REVALIDATE_SECONDS in server/homepage.ts (must be a literal here).
export const revalidate = 600;

interface PageProps {
  params: Promise<{ lang: string }>;
}

/** The business card's header photo: the team in front of the viaduct (Figma 302:64). */
const CARD_PHOTO: HomeImage = {
  src: "/homepage/banner-team.webp",
  alt: "JMT site workers and supervisors in hard hats and safety vests in front of a metro viaduct",
  width: 2172,
  height: 724,
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const [page, chrome] = await Promise.all([getContactPage(), getSiteChrome(lang)]);
  return pageMetadata({
    lang,
    pathFor: contactPath,
    title: page.meta.title,
    description: page.meta.description,
    image: CARD_PHOTO,
    siteName: chrome.brand.name,
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [data, chrome, page] = await Promise.all([getHomepageData(lang), getSiteChrome(lang), getContactPage()]);
  const t = getDictionary(lang);
  const homeHref = localePath(lang);

  // Mirrors the visible breadcrumb in ContactHero (crumbHome / crumb).
  const breadcrumb = breadcrumbJsonLd([
    { name: page.hero.crumbHome, path: homeHref },
    { name: page.hero.crumb, path: contactPath(lang) },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(breadcrumb)} />
      <ContactHero page={page} contact={chrome.contact} photo={CARD_PHOTO} homeHref={homeHref} />
      <ContactOptions copy={page.options} office={page.office} contact={chrome.contact} />
      <NextSteps copy={page.steps} />
      <OfficeDetails page={page} contact={chrome.contact} />
      <WorkersLine copy={page.workers} href={sitePagePath(lang, "join-our-crew")} />
      {/* Phones: fixed Call / WhatsApp / Request bar (Figma 304:418), same as the homepage's. */}
      <MobileBar contact={chrome.contact} ctaLabel={data.hero.primaryCta} ctaHref="#enquiry" t={t} />
    </>
  );
}
