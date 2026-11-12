import Image from "next/image";
import Link from "next/link";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { contactPath } from "@/lib/siteLinks";
import type { SiteChrome } from "@/types/homepage";
import NavMenu from "./NavMenu";

interface NavbarProps {
  chrome: SiteChrome;
  lang: Locale;
  /** "home" in the page language, for the logo link's screen-reader label. */
  homeLabel: string;
}

export default function Navbar({ chrome, lang, homeLabel }: NavbarProps) {
  const { brand, languages, nav } = chrome;
  // The orange button opens the Contact page, so the menu doesn't repeat a
  // "Contact" link (lib/siteLinks.ts points it at the same URL).
  const contactHref = contactPath(lang);
  const menuLinks = nav.filter((link) => link.href !== contactHref);
  return (
    <header className="sticky top-0 z-50 border-b border-[#f1e3d3] bg-white lg:border-brown/20">
      {/* Mobile (Figma "Homepage — Mobile 390"): 16px gutters, 10px block padding.
          lg min-height 79px: Figma's 80px frame includes its 1px bottom border. */}
      <div className="site-container relative flex min-h-[63px] items-center gap-2 py-[10px] max-md:px-4 md:min-h-[68px] md:gap-6 md:py-0 lg:min-h-[79px] lg:py-[7px]">
        {/* The brand name is never translated (translate="no" for browser translators too). */}
        <Link
          href={localePath(lang)}
          className="notranslate focus-ring inline-flex flex-none rounded-[8px]"
          translate="no"
          aria-label={`${brand.name || brand.headerLogo.alt} — ${homeLabel}`}
        >
          <Image
            src={brand.headerLogo.src}
            alt=""
            width={brand.headerLogo.width}
            height={brand.headerLogo.height}
            priority
            className="block h-auto w-[123px] md:w-[128px] lg:w-[150px]"
          />
        </Link>
        <NavMenu
          links={menuLinks}
          ctaHref={contactHref}
          ctaLabel={getDictionary(lang).nav.contactButton}
          languages={languages}
        />
      </div>
    </header>
  );
}
