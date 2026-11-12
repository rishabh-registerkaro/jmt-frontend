import Image from "next/image";
import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n";
import type { NavChildLink, SiteChrome } from "@/types/homepage";

interface FooterProps {
  chrome: SiteChrome;
  lang: Locale;
  /** "home" in the page language, for the logo link's screen-reader label. */
  homeLabel: string;
}

// footer__link / footer__text share the type; links add hover + focus.
const footerText = "text-[14px] leading-[19px] text-ink wrap-anywhere md:text-[15px] md:leading-[24px] md:text-footer-ink";
const footerLink = `${footerText} rounded-[4px] no-underline hover:text-orange focus-ring`;

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function FooterLink({ link }: { link: NavChildLink }) {
  if (!link.href) return <span className={footerText}>{link.label}</span>;
  return (
    <a
      href={link.href}
      className={footerLink}
      {...(isExternal(link.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {link.label}
    </a>
  );
}

export default function Footer({ chrome, lang, homeLabel }: FooterProps) {
  const { contact } = chrome;
  const contactLinks: NavChildLink[] = [
    { label: contact.phoneDisplay, href: contact.phoneHref },
    { label: contact.whatsappDisplay, href: contact.whatsappHref },
    { label: contact.emailDisplay, href: contact.emailHref },
    { label: contact.hours, href: null },
  ].filter((link) => link.label);
  const columns = [...chrome.footerColumns, { title: chrome.labels.footerContactTitle, links: contactLinks }];

  return (
    // Phones: 74px bottom padding keeps the copyright clear of the fixed MobileBar.
    <footer className="border-t border-sand bg-white max-md:pb-[74px] md:border-brown/25">
      {/* lg top 120px = Figma 88px section padding + 32px inner top padding.
          Brand sits beside the columns only from 1280px (xl); at 1024 it left room
          for just three of the four columns, so "Contact" wrapped onto its own row.
          xl px 104px = 80px gutter + 24px: Figma insets this row inside the 1280px column. */}
      <div
        className={[
          "site-container flex flex-col gap-7 pt-10 pb-9 md:gap-10 md:pt-14 md:pb-12",
          "lg:pt-[120px] lg:pb-[88px] xl:flex-row xl:gap-[50px] xl:px-[104px]",
        ].join(" ")}
      >
        <div className="flex max-w-[330px] flex-col gap-7 md:max-w-[320px] md:gap-4 xl:flex-[0_0_278px]" data-reveal>
          <Link
            href={localePath(lang)}
            className="notranslate inline-flex self-start rounded-[8px] focus-ring"
            translate="no"
            aria-label={`${chrome.brand.name || chrome.brand.footerLogo.alt} — ${homeLabel}`}
          >
            <Image src={chrome.brand.footerLogo.src} alt="" width={chrome.brand.footerLogo.width} height={chrome.brand.footerLogo.height} className="block h-auto w-[150px] md:w-[220px] lg:w-[267px]" />
          </Link>
          <p className="m-0 text-[14px] leading-[22px] text-slate md:leading-[21.7px] md:text-footer-ink">
            {chrome.footerDescription}
          </p>
        </div>

        {/* xl: beside the brand, equal tracks were narrower than the email address and
            split it mid-word; content-sized flex columns give it the room it needs. */}
        <div
          className={[
            // Phones: link columns in pairs, the contact column on its own row.
            "grid flex-auto grid-cols-2 gap-x-5 gap-y-7 md:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] md:gap-8",
            "xl:flex xl:flex-wrap xl:justify-between",
          ].join(" ")}
          data-reveal-stagger
        >
          {columns.map((column) => (
            <nav
              key={column.title}
              className="flex min-w-0 flex-col gap-[10px] max-md:last:col-span-2 md:gap-4"
              aria-label={column.title}
            >
              <h2 className="m-0 text-[14px] leading-[19px] font-bold text-orange md:text-[16px] md:leading-[22.4px] md:font-semibold">
                {column.title}
              </h2>
              <ul className="flex flex-col gap-[10px] md:gap-3">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`} className="flex">
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {chrome.copyright && (
        <div className="site-container border-t border-card-line-soft pt-5 pb-7">
          <p className="m-0 text-[13px] leading-[20px] text-slate">{chrome.copyright}</p>
        </div>
      )}
    </footer>
  );
}
