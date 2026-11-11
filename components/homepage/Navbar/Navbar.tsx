import Image from "next/image";
import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n";
import type { SiteChrome } from "@/types/homepage";
import NavMenu from "./NavMenu";

interface NavbarProps {
  chrome: SiteChrome;
  lang: Locale;
  /** "home" in the page language, for the logo link's screen-reader label. */
  homeLabel: string;
}

export default function Navbar({ chrome, lang, homeLabel }: NavbarProps) {
  const { brand, contact, labels, languages, nav } = chrome;
  return (
    <header className="sticky top-0 z-50 border-b border-brown/20 bg-white">
      {/* lg min-height 79px: Figma's 80px frame includes its 1px bottom border. */}
      <div className="site-container flex min-h-[68px] items-center gap-6 lg:min-h-[79px] lg:py-[7px]">
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
            className="block h-auto w-[128px] lg:w-[150px]"
          />
        </Link>
        <NavMenu
          links={nav}
          callHref={contact.phoneHref ?? "#contact"}
          callLabel={labels.callButton}
          languages={languages}
        />
      </div>
    </header>
  );
}
