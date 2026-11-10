import Image from "next/image";
import Link from "next/link";
import type { NavChildLink, SiteChrome } from "@/types/homepage";

interface FooterProps {
  chrome: SiteChrome;
}

// footer__link / footer__text share the type; links add hover + focus.
const footerText = "text-[15px] leading-[24px] text-footer-ink wrap-anywhere";
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

export default function Footer({ chrome }: FooterProps) {
  const { contact } = chrome;
  const contactLinks: NavChildLink[] = [
    { label: contact.phoneDisplay, href: contact.phoneHref },
    { label: contact.whatsappDisplay, href: contact.whatsappHref },
    { label: contact.emailDisplay, href: contact.emailHref },
    { label: contact.hours, href: null },
  ];
  const columns = [...chrome.footerColumns, { title: "Contact", links: contactLinks }];

  return (
    <footer className="border-t border-brown/25 bg-white">
      {/* lg top 120px = Figma 88px section padding + 32px inner top padding.
          Brand sits beside the columns only from 1280px (xl); at 1024 it left room
          for just three of the four columns, so "Contact" wrapped onto its own row.
          xl px 104px = 80px gutter + 24px: Figma insets this row inside the 1280px column. */}
      <div
        className={[
          "site-container flex flex-col gap-10 pt-14 pb-12",
          "lg:pt-[120px] lg:pb-[88px] xl:flex-row xl:gap-[50px] xl:px-[104px]",
        ].join(" ")}
      >
        <div className="flex max-w-[320px] flex-col gap-4 xl:flex-[0_0_278px]">
          <Link href="/" className="inline-flex self-start rounded-[8px] focus-ring" aria-label="Joy Maa Tara Bama Kripa — home">
            <Image src="/homepage/logo-footer.svg" alt="" width={269} height={96} className="block h-auto w-[220px] lg:w-[267px]" />
          </Link>
          <p className="m-0 text-[14px] leading-[21.7px] text-footer-ink">{chrome.footerDescription}</p>
        </div>

        {/* xl: beside the brand, equal tracks were narrower than the email address and
            split it mid-word; content-sized flex columns give it the room it needs. */}
        <div
          className={[
            "grid flex-auto grid-cols-1 gap-8 xs:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(160px,1fr))]",
            "xl:flex xl:flex-wrap xl:justify-between",
          ].join(" ")}
        >
          {columns.map((column) => (
            <nav key={column.title} className="flex min-w-0 flex-col gap-4" aria-label={column.title}>
              <h2 className="m-0 text-[16px] leading-[22.4px] font-semibold text-orange">{column.title}</h2>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
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
