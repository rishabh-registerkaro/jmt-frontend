import { NextResponse, type NextRequest } from "next/server";

// URL clean-up in front of the app:
//   /en, /bn, /hi[/...] → the same path without the prefix (the site used to be
//                         served in English, Bengali and Hindi; it is English
//                         only now, so old links and search results still land)
//   /services, /faq, … → redirected to that homepage section (SECTION_ROUTES)
//   /contact-us → /contact, the Contact page (PAGE_ALIASES)
//   /about-us   → /about, the About page (PAGE_ALIASES)
//   /join, /careers, /jobs → /join-our-crew, the Join our crew page (PAGE_ALIASES)
//   /site-labour-supply → /service/site-service-supply (PAGE_ALIASES)
//   /sitemap.xml, /robots.txt → app/sitemap.ts, app/robots.ts (not matched here)
//
// Kept self-contained (no app imports), as the proxy docs recommend.

/** Language prefixes of the old multilingual site. */
const OLD_LOCALES = new Set(["en", "bn", "hi"]);
// Cookies left over from the old language switchers (the jmt-locale navbar
// switcher and, before it, Google Website Translator); clear them for
// returning visitors.
const LEGACY_COOKIES = ["jmt-locale", "googtrans"];

// Friendly URLs → homepage sections. "/services" redirects to "/#services".
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
  // "/about" is its own page (app/about); "/about-us" goes there too (below).
  founder: "about",
  faq: "faq",
  faqs: "faq",
  // "contact" is a real page now (app/contact); "contact-us" redirects there below.
  "request-workers": "contact",
  "get-a-quote": "contact",
  // "join-our-crew" is a real page now (app/join-our-crew); join/careers/jobs redirect there below.
};

// Friendly URLs → real pages: "/contact-us" → "/contact".
// Values are paths without the leading slash.
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

/** "/services", "/contact-us", … → redirect to that homepage section or page. */
function friendlyRedirect(request: NextRequest, pathname: string): NextResponse | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length !== 1) return null;
  const slug = parts[0].toLowerCase();
  const page = PAGE_ALIASES[slug];
  if (page) {
    const url = request.nextUrl.clone();
    url.pathname = `/${page}`;
    // Legacy URLs moved for good: permanent, so search engines pass their
    // signals to the new page.
    return NextResponse.redirect(url, 308);
  }
  const section = SECTION_ROUTES[slug];
  if (!section) return null;

  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.hash = section;
  return NextResponse.redirect(url, 307);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isGet = request.method === "GET" || request.method === "HEAD";
  let response: NextResponse | null = null;

  if (isGet) {
    // "/bn/contact-us" → "/contact-us" → "/contact": strip the old prefix
    // first, then resolve aliases, so it's a single redirect.
    const prefix = pathname.split("/")[1] ?? "";
    const rest = OLD_LOCALES.has(prefix) ? pathname.slice(prefix.length + 1) || "/" : null;
    response = friendlyRedirect(request, rest ?? pathname);
    if (!response && rest !== null) {
      const url = request.nextUrl.clone();
      url.pathname = rest;
      response = NextResponse.redirect(url, 308);
    }
  }

  response ??= NextResponse.next();
  for (const name of LEGACY_COOKIES) {
    if (request.cookies.has(name)) response.cookies.delete(name);
  }
  return response;
}

export const config = {
  // Everything except API routes, Next internals and files with an extension
  // (images, fonts, robots.txt, …).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
