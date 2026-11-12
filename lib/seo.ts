// Page metadata and JSON-LD for every public page, so each one gets the same
// complete set: absolute canonical, og:url/og:locale, Twitter card, and
// noindex on Vercel previews. Page-level `openGraph` replaces the layout's
// (Next merges metadata shallowly), so pages must build theirs here rather
// than inherit.

import type { Metadata } from "next";
import { IS_NON_PRODUCTION_DEPLOY, SITE_URL, absoluteUrl } from "@/lib/site";
import type { ContactInfo, SiteChrome } from "@/types/homepage";

export interface PageSeo {
  /** Public path of this page: "/", "/about", … */
  path: string;
  title: string;
  description: string;
  image?: { src: string; width?: number; height?: number; alt?: string };
  siteName?: string;
}

export function pageMetadata({ path, title, description, image, siteName }: PageSeo): Metadata {
  const url = absoluteUrl(path);
  const images = image
    ? [{ url: absoluteUrl(image.src), width: image.width, height: image.height, alt: image.alt || title }]
    : undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName,
      locale: "en_IN",
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: images?.map((i) => i.url),
    },
    ...(IS_NON_PRODUCTION_DEPLOY ? { robots: { index: false, follow: false } } : {}),
  };
}

// ── JSON-LD ──────────────────────────────────────────────────────────────────
// Only facts that are visible on the page (brand, logo, phone, email from the
// navbar/footer/contact blocks; breadcrumb labels from the visible breadcrumb).

const stripScheme = (href: string | null, scheme: string) =>
  href && href.toLowerCase().startsWith(scheme) ? href.slice(scheme.length).split("?")[0] : null;

const ORG_ID = `${SITE_URL}/#organization`;

export function organizationJsonLd(chrome: SiteChrome) {
  const contact: ContactInfo = chrome.contact;
  const telephone = stripScheme(contact.phoneHref, "tel:");
  const email = stripScheme(contact.emailHref, "mailto:");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: chrome.brand.name,
        url: `${SITE_URL}/`,
        logo: absoluteUrl(chrome.brand.headerLogo.src),
        ...(telephone || email
          ? {
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                ...(telephone ? { telephone } : {}),
                ...(email ? { email } : {}),
                availableLanguage: ["en", "bn", "hi"],
              },
            }
          : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: chrome.brand.name,
        publisher: { "@id": ORG_ID },
        inLanguage: "en",
      },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceJsonLd({ name, description, path, image }: { name: string; description: string; path: string; image?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: absoluteUrl(path),
    ...(image ? { image: absoluteUrl(image) } : {}),
    provider: { "@id": ORG_ID },
  };
}

/** Serialize for <script type="application/ld+json"> without allowing "</script>" breakouts. */
export const jsonLdHtml = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
