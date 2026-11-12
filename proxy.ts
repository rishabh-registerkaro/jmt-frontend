import { NextResponse, type NextRequest } from "next/server";

// Language routing for the homepage (app/[lang]):
//   /bn, /hi   → served as is (Bengali, Hindi)
//   /en[/...]  → redirected to the same path without /en (English lives at "/")
//   /          → the visitor's remembered language (jmt-locale cookie, set by
//                the navbar switcher), else English via an internal rewrite
//   /services, /bn/faq, … → redirected to that homepage section (SECTION_ROUTES)
//   /contact-us → /contact, the Contact page (PAGE_ALIASES)
//   /about-us   → /about, the About page (PAGE_ALIASES)
//   /join, /careers, /jobs → /join-our-crew, the Join our crew page (PAGE_ALIASES)
//   /site-labour-supply → /service/site-service-supply (PAGE_ALIASES)
//   /sitemap.xml, /robots.txt → app/sitemap.ts, app/robots.ts (not matched here)
//   /anything  → rewritten under /en, so unknown paths 404 normally
//
// Kept self-contained (no app imports), as the proxy docs recommend. The
// language list must match SWITCHER_LANGUAGES in types/homepage.ts.

const TRANSLATED = ["bn", "hi"];
const LOCALE_COOKIE = "jmt-locale";
// Left over from the old Google Website Translator switcher; unused now, so
// clear it for returning visitors.
const LEGACY_COOKIE = "googtrans";

// Friendly URLs → homepage sections. "/services", "/bn/services" and
// "/en/services" redirect to "/#services", "/bn#services" and "/#services".
// Keys are the URL slug (lower case, no slashes); values are the section ids
// rendered by components/homepage (and JOIN_CREW_ANCHOR for "join-our-crew").
// Temporary (307) redirects, so a slug can later become a real page without
// browsers having cached the redirect.
const SECTION_ROUTES: Record<string, string> = {
  services: "services",
  // "/service" without a slug: the services list on the homepage.
  service: "services",
  "supervision-and-compliance": "services",
  sites: "sites",
  "sites-we-staff": "sites",
  "why-us": "why-us",
  "why-choose-us": "why-us",
  trades: "trades",
  "trades-we-supply": "trades",
  "our-team": "trades",
  "how-we-work": "how-we-work",
  process: "how-we-work",
  // "/about" is its own page (app/[lang]/about); "/about-us" goes there too (below).
  founder: "about",
  faq: "faq",
  faqs: "faq",
  // "contact" is a real page now (app/[lang]/contact); "contact-us" redirects there below.
  "request-workers": "contact",
  "get-a-quote": "contact",
  // "join-our-crew" is a real page now (app/[lang]/join-our-crew); join/careers/jobs redirect there below.
};

// Friendly URLs → real pages: "/contact-us" → "/contact", "/bn/contact-us" → "/bn/contact".
// Values are paths without the language prefix.
const PAGE_ALIASES: Record<string, string> = {
  "contact-us": "contact",
  "about-us": "about",
  join: "join-our-crew",
  careers: "join-our-crew",
  jobs: "join-our-crew",
  // Service pages by their homepage name (lib/siteLinks.ts SERVICE_PAGES).
  "site-labour-supply": "service/site-service-supply",
  "site-service-supply": "service/site-service-supply",
  "labour-supply": "service/site-service-supply",
};

function firstSegment(pathname: string): string {
  return pathname.split("/")[1] ?? "";
}

/** "/services", "/bn/contact", "/en/faq/" → redirect to that homepage section. */
function sectionRedirect(request: NextRequest): NextResponse | null {
  const parts = request.nextUrl.pathname.split("/").filter(Boolean);
  const locale = parts.length === 2 && (parts[0] === "en" || TRANSLATED.includes(parts[0])) ? parts[0] : null;
  if (parts.length !== (locale ? 2 : 1)) return null;
  const slug = parts[parts.length - 1].toLowerCase();
  const page = PAGE_ALIASES[slug];
  if (page) {
    const url = request.nextUrl.clone();
    url.pathname = locale && locale !== "en" ? `/${locale}/${page}` : `/${page}`;
    // Legacy URLs moved for good: permanent, so search engines pass their
    // signals to the new page.
    return NextResponse.redirect(url, 308);
  }
  const section = SECTION_ROUTES[slug];
  if (!section) return null;

  const url = request.nextUrl.clone();
  url.pathname = locale && locale !== "en" ? `/${locale}` : "/";
  url.hash = section;
  return NextResponse.redirect(url, 307);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = firstSegment(pathname);
  let response: NextResponse;

  const toSection = request.method === "GET" || request.method === "HEAD" ? sectionRedirect(request) : null;

  if (toSection) {
    response = toSection;
  } else if (TRANSLATED.includes(segment)) {
    response = NextResponse.next();
  } else if (segment === "en") {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    // English lives without a prefix: /en/* is a permanent duplicate.
    response = NextResponse.redirect(url, 308);
  } else {
    const remembered = request.cookies.get(LOCALE_COOKIE)?.value;
    // GET only: a form/server-action POST to "/" must reach the English page.
    if (request.method === "GET" && pathname === "/" && remembered && TRANSLATED.includes(remembered)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${remembered}`;
      // Temporary and per-visitor (crawlers send no cookie and get English):
      // never let a CDN or browser cache reuse it for someone else.
      response = NextResponse.redirect(url, 307);
      response.headers.set("Cache-Control", "private, no-store");
      response.headers.set("Vary", "Cookie");
    } else {
      const url = request.nextUrl.clone();
      url.pathname = `/en${pathname === "/" ? "" : pathname}`;
      response = NextResponse.rewrite(url);
    }
  }

  if (request.cookies.has(LEGACY_COOKIE)) response.cookies.delete(LEGACY_COOKIE);
  return response;
}

export const config = {
  // Everything except API routes, Next internals and files with an extension
  // (images, fonts, robots.txt, …).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
