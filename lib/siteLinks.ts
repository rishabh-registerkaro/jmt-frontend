// Site-wide link mapping applied to the homepage content (from jmt-admin or the
// bundled fallback) before it renders — see server/homepage.ts.
//
// 1. Service pages: homepage links that name a service with its own page
//    (navbar dropdown, footer, service card) open that page instead of an
//    in-page anchor. A real URL set in the admin is always kept.
//    The navbar/footer "Contact" link opens the Contact page (/contact).
// 2. Homepage anchors: the navbar and footer are shared by every page, so
//    "#how-we-work" becomes "/#how-we-work" and works from a service page
//    too. On the homepage itself the browser just scrolls.
//    "#contact" stays local: every page ends with the contact form.
// 3. Site pages: links named like a standalone page (e.g. "About") open that
//    page (/about, …) instead of the homepage section.

import type { Href, HomepageData, NavChildLink, SiteChrome } from "@/types/homepage";

interface ServicePage {
  /** URL segment under /service/. */
  slug: string;
  /** Link label used on the homepage. */
  label: string;
  /** Service card id on the homepage, without its "-<position>" suffix. */
  cardId: string;
}

/**
 * Service pages the homepage links to by label (navbar, footer, service cards).
 * Pages created in jmt-admin (JMT Service Pages) work without a row here —
 * link to them with their URL, /service/<slug>.
 */
export const SERVICE_PAGES: readonly ServicePage[] = [
  { slug: "site-service-supply", label: "Site labour supply", cardId: "site-labour-supply" },
];

/**
 * Standalone pages the navbar and footer link to by label. A real URL set in
 * the admin is always kept.
 */
export const SITE_PAGES: readonly { path: string; label: string }[] = [
  { path: "about", label: "About" },
  { path: "join-our-crew", label: "Join our crew" },
];

/** Homepage anchor of the old "Join our crew" target (the FAQ's worker tab). */
const JOIN_CREW_HASH = "#join-our-crew";

/** Public URL of a standalone page: "/about", … */
export function sitePagePath(path: string): string {
  return `/${path}`;
}

/** Anchors that exist on every page, so they stay in-page. */
const LOCAL_ANCHORS = new Set(["#contact"]);

export function servicePath(slug: string): string {
  return `/service/${slug}`;
}

/** The Contact page (app/contact). */
export function contactPath(): string {
  return "/contact";
}

/**
 * Navbar/footer links that open the Contact page instead of the homepage's
 * contact form. "Request workers" buttons and other "#contact" links keep
 * going to the form on the page.
 */
const CONTACT_PAGE_LABELS = ["Contact", "Contact us"];

const normalize = (value: string) => value.trim().toLowerCase();

/** True when `label` is `name`, ignoring case and surrounding spaces. */
const labelMatches = (label: string, name: string): boolean => normalize(label) === normalize(name);

/** Empty or an in-page anchor: safe to re-point. Admin-set URLs are not. */
const isAnchorOrEmpty = (href: Href): boolean => href === null || href.startsWith("#");

function homeAnchor(href: Href): Href {
  if (!href || !href.startsWith("#") || href === "#" || LOCAL_ANCHORS.has(href)) return href;
  // "#x" → "/#x".
  return `/${href}`;
}

function mapLink<T extends { label: string; href: Href }>(link: T): T {
  if (!isAnchorOrEmpty(link.href)) return { ...link, href: homeAnchor(link.href) };
  if (CONTACT_PAGE_LABELS.some((name) => labelMatches(link.label, name))) {
    return { ...link, href: contactPath() };
  }
  const sitePage = SITE_PAGES.find((candidate) => labelMatches(link.label, candidate.label));
  if (sitePage) return { ...link, href: sitePagePath(sitePage.path) };
  const page = SERVICE_PAGES.find((candidate) => labelMatches(link.label, candidate.label));
  return { ...link, href: page ? servicePath(page.slug) : homeAnchor(link.href) };
}

/** Navbar and footer links. */
export function mapChromeLinks(chrome: SiteChrome): SiteChrome {
  const mapChildren = (links: NavChildLink[]) => links.map(mapLink);
  return {
    ...chrome,
    nav: chrome.nav.map((item) => ({ ...mapLink(item), children: mapChildren(item.children) })),
    footerColumns: chrome.footerColumns.map((column) => ({ ...column, links: mapChildren(column.links) })),
  };
}

/**
 * Homepage service cards, and the hero's "Join our crew" button (it pointed at
 * the FAQ's worker tab; it now opens the Join our crew page). Other section
 * anchors inside the page stay as they are.
 */
export function mapServiceCards(data: HomepageData): HomepageData {
  const joinHref = data.hero.secondaryHref === JOIN_CREW_HASH ? sitePagePath("join-our-crew") : data.hero.secondaryHref;
  return {
    ...data,
    hero: { ...data.hero, secondaryHref: joinHref },
    services: data.services.map((card) => {
      // Card ids are "<slug of English title>-<position>", e.g. "site-labour-supply-0".
      const slug = card.id.replace(/-\d+$/, "");
      const page = SERVICE_PAGES.find((p) => p.cardId === slug);
      return page && isAnchorOrEmpty(card.href) ? { ...card, href: servicePath(page.slug) } : card;
    }),
  };
}
