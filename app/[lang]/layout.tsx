import type { Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Manrope, Noto_Sans_Bengali, Noto_Sans_Devanagari } from "next/font/google";
import Navbar from "@/components/homepage/Navbar/Navbar";
import Footer from "@/components/homepage/Footer/Footer";
import LiveRefresh from "@/components/homepage/LiveRefresh";
import PreviewBar from "@/components/preview/PreviewBar";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { REVEAL_BOOT_SCRIPT } from "@/components/motion/revealBoot";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { LOCALES, getDictionary, hasLocale } from "@/lib/i18n";
import { getHomepageVersion, getSiteChrome } from "@/server/homepage";
import { jsonLdHtml, organizationJsonLd } from "@/lib/seo";
import "../globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Brand orange (--color-orange in styles/public.css).
  themeColor: "#f26921",
};

// Root document for the public Joy Maa Tara homepage, one per language:
// "/" (English — proxy.ts rewrites it to /en), "/bn" and "/hi". The server
// renders <html lang> and the translated copy, so there is no flash of
// English and no client-side swap. The public design tokens and utilities
// (site-container, btn-primary, heading-xl, …) live in styles/public.css; the
// literal `site` class is the hook for the scroll-padding rule there.

// Fallback faces only (Tailwind's font-sans/font-mono); page text uses Manrope
// (font-site). Not preloaded, so they don't compete with the LCP image.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap", preload: false });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap", preload: false });

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

// Body font on /bn and /hi (styles/public.css), and the switcher labels
// everywhere. Not preloaded: the browser only downloads a script's font
// files when its glyphs appear, so English visitors fetch almost nothing.
const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-bengali",
  display: "swap",
  preload: false,
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-devanagari",
  display: "swap",
  preload: false,
});

// Matches HOMEPAGE_REVALIDATE_SECONDS in server/homepage.ts (must be a literal here).
export const revalidate = 600;
// Only the three languages exist; anything else is a 404 (app/global-not-found.tsx).
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [chrome, version, { isEnabled: previewing }] = await Promise.all([
    getSiteChrome(lang),
    getHomepageVersion(lang),
    draftMode(),
  ]);
  const t = getDictionary(lang);

  return (
    // suppressHydrationWarning: the boot script adds reveal-ready to <html> before hydration.
    <html lang={lang} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Enables entrance/scroll animations before first paint (components/motion/revealBoot.ts). */}
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOT_SCRIPT }} />
        {/* Organization + WebSite: brand, logo, phone and email shown in the navbar/footer. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(organizationJsonLd(chrome))} />
        <LanguageProvider locale={lang}>
          <div
            className={[
              "site min-h-screen bg-white font-site font-normal text-ink antialiased [text-rendering:optimizeLegibility]",
              manrope.variable,
              notoBengali.variable,
              notoDevanagari.variable,
            ].join(" ")}
          >
            <a
              href="#main"
              className="absolute top-2 left-2 z-61 -translate-y-[200%] rounded-full bg-brown px-4 py-2.5 font-semibold text-white no-underline transition-transform duration-160 focus-visible:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
            >
              {t.skipToContent}
            </a>
            <ScrollReveal />
            <Navbar chrome={chrome} lang={lang} homeLabel={t.nav.home} />
            <main id="main" className="block focus:outline-none" tabIndex={-1}>
              {children}
            </main>
            <Footer chrome={chrome} lang={lang} homeLabel={t.nav.home} />
            {/* Re-renders the page when the admin saves in /dashboard/homepage. */}
            <LiveRefresh version={version} />
            {/* Unsaved dashboard edits are being previewed (lib/preview.ts). */}
            {previewing && <PreviewBar />}
          </div>
        </LanguageProvider>
        {/* Real-user traffic and Core Web Vitals (Vercel dashboard). Off elsewhere: the scripts live on Vercel. */}
        {process.env.VERCEL && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
