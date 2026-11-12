import { Fragment, type ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { HomepageSection } from "@/types/homepage";
import HeroSection from "@/components/homepage/HeroSection/HeroSection";
import Services from "@/components/homepage/Services/Services";
import Sites from "@/components/homepage/Sites/Sites";
import WhyChoose from "@/components/homepage/WhyChoose/WhyChoose";
import Trades from "@/components/homepage/Trades/Trades";
import HowTo from "@/components/homepage/HowTo/HowTo";
import Founder from "@/components/homepage/Founder/Founder";
import Banner from "@/components/homepage/Banner/Banner";
import Faq from "@/components/homepage/Faq/Faq";
import Contact from "@/components/homepage/Contact/Contact";
import MobileBar from "@/components/homepage/MobileBar/MobileBar";
import { HOME_META_DEFAULTS } from "@/app/lib/content/home-content";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { getHomepageData, getSiteChrome } from "@/server/homepage";

// Matches HOMEPAGE_REVALIDATE_SECONDS in server/homepage.ts (must be a literal here).
// Saving in jmt-admin's /dashboard/homepage expires the "homepage" tag here
// (app/api/revalidate), so edits show at once — in every language.
export const revalidate = 600;

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const [{ meta, hero }, chrome] = await Promise.all([getHomepageData(lang), getSiteChrome(lang)]);
  return pageMetadata({
    lang,
    pathFor: localePath,
    title: meta.title ?? HOME_META_DEFAULTS.metaTitle,
    description: meta.description ?? HOME_META_DEFAULTS.metaDescription,
    image: hero.image,
    siteName: chrome.brand.name,
  });
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [data, chrome] = await Promise.all([getHomepageData(lang), getSiteChrome(lang)]);
  const t = getDictionary(lang);

  // One renderer per section; the admin decides the order and visibility.
  const sections: Record<HomepageSection, () => ReactNode> = {
    hero: () => <HeroSection content={data.hero} contact={chrome.contact} t={t} />,
    services: () => <Services services={data.services} copy={data.servicesCopy} />,
    sites: () => <Sites sites={data.siteTypes} copy={data.sitesCopy} />,
    why: () => <WhyChoose reasons={data.reasons} image={data.reasonsImage} copy={data.whyCopy} />,
    trades: () => <Trades trades={data.trades} copy={data.tradesCopy} />,
    process: () => <HowTo steps={data.process} copy={data.processCopy} t={t} />,
    founder: () => <Founder founder={data.founder} contact={chrome.contact} labels={chrome.labels} t={t} />,
    banner: () => <Banner banner={data.banner} />,
    faq: () => (
      <Faq
        groups={data.faqs}
        copy={data.faqCopy}
        founder={data.founder}
        contact={chrome.contact}
        labels={chrome.labels}
        t={t}
      />
    ),
    contact: () => <Contact contact={chrome.contact} image={data.contactImage} copy={data.contactCopy} />,
  };

  // The hero holds the page's only <h1>; if the admin hides it, keep one for
  // screen readers and search engines.
  const heroShown = data.enabled.hero && data.order.includes("hero");

  return (
    <>
      {!heroShown && <h1 className="sr-only">{data.meta.title ?? chrome.brand.name}</h1>}
      {data.order
        .filter((key) => data.enabled[key] && sections[key])
        .map((key) => (
          <Fragment key={key}>{sections[key]()}</Fragment>
        ))}
      <MobileBar
        contact={chrome.contact}
        ctaLabel={data.hero.primaryCta}
        ctaHref={data.hero.primaryHref}
        t={t}
      />
    </>
  );
}
