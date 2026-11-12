import Image from "next/image";
import { Clock, FileText, MapPin, MessageCircle, Navigation } from "lucide-react";
import type { ContactInfo } from "@/types/homepage";
import { Eyebrow } from "@/components/service/SectionHeader";
import { officeMapsUrl, type ContactPageContent } from "@/data/contactPage";
import { SECTION_ASIDE, SECTION_HEADER, SECTION_TITLE } from "./ContactOptions";
import { AccentHeading } from "./Responsive";

// Figma "Office and company details" — desktop 303:121 (grey band, 80px
// padding, 720×420 map art + office and procurement cards); phones 304:316
// (white, 350×220 map, compact office card, grey procurement panel with
// label-over-value rows). The map is static art until the office address is
// set; "Get directions" opens Google Maps.
const cls = {
  section: "bg-white md:bg-input-bg",
  inner:
    "site-container flex flex-col gap-[14px] pt-[24px] pb-[40px] max-md:px-[20px] md:gap-[32px] md:py-[72px] lg:py-[80px]",
  row: "flex flex-col gap-[14px] md:gap-[24px] lg:flex-row lg:items-start",
  map: "relative h-[220px] flex-none overflow-hidden rounded-[18px] bg-[#f6ede3] md:h-[360px] md:rounded-[24px] lg:h-[420px] lg:w-[56.25%]",
  pinLabel:
    "hidden items-center gap-[8px] rounded-[12px] bg-white py-[8px] pr-[12px] pl-[10px] shadow-[0_14px_36px_rgba(99,36,0,0.07)] md:flex",
  pinBadge: "flex size-[36px] items-center justify-center rounded-full bg-orange md:size-[40px]",
  directions: [
    "absolute bottom-[18px] left-[14px] flex items-center gap-[6px] rounded-button bg-white py-[9px] pr-[14px] pl-[12px]",
    "text-[13px] leading-[normal] font-semibold text-brown no-underline shadow-[0_12px_30px_rgba(99,36,0,0.08)] focus-ring hover:underline",
    "md:bottom-[27px] md:left-[24px] md:gap-[8px] md:py-[11px] md:pr-[18px] md:pl-[16px] md:text-[14px] md:shadow-[0_14px_36px_rgba(99,36,0,0.07)]",
  ].join(" "),
  details: "flex min-w-0 flex-col gap-[14px] md:gap-[16px] lg:flex-[1_1_0]",
  officeCard:
    "flex flex-col gap-[8px] rounded-[16px] border border-sand bg-white p-[16px] md:gap-[12px] md:rounded-[20px] md:p-[24px]",
  officeLabel: "text-[10.5px] leading-[normal] font-bold tracking-[1.05px] text-slate uppercase md:text-[11px] md:tracking-[1.1px]",
  region: "m-0 text-[17px] leading-[normal] font-bold text-ink md:text-[18px]",
  address: "m-0 text-[13.5px] leading-[normal] font-medium md:text-[14.5px]",
  line: "m-0 flex items-center gap-[6px] text-[13px] leading-[normal] font-semibold md:gap-[8px] md:text-[14px]",
  procurement:
    "flex flex-col rounded-[16px] bg-input-bg px-[16px] pt-[14px] pb-[4px] md:rounded-[20px] md:border md:border-sand md:bg-white md:px-[24px] md:pt-[20px] md:pb-[8px]",
  procurementTitle: "m-0 flex items-center gap-[8px] pb-[8px] text-[14.5px] leading-[normal] font-bold text-ink md:gap-[10px] md:pb-[10px] md:text-[16px]",
  detailRow:
    "flex flex-col gap-[2px] border-t border-sand py-[9px] leading-[normal] md:flex-row md:items-start md:justify-between md:gap-[16px] md:py-[11px]",
  detailLabel: "text-[12px] text-slate md:text-[14px]",
  detailValue: "m-0 text-[13.5px] font-semibold md:text-right md:text-[14px]",
};

