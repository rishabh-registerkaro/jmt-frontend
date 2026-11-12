import type { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import AboutSitesStrip from "@/components/about/AboutSitesStrip";
import AboutTrades from "@/components/about/AboutTrades";
import AboutValues from "@/components/about/AboutValues";
import AboutTeam from "@/components/about/AboutTeam";
import AboutStandards from "@/components/about/AboutStandards";
import AboutPromises from "@/components/about/AboutPromises";
import AboutRecovery from "@/components/about/AboutRecovery";
import AboutWhere from "@/components/about/AboutWhere";
import AboutJoin from "@/components/about/AboutJoin";
import AboutCta from "@/components/about/AboutCta";
import MobileBar from "@/components/homepage/MobileBar/MobileBar";
import { pageMetadata } from "@/lib/seo";
import { contactPath, sitePagePath } from "@/lib/siteLinks";
import { getSiteChrome } from "@/server/homepage";
import { getAboutPage } from "@/server/sitePages";

// About page — Figma "JMT" → "About page — Desktop 1440" (289:2) and
// "About page — Mobile 390" (296:2).
// URL: /about. The navbar and footer "About" links point here
// (lib/siteLinks.ts). Navbar, footer and the contact details come from the
// homepage CMS via app/layout.tsx; the page copy is edited in jmt-admin
// (Dashboard → About Us), with data/about.ts as the fallback
// (server/sitePages.ts).

// Matches SITE_PAGE_REVALIDATE_SECONDS / HOMEPAGE_REVALIDATE_SECONDS (must be a literal here).
export const revalidate = 600;

const TEAM_ID = "team";
const JOIN_ID = "join-our-crew";

export async function generateMetadata(): Promise<Metadata> {
  const [page, chrome] = await Promise.all([getAboutPage(), getSiteChrome()]);
  return pageMetadata({
    path: sitePagePath("about"),
    title: page.meta.title,
    description: page.meta.description,
    image: page.team.founder.image,
    siteName: chrome.brand.name,
  });
}

export default async function AboutPage() {
  const [chrome, content] = await Promise.all([getSiteChrome(), getAboutPage()]);
  const homeSection = (id: string) => `/#${id}`;
  // This page has no form: "Request workers" opens the Contact page's enquiry
  // form, "Apply" the Join our crew application form.
  const requestHref = `${contactPath()}#enquiry`;
  const applyHref = `${sitePagePath("join-our-crew")}#apply`;

  return (
    <>
      <AboutHero content={content.hero} founderHref={`#${TEAM_ID}`} servicesHref={homeSection("services")} />
      <AboutSitesStrip content={content.sites} />
      <AboutTrades content={content.trades} rolesHref={homeSection("trades")} />
      <AboutValues content={content.values} />
      <AboutTeam id={TEAM_ID} content={content.team} joinHref={`#${JOIN_ID}`} />
      <AboutStandards content={content.standards} />
      <AboutPromises content={content.promises} />
      <AboutRecovery content={content.recovery} />
      <AboutWhere content={content.where} sitesHref={homeSection("sites")} />
      {/* "Apply" opens the application form on the Join our crew page. */}
      <AboutJoin id={JOIN_ID} content={content.join} applyHref={applyHref} />
      <AboutCta content={content.cta} requestHref={requestHref} joinHref={`#${JOIN_ID}`} />
      {/* Phones: fixed Call / WhatsApp / Request workers bar (Figma 297:311), as on the homepage. */}
      <MobileBar contact={chrome.contact} ctaLabel={content.cta.primaryCta} ctaHref={requestHref} />
    </>
  );
}
