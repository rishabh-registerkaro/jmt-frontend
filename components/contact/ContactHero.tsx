import Image from "next/image";
import Link from "next/link";
import type { ContactInfo, HomeImage } from "@/types/homepage";
import type { ContactPageContent } from "@/data/contactPage";
import BusinessCard from "./BusinessCard";
import EnquiryForm from "./EnquiryForm";
import { AccentHeading, Responsive } from "./Responsive";

// Figma "Hero" — desktop 302:50: peach → white wash, 40px top / 88px bottom,
// heading block then the business card (560) and the form side by side.
// Phones (304:44 + 304:54 + 304:145): heading, then the form, then the card,
// 24px apart, 40px bottom.
const cls = {
  section:
    "bg-[linear-gradient(180deg,var(--color-peach-100)_0,#fff_306px)] md:bg-[linear-gradient(180deg,var(--color-peach-100)_0%,#fff_60%)]",
  inner:
    "site-container flex flex-col gap-[24px] pt-[24px] pb-[40px] max-md:px-[20px] md:gap-[40px] md:pt-[40px] md:pb-[72px] lg:pb-[88px]",
  heading: "flex flex-col items-start gap-[14px] md:gap-[16px]",
  crumbs:
    "m-0 flex list-none flex-wrap items-center gap-[8px] p-0 text-[13px] leading-[normal] font-medium text-slate md:gap-[10px] md:text-[14px]",
  crumbLink: "rounded-[4px] text-inherit no-underline focus-ring hover:text-brown hover:underline",
  pill: [
    "m-0 inline-flex items-center gap-[7px] rounded-full border border-sand bg-white py-[6px] pr-[12px] pl-[10px]",
    "text-[11px] leading-[normal] font-semibold tracking-[0.44px] text-brown uppercase",
    "md:gap-[8px] md:py-[7px] md:pr-[14px] md:pl-[12px] md:text-[13px] md:tracking-[0.52px]",
  ].join(" "),
  title: [
    "m-0 max-w-[900px] font-bold text-heading",
    "text-[36px] leading-[41px] tracking-[-0.72px] md:text-[48px] md:leading-[54px] md:tracking-[-1.2px]",
    "lg:text-[56px] lg:leading-[62px] lg:tracking-[-1.4px]",
  ].join(" "),
  subtitle: "m-0 max-w-[720px] text-[15.5px] leading-[25px] text-slate md:text-[18px] md:leading-[29px]",
  // Desktop: card 560 | form fills the rest; both stretch to the taller one.
  row: "grid grid-cols-1 gap-[24px] lg:grid-cols-[minmax(0,560fr)_minmax(0,696fr)] lg:items-stretch",
};

export default function ContactHero({
  page,
  contact,
  photo,
  homeHref,
}: {
  page: ContactPageContent;
  contact: ContactInfo;
  photo: HomeImage;
  homeHref: string;
}) {
  const copy = page.hero;
  return (
    <section className={cls.section} aria-labelledby="contact-hero-title">
      <div className={cls.inner}>
        <div className={cls.heading}>
          <nav aria-label="Breadcrumb">
            <ol className={cls.crumbs}>
              <li>
                <Link href={homeHref} className={cls.crumbLink}>
                  {copy.crumbHome}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-semibold text-brown">
                {copy.crumb}
              </li>
            </ol>
          </nav>
          <p className={`reveal ${cls.pill}`}>
            <Image src="/contact/dot.svg" alt="" width={7} height={7} className="size-[6px] md:size-[7px]" />
            <Responsive desktop={copy.pill.desktop} mobile={copy.pill.mobile} />
          </p>
          <h1 id="contact-hero-title" className={`reveal-clip ${cls.title}`}>
            <AccentHeading heading={copy.title} />
          </h1>
          <p className={`reveal ${cls.subtitle}`} style={{ "--d": "160ms" } as React.CSSProperties}>
            <Responsive desktop={copy.subtitle.desktop} mobile={copy.subtitle.mobile} />
          </p>
        </div>

        <div className={cls.row}>
          {/* Phones show the form first (Figma 304:54), desktop the card first. */}
          <div className="max-lg:order-2 lg:flex lg:flex-col [&>*]:lg:flex-[1_1_auto]" data-reveal="left">
            <BusinessCard copy={page.card} contact={contact} photo={photo} />
          </div>
          <div className="max-lg:order-1" data-reveal="right">
            <EnquiryForm copy={page.form} whatsappHref={contact.whatsappHref} />
          </div>
        </div>
      </div>
    </section>
  );
}