export default function OfficeDetails({ page, contact }: { page: ContactPageContent; contact: ContactInfo }) {
  const copy = page.office;
  const mapsUrl = officeMapsUrl(page);
  const whatsappExternal = contact.whatsappHref?.startsWith("http") ?? false;

  return (
    <section className={cls.section} aria-labelledby="office-title">
      <div className={cls.inner}>
        <div className={SECTION_HEADER}>
          <div className="flex flex-col gap-[14px] md:gap-[12px] lg:max-w-[760px]" data-reveal="clip">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h2 id="office-title" className={SECTION_TITLE}>
              <AccentHeading heading={copy.title} />
            </h2>
          </div>
          <p className={`${SECTION_ASIDE} max-md:hidden`} data-reveal>
            {copy.intro}
          </p>
        </div>

        <div className={cls.row}>
          <div className={cls.map} data-reveal="zoom">
            {/* Phones use the design's own 350×220 crop of the map art. */}
            <Image src="/contact/m/map-art.svg" alt="" fill sizes="100vw" className="object-cover md:hidden" />
            <Image src="/contact/map-art.svg" alt="" fill sizes="(min-width: 1024px) 720px, 100vw" className="object-cover max-md:hidden" />
            <div className="absolute top-[80px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-[6px] md:top-[33%]">
              <div className={cls.pinLabel}>
                <span className="flex size-[26px] items-center justify-center rounded-[8px] bg-orange text-[9px] leading-[normal] font-bold text-white">
                  JMT
                </span>
                <span className="flex flex-col leading-[normal] whitespace-nowrap">
                  <span className="text-[13px] font-bold text-ink">{copy.pinTitle}</span>
                  <span className={`text-[11.5px] ${copy.address ? "text-slate" : "text-orange"}`}>
                    {copy.address || copy.pinPlaceholder}
                  </span>
                </span>
              </div>
              <span className={cls.pinBadge} aria-hidden="true">
                <MapPin aria-hidden="true" className="size-[18px] text-white md:size-[20px]" />
              </span>
            </div>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={cls.directions}>
              <Navigation aria-hidden="true" className="size-[13px] flex-none text-brown md:size-[15px]" />
              {copy.directions}
            </a>
          </div>

          <div className={cls.details} data-reveal="right">
            <div className={cls.officeCard}>
              <div className="flex items-center gap-[12px]">
                <span className="hidden size-[40px] flex-none items-center justify-center rounded-[12px] bg-[rgba(242,105,33,0.12)] md:flex">
                  <MapPin aria-hidden="true" size={19} className="text-orange" />
                </span>
                <span className="flex flex-col gap-[8px] md:gap-[2px]">
                  <span className={cls.officeLabel}>{copy.officeLabel}</span>
                  <h3 className={cls.region}>{copy.region}</h3>
                </span>
              </div>
              <address className={`${cls.address} not-italic ${copy.address ? "text-ink" : "text-orange"}`}>
                {copy.address || copy.addressPlaceholder}
              </address>
              <p className={`${cls.line} text-brown`}>
                <Clock aria-hidden="true" className="size-[14px] flex-none text-brown md:size-[15px]" />
                {contact.hours}
              </p>
              {contact.whatsappHref && (
                <a
                  href={contact.whatsappHref}
                  className={`${cls.line} hidden w-fit rounded-[4px] text-orange no-underline focus-ring hover:underline md:flex`}
                  {...(whatsappExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <MessageCircle aria-hidden="true" size={15} className="flex-none text-orange" />
                  {copy.whatsapp}
                </a>
              )}
            </div>

            <div className={cls.procurement}>
              <h3 className={cls.procurementTitle}>
                <FileText aria-hidden="true" className="size-[15px] flex-none text-orange md:size-[17px]" />
                {copy.procurementTitle}
              </h3>
              <dl className="m-0">
                {copy.details.map((row) => (
                  <div key={row.label} className={cls.detailRow}>
                    <dt className={cls.detailLabel}>{row.label}</dt>
                    <dd className={`${cls.detailValue} ${row.value ? "text-ink" : "text-orange"}`}>
                      {row.value || copy.toAdd}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
