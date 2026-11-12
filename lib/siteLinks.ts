// Site-wide link mapping applied to the homepage content (from jmt-admin or the
// bundled fallback) before it renders — see server/homepage.ts.
//
// 1. Service pages: homepage links that name a service with its own page
//    (navbar dropdown, footer, service card) open that page instead of an
//    in-page anchor. A real URL set in the admin is always kept.
//    The navbar/footer "Contact" link opens the Contact page (/contact).
// 2. Homepage anchors: the navbar and footer are shared by every page, so
//    "#how-we-work" becomes "/#how-we-work" (or "/bn#…") and works from a
//    service page too. On the homepage itself the browser just scrolls.
//    "#contact" stays local: every page ends with the contact form.
// 3. Site pages: links named like a standalone page (e.g. "About") open that
//    page (/about, /bn/about, …) instead of the homepage section.

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

/**
 * Standalone pages the navbar and footer link to by label (matched in every
 * language, like SERVICE_PAGES). A real URL set in the admin is always kept.
 */
export const SITE_PAGES: readonly { path: string; label: string }[] = [
  { path: "about", label: "About" },
  { path: "join-our-crew", label: "Join our crew" },
];

/** Homepage anchor of the old "Join our crew" target (the FAQ's worker tab). */
const JOIN_CREW_HASH = "#join-our-crew";

/** Public URL of a standalone page: "/about", "/bn/about", … */
export function sitePagePath(lang: SwitcherLanguage, path: string): string {
  return `${lang === "en" ? "" : `/${lang}`}/${path}`;
}

/** Anchors that exist on every page, so they stay in-page. */
const LOCAL_ANCHORS = new Set(["#contact"]);

export function servicePath(lang: SwitcherLanguage, slug: string): string {
  return `${lang === "en" ? "" : `/${lang}`}/service/${slug}`;
}

/** The Contact page (app/[lang]/contact): "/contact", "/bn/contact", "/hi/contact". */
export function contactPath(lang: SwitcherLanguage): string {
  return `${lang === "en" ? "" : `/${lang}`}/contact`;
}

/**
 * Navbar/footer links that open the Contact page instead of the homepage's
 * contact form. Matched by English label in every language. "Request workers"
 * buttons and other "#contact" links keep going to the form on the page.
 */
const CONTACT_PAGE_LABELS = ["Contact", "Contact us"];

const normalize = (value: string) => value.trim().toLowerCase();

function isContactPageLabel(label: string, lang: SwitcherLanguage): boolean {
  const wanted = normalize(label);
  return CONTACT_PAGE_LABELS.some((english) => {
    const names = [english, lang === "en" ? "" : SEED_TRANSLATIONS[lang][english] ?? ""];
    return names.some((name) => name && normalize(name) === wanted);
  });
}

/** True when `label` is `english` or its built-in translation in `lang`. */
function labelMatches(label: string, english: string, lang: SwitcherLanguage): boolean {
  const wanted = normalize(label);
  const names = [english, lang === "en" ? "" : SEED_TRANSLATIONS[lang][english] ?? ""];
  return names.some((name) => name && normalize(name) === wanted);
}

/** The page a link label points to, in any of the three languages. */
function pageForLabel(label: string, lang: SwitcherLanguage): ServicePage | undefined {
  return SERVICE_PAGES.find((page) => labelMatches(label, page.label, lang));
}

/** Empty or an in-page anchor: safe to re-point. Admin-set URLs are not. */
const isAnchorOrEmpty = (href: Href): boolean => href === null || href.startsWith("#");

function homeAnchor(href: Href, lang: SwitcherLanguage): Href {
  if (!href || !href.startsWith("#") || href === "#" || LOCAL_ANCHORS.has(href)) return href;
  // "/" + "#x" → "/#x"; "/bn" + "#x" → "/bn#x".
  return `${localePath(lang)}${href}`;
}

function mapLink<T extends { label: string; href: Href }>(link: T, lang: SwitcherLanguage): T {
  if (isAnchorOrEmpty(link.href) && isContactPageLabel(link.label, lang)) {
    return { ...link, href: contactPath(lang) };
  }
  const sitePage = isAnchorOrEmpty(link.href)
    ? SITE_PAGES.find((candidate) => labelMatches(link.label, candidate.label, lang))
    : undefined;
  if (sitePage) return { ...link, href: sitePagePath(lang, sitePage.path) };
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

/**
 * Homepage service cards, and the hero's "Join our crew" button (it pointed at
 * the FAQ's worker tab; it now opens the Join our crew page). Other section
 * anchors inside the page stay as they are.
 */
export function mapServiceCards(data: HomepageData, lang: SwitcherLanguage): HomepageData {
  const joinHref = data.hero.secondaryHref === JOIN_CREW_HASH ? sitePagePath(lang, "join-our-crew") : data.hero.secondaryHref;
  return {
    ...data,
    hero: { ...data.hero, secondaryHref: joinHref },
    services: data.services.map((card) => {
      // Card ids are "<slug of English title>-<position>", e.g. "site-labour-supply-0".
      const slug = card.id.replace(/-\d+$/, "");
      const page = SERVICE_PAGES.find((p) => p.cardId === slug);
      return page && isAnchorOrEmpty(card.href) ? { ...card, href: servicePath(lang, page.slug) } : card;
    }),
  };
}
