import type { Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { draftMode } from "next/headers";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import Navbar from "@/components/homepage/Navbar/Navbar";
import Footer from "@/components/homepage/Footer/Footer";
import LiveRefresh from "@/components/homepage/LiveRefresh";
import PreviewBar from "@/components/preview/PreviewBar";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { REVEAL_BOOT_SCRIPT } from "@/components/motion/revealBoot";
import { UI_TEXT } from "@/lib/uiText";
import { getHomepageVersion, getSiteChrome } from "@/server/homepage";
import { jsonLdHtml, organizationJsonLd } from "@/lib/seo";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Brand orange (--color-orange in styles/public.css).
  themeColor: "#f26921",
};

// Root document for the public Joy Maa Tara site. The public design tokens and
// utilities (site-container, btn-primary, heading-xl, …) live in
// styles/public.css; the literal `site` class is the hook for the
// scroll-padding rule there.

// Fallback faces only (Tailwind's font-sans/font-mono); page text uses Manrope
// (font-site). Not preloaded, so they don't compete with the LCP image.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap", preload: false });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap", preload: false });

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

// Matches HOMEPAGE_REVALIDATE_SECONDS in server/homepage.ts (must be a literal here).
export const revalidate = 600;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [chrome, version, { isEnabled: previewing }] = await Promise.all([
    getSiteChrome(),
    getHomepageVersion(),
    draftMode(),
  ]);

  return (
    // suppressHydrationWarning: the boot script adds reveal-ready to <html> before hydration.
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Enables entrance/scroll animations before first paint (components/motion/revealBoot.ts). */}
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOT_SCRIPT }} />
        {/* Organization + WebSite: brand, logo, phone and email shown in the navbar/footer. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(organizationJsonLd(chrome))} />
        <div
          className={[
            "site min-h-screen bg-white font-site font-normal text-ink antialiased [text-rendering:optimizeLegibility]",
            manrope.variable,
          ].join(" ")}
        >
          <a
            href="#main"
            className="absolute top-2 left-2 z-61 -translate-y-[200%] rounded-full bg-brown px-4 py-2.5 font-semibold text-white no-underline transition-transform duration-160 focus-visible:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
          >
            {UI_TEXT.skipToContent}
          </a>
          <ScrollReveal />
          <Navbar chrome={chrome} />
          <main id="main" className="block focus:outline-none" tabIndex={-1}>
            {children}
          </main>
          <Footer chrome={chrome} />
          {/* Re-renders the page when the admin saves in /dashboard/homepage. */}
          <LiveRefresh version={version} />
          {/* Unsaved dashboard edits are being previewed (lib/preview.ts). */}
          {previewing && <PreviewBar />}
        </div>
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
