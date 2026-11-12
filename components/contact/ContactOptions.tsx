import { breakable } from "@/components/common/BreakableText";
import { ArrowRight, Building, Clock, Mail, Phone } from "lucide-react";
import type { ContactInfo } from "@/types/homepage";
import { Eyebrow } from "@/components/service/SectionHeader";
import type { ContactPageContent } from "@/data/contactPage";
import { AccentHeading, Responsive } from "./Responsive";

// Figma "Contact options" — desktop 303:14 (white, 24 top / 80 bottom, three
// cards of 311px in a row); phones 304:238 (grey band, 40px block padding,
// Email + Call side by side and Visit full width, no value or link line).
export const SECTION_TITLE =
  "m-0 font-bold text-heading text-[28px] leading-[32px] tracking-[-0.42px] md:text-[36px] md:leading-[42px] lg:text-[40px] lg:leading-[46px] lg:tracking-[-0.8px]";
export const SECTION_ASIDE = "m-0 text-[16.5px] leading-[26px] text-slate lg:w-[420px] lg:flex-none";
export const SECTION_HEADER = "flex flex-col gap-[14px] md:gap-[16px] lg:flex-row lg:items-end lg:justify-between lg:gap-[40px]";

const cls = {
  section: "bg-input-bg md:bg-white",
  inner:
    "site-container flex flex-col gap-[14px] py-[40px] max-md:px-[20px] md:gap-[32px] md:pt-[24px] md:pb-[72px] lg:pb-[80px]",
  cards: "grid grid-cols-2 gap-[10px] md:grid-cols-3 md:gap-[20px]",
  card: [
    "group/card flex min-w-0 flex-col items-start gap-[8px] rounded-[16px] border border-sand bg-white px-[14px] py-[16px] text-inherit no-underline",
    "md:min-h-[311px] md:gap-[14px] md:rounded-[20px] md:p-[24px] md:shadow-[0_14px_36px_rgba(99,36,0,0.07)]",
    "focus-ring transition-[border-color,box-shadow] duration-160 hover:border-sand-line",
  ].join(" "),
  badge: "flex size-[38px] flex-none items-center justify-center rounded-[11px] bg-orange md:size-[48px] md:rounded-[14px]",
  title: "m-0 text-[16px] leading-[normal] font-bold text-ink md:text-[20px]",
  text: "m-0 text-[12.5px] leading-[18px] text-slate md:max-w-[257px] md:text-[14.5px] md:leading-[22px]",
  value: "hidden text-[15px] leading-[normal] font-semibold wrap-anywhere md:block",
  reply: [
    "flex items-center gap-[5px] text-[11.5px] leading-[normal] font-semibold text-brown",
    "md:gap-[6px] md:rounded-full md:bg-input-bg md:py-[5px] md:pr-[10px] md:pl-[8px] md:text-[12px] md:text-ink",
  ].join(" "),
  link: "hidden items-center gap-[6px] pt-[6px] text-[14.5px] leading-[normal] font-semibold text-orange group-hover/card:underline md:flex",
};

export default function ContactOptions({
  copy,
  office,
  contact,
}: {
  copy: ContactPageContent["options"];
  office: ContactPageContent["office"];
  contact: ContactInfo;
}) {
  const whatsappExternal = contact.whatsappHref?.startsWith("http") ?? false;

  const channels = [
    {
      key: "call",
      ...copy.call,
      icon: Phone,
      value: contact.phoneDisplay,
      placeholder: !contact.phoneHref,
      href: contact.phoneHref ?? "#enquiry",
      external: false,
      order: "max-md:order-2",
    },
    {
      key: "email",
      ...copy.email,
      icon: Mail,
      value: contact.emailDisplay,
      placeholder: !contact.emailHref,
      href: contact.emailHref ?? "#enquiry",
      external: false,
      order: "max-md:order-1",
    },
    {
      key: "visit",
      ...copy.visit,
      icon: Building,
      value: office.address || copy.visit.placeholder,
      placeholder: !office.address,
      // Visits are by appointment: book over WhatsApp, else via the form.
      href: contact.whatsappHref ?? "#enquiry",
      external: whatsappExternal,
      order: "max-md:order-3 max-md:col-span-2",
    },
  ];

  return (
    <section className={cls.section} aria-labelledby="contact-options-title">
      <div className={cls.inner}>
        <div className={SECTION_HEADER}>
          <div className="flex flex-col gap-[14px] md:gap-[12px] lg:max-w-[760px]" data-reveal="clip">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h2 id="contact-options-title" className={SECTION_TITLE}>
              <AccentHeading heading={copy.title} />
            </h2>
          </div>
          <p className={`${SECTION_ASIDE} max-md:text-[14.5px] max-md:leading-[22px]`} data-reveal>
            {copy.intro}
            <span className="max-md:hidden"> {copy.languages}</span>
          </p>
        </div>

        <ul className={`m-0 list-none p-0 ${cls.cards}`} data-reveal-stagger>
          {channels.map((channel, i) => (
            <li key={channel.key} className={`flex ${channel.order}`} style={{ "--i": i } as React.CSSProperties}>
              <a
                href={channel.href}
                className={`${cls.card} w-full`}
                {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <span className={cls.badge}>
                  <channel.icon aria-hidden="true" className="size-[18px] text-white md:size-[22px]" />
                </span>
                <span className={cls.title}>{channel.title}</span>
                <span className={cls.text}>
                  <Responsive desktop={channel.text.desktop} mobile={channel.text.mobile} />
                </span>
                <span className={`${cls.value} ${channel.placeholder ? "text-orange" : "text-ink"}`}>{breakable(channel.value)}</span>
                <span className={cls.reply}>
                  <Clock aria-hidden="true" className="size-[12px] flex-none text-orange md:size-[13px]" />
                  <Responsive desktop={channel.reply.desktop} mobile={channel.reply.mobile} />
                </span>
                <span className={cls.link} aria-hidden="true">
                  {channel.link}
                  <ArrowRight aria-hidden="true" size={15} className="flex-none text-orange" />
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="m-0 text-[13px] leading-[normal] font-medium text-slate md:hidden">{copy.languages}</p>
      </div>
    </section>
  );
}
