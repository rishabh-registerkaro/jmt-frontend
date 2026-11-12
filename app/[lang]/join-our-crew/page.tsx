import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JoinHero from "@/components/join/JoinHero";
import JoinBenefits from "@/components/join/JoinBenefits";
import JoinWork from "@/components/join/JoinWork";
import JoinHiring from "@/components/join/JoinHiring";
import JoinApply from "@/components/join/JoinApply";
import MobileBar from "@/components/homepage/MobileBar/MobileBar";
import { LOCALES, getDictionary, hasLocale, localePath, type Locale } from "@/lib/i18n";
import { sitePagePath } from "@/lib/siteLinks";
import { breadcrumbJsonLd, jsonLdHtml, pageMetadata } from "@/lib/seo";
import { getSiteChrome } from "@/server/homepage";
import { getJoinPage } from "@/server/sitePages";

// Join our crew page — Figma "JMT" → "Join our crew — Desktop 1440" (311:2)
// and "Join our crew — Mobile 390" (313:2).
// URL: /join-our-crew (English), /bn/join-our-crew and /hi/join-our-crew
// (proxy.ts; /join, /careers and /jobs redirect here). The navbar, footer and
// homepage "Join our crew" links point here (lib/siteLinks.ts). The
// application form posts to jmt-admin (app/actions/joinApplication.ts), which
// stores it in the `leads` table like the other forms. The copy is edited in
// jmt-admin (Dashboard → Join Our Crew), with data/joinPage.ts
// as the fallback (server/sitePages.ts).

// Matches SITE_PAGE_REVALIDATE_SECONDS / HOMEPAGE_REVALIDATE_SECONDS (must be a literal here).
export const revalidate = 600;

const PATH = "join-our-crew";
const APPLY_ID = "apply";

interface PageProps {
  params: Promise<{ lang: string }>;
}

/** "Also in" chips: each language named in its own script. */
const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", bn: "বাংলা", hi: "हिंदी" };
/** The application form's language choice for each page language. */
const FORM_LANGUAGE: Record<Locale, string> = { en: "", bn: "Bengali", hi: "Hindi" };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const [page, chrome] = await Promise.all([getJoinPage(), getSiteChrome(lang)]);
  return pageMetadata({
    lang,
    pathFor: (l) => sitePagePath(l, PATH),
    title: page.meta.title,
    description: page.meta.description,
    image: page.hero.photos.main,
    siteName: chrome.brand.name,
  });
}

export default async function JoinOurCrewPage({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [chrome, content] = await Promise.all([getSiteChrome(lang), getJoinPage()]);
  const t = getDictionary(lang);
  const applyHref = `#${APPLY_ID}`;
  // Mirrors the visible breadcrumb in JoinHero (crumbHome / crumb).
  const breadcrumb = breadcrumbJsonLd([
    { name: content.hero.crumbHome, path: localePath(lang) },
    { name: content.hero.crumb, path: sitePagePath(lang, PATH) },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(breadcrumb)} />
      <JoinHero
        content={content.hero}
        homeHref={localePath(lang)}
        applyHref={applyHref}
        whatsappHref={chrome.contact.whatsappHref ?? applyHref}
        otherLanguages={LOCALES.filter((l) => l !== lang).map((l) => ({
          lang: l,
          label: LANGUAGE_NAMES[l],
          href: sitePagePath(l, PATH),
        }))}
        opensWhatsApp={t.opensWhatsApp}
      />
      <JoinBenefits content={content.benefits} />
      <JoinWork content={content.work} />
      <JoinHiring content={content.hiring} />
      <JoinApply
        id={APPLY_ID}
        content={content.apply}
        form={content.form}
        contact={chrome.contact}
        defaultLanguage={FORM_LANGUAGE[lang]}
        opensWhatsApp={t.opensWhatsApp}
      />
      {/* Phones: fixed Call / WhatsApp / Apply now bar (Figma 313:439). */}
      <MobileBar contact={chrome.contact} ctaLabel={content.hero.primaryCta} ctaHref={applyHref} t={t} />
    </>
  );
}
