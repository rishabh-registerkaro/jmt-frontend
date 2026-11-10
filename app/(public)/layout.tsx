import { Manrope, Noto_Sans_Bengali, Noto_Sans_Devanagari } from "next/font/google";
import Navbar from "@/components/homepage/Navbar/Navbar";
import Footer from "@/components/homepage/Footer/Footer";
import LiveRefresh from "@/components/homepage/LiveRefresh";
import { getHomepageVersion, getSiteChrome } from "@/server/homepage";

// Public site shell. The root layout (app/layout.tsx) provides <html>,
// <body> and the global CSS; the public design tokens and shared utilities
// (site-container, btn-primary, heading-xl, …) live in styles/public.css.
// The literal `site` class is the hook for the scroll-padding rule there.

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

// Only used for the two language-switcher labels, so not preloaded.
const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: "600",
  variable: "--font-noto-bengali",
  display: "swap",
  preload: false,
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: "600",
  variable: "--font-noto-devanagari",
  display: "swap",
  preload: false,
});

// Matches HOMEPAGE_REVALIDATE_SECONDS in server/homepage.ts (must be a literal here).
export const revalidate = 600;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [chrome, version] = await Promise.all([getSiteChrome(), getHomepageVersion()]);

  return (
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
        Skip to content
      </a>
      <Navbar links={chrome.nav} contact={chrome.contact} />
      <main id="main" className="block focus:outline-none" tabIndex={-1}>
        {children}
      </main>
      <Footer chrome={chrome} />
      {/* Re-renders the page when the admin saves in /dashboard/homepage. */}
      <LiveRefresh version={version} />
    </div>
  );
}
