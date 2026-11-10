import type { Metadata } from "next";
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
import { HOME_META_DEFAULTS } from "@/app/lib/content/home-content";
import { getHomepageData, getSiteChrome } from "@/server/homepage";

// Matches HOMEPAGE_REVALIDATE_SECONDS in server/homepage.ts (must be a literal here).
// Saving in jmt-admin's /dashboard/homepage expires the "homepage" tag here
// (app/api/revalidate), so edits show at once.
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const { meta, hero } = await getHomepageData();
  const title = meta.title ?? HOME_META_DEFAULTS.metaTitle;
  const description = meta.description ?? HOME_META_DEFAULTS.metaDescription;

  return {
    // Makes a relative og:image absolute — social previews need a full URL.
    // Set SITE_URL to the domain that serves this homepage.
    metadataBase: new URL(process.env.SITE_URL || "http://localhost:3002"),
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: hero.image.src, width: hero.image.width, height: hero.image.height }],
    },
  };
}

export default async function HomePage() {
  const [data, chrome] = await Promise.all([getHomepageData(), getSiteChrome()]);
  const { enabled } = data;

  return (
    <>
      {enabled.hero && <HeroSection content={data.hero} contact={chrome.contact} />}
      {enabled.services && <Services services={data.services} copy={data.servicesCopy} />}
      {enabled.sites && <Sites sites={data.siteTypes} copy={data.sitesCopy} />}
      {enabled.why && <WhyChoose reasons={data.reasons} image={data.reasonsImage} copy={data.whyCopy} />}
      {enabled.trades && <Trades trades={data.trades} copy={data.tradesCopy} />}
      {enabled.process && <HowTo steps={data.process} copy={data.processCopy} />}
      {enabled.founder && <Founder founder={data.founder} contact={chrome.contact} />}
      {enabled.banner && <Banner banner={data.banner} />}
      {enabled.faq && (
        <Faq groups={data.faqs} copy={data.faqCopy} founder={data.founder} contact={chrome.contact} />
      )}
      {enabled.contact && <Contact contact={chrome.contact} image={data.contactImage} copy={data.contactCopy} />}
    </>
  );
}
