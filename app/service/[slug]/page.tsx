import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceHero from "@/components/service/ServiceHero";
import ServiceSubnav from "@/components/service/ServiceSubnav";
import UseCases from "@/components/service/UseCases";
import Included from "@/components/service/Included";
import Roles from "@/components/service/Roles";
import CrewChecks from "@/components/service/CrewChecks";
import Plans from "@/components/service/Plans";
import Steps from "@/components/service/Steps";
import ServiceFaq from "@/components/service/ServiceFaq";
import RelatedServices from "@/components/service/RelatedServices";
import { RoleSelectionProvider } from "@/components/service/RoleSelection";
import Contact from "@/components/homepage/Contact/Contact";
import MobileBar from "@/components/homepage/MobileBar/MobileBar";
import { breadcrumbJsonLd, jsonLdHtml, pageMetadata, serviceJsonLd } from "@/lib/seo";
import { getHomepageData, getSiteChrome } from "@/server/homepage";
import { getServicePage, getServiceSlugs } from "@/server/service";
import { servicePath } from "@/lib/siteLinks";
import { SERVICE_SECTION_IDS, SERVICE_SECTION_KEYS, type ServicePageContent } from "@/types/service";

// Service pages — Figma "JMT" → "Service page" (237:2).
// URL: /service/<slug>.
// Content is edited in jmt-admin (Dashboard → JMT Service Pages); see
// server/service.ts. Navbar and footer come from app/layout.tsx; the closing
// contact block and its lead form are the homepage's (CMS-driven), with this
// page's heading.
//
// ISR: every page is static. It is regenerated in the background after
// `revalidate` seconds, and at once when the admin saves it (the save expires
// its cache tag through app/api/revalidate).

// Matches SERVICE_REVALIDATE_SECONDS in server/service.ts (must be a literal here).
export const revalidate = 600;
// Pages published after the build are rendered on their first visit, then cached.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getServiceSlugs()).map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [content, chrome] = await Promise.all([getServicePage(slug), getSiteChrome()]);
  if (!content) return {};
  return pageMetadata({
    path: servicePath(slug),
    title: content.meta.title,
    description: content.meta.description,
    image: content.hero.image,
    siteName: chrome.brand.name,
  });
}

/** Subnav links to hidden sections are dropped; links to other ids are kept. */
function visibleSubnavLinks(content: ServicePageContent) {
  const hiddenIds = new Set(
    SERVICE_SECTION_KEYS.filter((key) => !content.visible[key]).map((key) => SERVICE_SECTION_IDS[key]),
  );
  return content.subnav.links.filter((link) => !hiddenIds.has(link.id));
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getServicePage(slug);
  if (!content) notFound();
  const [data, chrome] = await Promise.all([getHomepageData(), getSiteChrome()]);
  const show = content.visible;
  const ids = SERVICE_SECTION_IDS;
  const home = "/";
  // Mirrors the visible breadcrumb in ServiceHero: Home / Services / <current>.
  const breadcrumb = breadcrumbJsonLd([
    { name: content.hero.breadcrumb.home, path: home },
    { name: content.hero.breadcrumb.services, path: `${home}#services` },
    { name: content.hero.breadcrumb.current, path: servicePath(slug) },
  ]);
  const service = serviceJsonLd({
    name: content.hero.breadcrumb.current,
    description: content.meta.description,
    path: servicePath(slug),
    image: content.hero.image.src,
  });

  // Roles ticked in "Roles we supply" are shown in, and sent with, the request form.
  const roles = show.roles
    ? content.roles.trades.flatMap((trade) => trade.roles.map((role) => ({ id: role.id, name: role.name })))
    : [];

  return (
    <RoleSelectionProvider
      rolesSectionId={show.roles ? ids.roles : null}
      roles={roles}
      preselected={show.roles ? content.roles.preselected : []}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml([breadcrumb, service])} />
      <ServiceHero content={content.hero} contact={chrome.contact} homeHref={home} />
      <ServiceSubnav links={visibleSubnavLinks(content)} cta={content.subnav.cta} />
      {show.useCases && <UseCases id={ids.useCases} copy={content.useCases.copy} cards={content.useCases.cards} />}
      {show.included && <Included id={ids.included} content={content.included} />}
      {show.roles && <Roles id={ids.roles} content={content.roles} />}
      {show.crew && <CrewChecks id={ids.crew} content={content.crew} />}
      {show.plans && <Plans id={ids.plans} content={content.plans} />}
      {show.steps && <Steps id={ids.steps} copy={content.steps.copy} steps={content.steps.steps} />}
      {show.faq && <ServiceFaq id={ids.faq} content={content.faq} contact={chrome.contact} />}
      {show.related && (
        <RelatedServices id={ids.related} copy={content.related.copy} services={content.related.services} />
      )}
      {/* Always shown: every "Request" button on the page scrolls here.
          scroll-mt: keep the heading clear of the sticky subnav on #contact jumps. */}
      <div className="[&_#contact]:scroll-mt-[65px]">
        <Contact
          contact={chrome.contact}
          image={data.contactImage}
          copy={{ ...data.contactCopy, title: content.contactTitle }}
        />
      </div>
      {/* Phones: fixed Call / WhatsApp / Request bar (Figma 244:500), same as the homepage's. */}
      <MobileBar contact={chrome.contact} ctaLabel={content.hero.primaryCta} ctaHref="#contact" />
    </RoleSelectionProvider>
  );
}
