import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { contactPath, sitePagePath } from "@/lib/siteLinks";
import { getSiteChrome } from "@/server/homepage";
import { getAboutPage } from "@/server/sitePages";

// About page — Figma "JMT" → "About page — Desktop 1440" (289:2) and
// "About page — Mobile 390" (296:2).
// URL: /about (English), /bn/about and /hi/about (proxy.ts). The navbar and
// footer "About" links point here (lib/siteLinks.ts). Navbar, footer and the
// contact details come from the homepage CMS via app/[lang]/layout.tsx; the
// page copy is edited in jmt-admin (Dashboard → About Us), with
// data/about.ts as the fallback (server/sitePages.ts).

// Matches SITE_PAGE_REVALIDATE_SECONDS / HOMEPAGE_REVALIDATE_SECONDS (must be a literal here).
export const revalidate = 600;

interface PageProps {
  params: Promise<{ lang: string }>;
}

const TEAM_ID = "team";
const JOIN_ID = "join-our-crew";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const [page, chrome] = await Promise.all([getAboutPage(), getSiteChrome(lang)]);
  return pageMetadata({
    lang,
    pathFor: (l) => sitePagePath(l, "about"),
    title: page.meta.title,
    description: page.meta.description,
    image: page.team.founder.image,
    siteName: chrome.brand.name,
  });
}

export default async function AboutPage({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [chrome, content] = await Promise.all([getSiteChrome(lang), getAboutPage()]);
  const t = getDictionary(lang);
  const home = localePath(lang);
  // "/" + "#x" → "/#x"; "/bn" + "#x" → "/bn#x".
  const homeSection = (id: string) => `${home}#${id}`;
  // This page has no form: "Request workers" opens the Contact page's enquiry
  // form, "Apply" the Join our crew application form.
  const requestHref = `${contactPath(lang)}#enquiry`;
  const applyHref = `${sitePagePath(lang, "join-our-crew")}#apply`;

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
      <MobileBar contact={chrome.contact} ctaLabel={content.cta.primaryCta} ctaHref={requestHref} t={t} />
    </>
  );
}
