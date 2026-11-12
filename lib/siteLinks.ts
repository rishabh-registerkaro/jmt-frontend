// Site-wide link mapping applied to the homepage content (from jmt-admin or the
// bundled fallback) before it renders — see server/homepage.ts.
//
// 1. Service pages: homepage links that name a service with its own page
//    (navbar dropdown, footer, service card) open that page instead of an
//    in-page anchor. A real URL set in the admin is always kept.
// 2. Homepage anchors: the navbar and footer are shared by every page, so
//    "#how-we-work" becomes "/#how-we-work" (or "/bn#…") and works from a
//    service page too. On the homepage itself the browser just scrolls.
//    "#contact" stays local: every page ends with the contact form.

import { SEED_TRANSLATIONS } from "@/data/homepageTranslations";
import { localePath } from "@/lib/i18n";
import type { Href, HomepageData, NavChildLink, SiteChrome, SwitcherLanguage } from "@/types/homepage";

interface ServicePage {
  /** URL segment under /service/. */
  slug: string;
  /** English link label used on the homepage (matched in every language). */
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

/** Anchors that exist on every page, so they stay in-page. */
const LOCAL_ANCHORS = new Set(["#contact"]);

export function servicePath(lang: SwitcherLanguage, slug: string): string {
  return `${lang === "en" ? "" : `/${lang}`}/service/${slug}`;
}

const normalize = (value: string) => value.trim().toLowerCase();

/** The page a link label points to, in any of the three languages. */
function pageForLabel(label: string, lang: SwitcherLanguage): ServicePage | undefined {
  const wanted = normalize(label);
  return SERVICE_PAGES.find((page) => {
    const names = [page.label, lang === "en" ? "" : SEED_TRANSLATIONS[lang][page.label] ?? ""];
    return names.some((name) => name && normalize(name) === wanted);
  });
}

/** Empty or an in-page anchor: safe to re-point. Admin-set URLs are not. */
const isAnchorOrEmpty = (href: Href): boolean => href === null || href.startsWith("#");

function homeAnchor(href: Href, lang: SwitcherLanguage): Href {
  if (!href || !href.startsWith("#") || href === "#" || LOCAL_ANCHORS.has(href)) return href;
  // "/" + "#x" → "/#x"; "/bn" + "#x" → "/bn#x".
  return `${localePath(lang)}${href}`;
}

function mapLink<T extends { label: string; href: Href }>(link: T, lang: SwitcherLanguage): T {
  const page = isAnchorOrEmpty(link.href) ? pageForLabel(link.label, lang) : undefined;
  return { ...link, href: page ? servicePath(lang, page.slug) : homeAnchor(link.href, lang) };
}

/** Navbar and footer links. */
export function mapChromeLinks(chrome: SiteChrome, lang: SwitcherLanguage): SiteChrome {
  const mapChildren = (links: NavChildLink[]) => links.map((link) => mapLink(link, lang));
  return {
    ...chrome,
    nav: chrome.nav.map((item) => ({ ...mapLink(item, lang), children: mapChildren(item.children) })),
    footerColumns: chrome.footerColumns.map((column) => ({ ...column, links: mapChildren(column.links) })),
  };
}

/** Homepage service cards. (Section anchors inside the page stay as they are.) */
export function mapServiceCards(data: HomepageData, lang: SwitcherLanguage): HomepageData {
  return {
    ...data,
    services: data.services.map((card) => {
      // Card ids are "<slug of English title>-<position>", e.g. "site-labour-supply-0".
      const slug = card.id.replace(/-\d+$/, "");
      const page = SERVICE_PAGES.find((p) => p.cardId === slug);
      return page && isAnchorOrEmpty(card.href) ? { ...card, href: servicePath(lang, page.slug) } : card;
    }),
  };
}
