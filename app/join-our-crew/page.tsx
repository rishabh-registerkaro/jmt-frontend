import type { Metadata } from "next";
import JoinHero from "@/components/join/JoinHero";
import JoinBenefits from "@/components/join/JoinBenefits";
import JoinWork from "@/components/join/JoinWork";
import JoinHiring from "@/components/join/JoinHiring";
import JoinApply from "@/components/join/JoinApply";
import MobileBar from "@/components/homepage/MobileBar/MobileBar";
import { UI_TEXT } from "@/lib/uiText";
import { sitePagePath } from "@/lib/siteLinks";
import { breadcrumbJsonLd, jsonLdHtml, pageMetadata } from "@/lib/seo";
import { getSiteChrome } from "@/server/homepage";
import { getJoinPage } from "@/server/sitePages";

// Join our crew page — Figma "JMT" → "Join our crew — Desktop 1440" (311:2)
// and "Join our crew — Mobile 390" (313:2).
// URL: /join-our-crew (proxy.ts: /join, /careers and /jobs redirect here). The
// navbar, footer and homepage "Join our crew" links point here
// (lib/siteLinks.ts). The application form posts to jmt-admin
// (app/actions/joinApplication.ts), which stores it in the `leads` table like
// the other forms. The copy is edited in jmt-admin (Dashboard → Join Our
// Crew), with data/joinPage.ts as the fallback (server/sitePages.ts).

// Matches SITE_PAGE_REVALIDATE_SECONDS / HOMEPAGE_REVALIDATE_SECONDS (must be a literal here).
export const revalidate = 600;

const PATH = "join-our-crew";
const APPLY_ID = "apply";

export async function generateMetadata(): Promise<Metadata> {
  const [page, chrome] = await Promise.all([getJoinPage(), getSiteChrome()]);
  return pageMetadata({
    path: sitePagePath(PATH),
    title: page.meta.title,
    description: page.meta.description,
    image: page.hero.photos.main,
    siteName: chrome.brand.name,
  });
}

export default async function JoinOurCrewPage() {
  const [chrome, content] = await Promise.all([getSiteChrome(), getJoinPage()]);
  const applyHref = `#${APPLY_ID}`;
  // Mirrors the visible breadcrumb in JoinHero (crumbHome / crumb).
  const breadcrumb = breadcrumbJsonLd([
    { name: content.hero.crumbHome, path: "/" },
    { name: content.hero.crumb, path: sitePagePath(PATH) },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(breadcrumb)} />
      <JoinHero
        content={content.hero}
        homeHref="/"
        applyHref={applyHref}
        whatsappHref={chrome.contact.whatsappHref ?? applyHref}
        opensWhatsApp={UI_TEXT.opensWhatsApp}
      />
      <JoinBenefits content={content.benefits} />
      <JoinWork content={content.work} />
      <JoinHiring content={content.hiring} />
      <JoinApply
        id={APPLY_ID}
        content={content.apply}
        form={content.form}
        contact={chrome.contact}
        opensWhatsApp={UI_TEXT.opensWhatsApp}
      />
      {/* Phones: fixed Call / WhatsApp / Apply now bar (Figma 313:439). */}
      <MobileBar contact={chrome.contact} ctaLabel={content.hero.primaryCta} ctaHref={applyHref} />
    </>
  );
}
