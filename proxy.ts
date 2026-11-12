import { NextResponse, type NextRequest } from "next/server";

// Language routing for the homepage (app/[lang]):
//   /bn, /hi   → served as is (Bengali, Hindi)
//   /en[/...]  → redirected to the same path without /en (English lives at "/")
//   /          → the visitor's remembered language (jmt-locale cookie, set by
//                the navbar switcher), else English via an internal rewrite
//   /services, /bn/contact, … → redirected to that homepage section (SECTION_ROUTES)
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
  "site-labour-supply": "services",
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
  about: "about",
  "about-us": "about",
  founder: "about",
  faq: "faq",
  faqs: "faq",
  contact: "contact",
  "contact-us": "contact",
  "request-workers": "contact",
  "get-a-quote": "contact",
  "join-our-crew": "join-our-crew",
  join: "join-our-crew",
  careers: "join-our-crew",
  jobs: "join-our-crew",
};

function firstSegment(pathname: string): string {
  return pathname.split("/")[1] ?? "";
}

/** "/services", "/bn/contact", "/en/faq/" → redirect to that homepage section. */
function sectionRedirect(request: NextRequest): NextResponse | null {
  const parts = request.nextUrl.pathname.split("/").filter(Boolean);
  const locale = parts.length === 2 && (parts[0] === "en" || TRANSLATED.includes(parts[0])) ? parts[0] : null;
  if (parts.length !== (locale ? 2 : 1)) return null;
  const section = SECTION_ROUTES[parts[parts.length - 1].toLowerCase()];
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
    response = NextResponse.redirect(url);
  } else {
    const remembered = request.cookies.get(LOCALE_COOKIE)?.value;
    // GET only: a form/server-action POST to "/" must reach the English page.
    if (request.method === "GET" && pathname === "/" && remembered && TRANSLATED.includes(remembered)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${remembered}`;
      response = NextResponse.redirect(url);
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
