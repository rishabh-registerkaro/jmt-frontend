import { breakable } from "@/components/common/BreakableText";
import Image from "next/image";
import { ArrowRight, Clock, FileText, Globe, Mail, MessageCircle, Phone, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import type { ContactInfo, HomeImage } from "@/types/homepage";
import Photo from "@/components/common/Photo";
import type { ContactPageContent } from "@/data/contactPage";
import { Responsive } from "./Responsive";

// Figma "JMT business card" — desktop 302:62 (560 wide, stretches to the form's
// height), phones 304:146. A photo header with the logo chip and company name,
// then the contact rows, proof chips and the hours.
const cls = {
  card: [
    "flex flex-col overflow-hidden rounded-[20px] border border-sand bg-white shadow-[0_12px_30px_rgba(99,36,0,0.08)]",
    "md:rounded-[24px] md:shadow-[0_16px_40px_rgba(99,36,0,0.08)]",
  ].join(" "),
  header: "relative h-[200px] flex-none overflow-hidden md:h-[250px]",
  scrim:
    "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,27,48,0.05)_20%,rgba(8,27,48,0.9)_100%)] md:bg-[linear-gradient(180deg,rgba(8,27,48,0.05)_20%,rgba(8,27,48,0.88)_100%)]",
  logoChip:
    "absolute top-[16px] left-[16px] rounded-[12px] bg-white px-[10px] py-[6px] md:top-[24px] md:left-[24px] md:rounded-[14px] md:px-[12px] md:py-[8px]",
  caption: "absolute inset-x-0 bottom-0 flex flex-col gap-[3px] px-[16px] pb-[16px] md:gap-[4px] md:px-[24px] md:pb-[22px]",
  company: "m-0 text-[17px] leading-[normal] font-bold text-white md:text-[22px]",
  tagline: "m-0 text-[12.5px] leading-[normal] text-white/88 md:text-[14.5px]",
  body: "flex flex-[1_1_auto] flex-col px-[16px] pt-[6px] pb-[16px] md:px-[24px] md:pt-[12px] md:pb-[24px]",
  row: "flex items-center gap-[12px] py-[12px] text-inherit no-underline md:gap-[14px] md:py-[14px]",
  rowLink: "group/row rounded-[12px] focus-ring [--focus-offset:-2px]",
  badge:
    "flex size-[38px] flex-none items-center justify-center rounded-[10px] bg-[rgba(242,105,33,0.12)] md:size-[42px] md:rounded-[12px]",
  badgeIcon: "size-[17px] text-orange md:size-[19px]",
  label: "text-[10.5px] leading-[normal] font-bold tracking-[1.05px] text-slate uppercase md:text-[11px] md:tracking-[1.1px]",
  value: "text-[15px] leading-[normal] font-semibold wrap-anywhere md:text-[16.5px] group-hover/row:underline group-hover/row:underline-offset-[3px]",
  arrow: "hidden size-[32px] flex-none items-center justify-center rounded-full bg-input-bg md:flex",
  chips: "flex flex-wrap gap-[6px] pt-[6px] md:gap-[8px] md:pt-[8px]",
  chip: [
    "flex items-center gap-[5px] rounded-full bg-peach-100 py-[6px] pr-[10px] pl-[8px] text-[11.5px] leading-[normal] font-semibold text-brown",
    "md:gap-[6px] md:py-[7px] md:pr-[12px] md:pl-[10px] md:text-[12.5px]",
  ].join(" "),
  hoursBox:
    "mt-[24px] hidden items-center gap-x-[18px] gap-y-[8px] rounded-[14px] bg-input-bg px-[16px] py-[14px] md:flex md:flex-wrap",
  hoursItem: "flex items-center gap-[8px] text-[13.5px] leading-[normal] font-semibold text-brown",
  hoursLine: "flex items-center gap-[8px] pt-[12px] text-[12.5px] leading-[normal] font-semibold text-brown md:hidden",
};

// Proof chip icons. The CMS stores either a short key ("shield" | "users" |
// "file") or, for documents saved before the switch to Lucide, the old
// "/contact/chip-<key>.svg" path; both resolve to the same icon.
const PROOF_ICONS: Record<string, LucideIcon> = { shield: ShieldCheck, users: Users, file: FileText };

function proofIcon(value: string): LucideIcon {
  const key = value.match(/chip-([a-z]+)\.svg$/)?.[1] ?? value;
  return PROOF_ICONS[key] ?? ShieldCheck;
}

interface Channel {
  key: string;
  label: string;
  value: string;
  href: string | null;
  icon: LucideIcon;
  external?: boolean;
  /** Placeholder values (no link yet) show in orange, as in the design. */
  placeholder: boolean;
}

export default function BusinessCard({
  copy,
  contact,
  photo,
}: {
  copy: ContactPageContent["card"];
  contact: ContactInfo;
  photo: HomeImage;
}) {
  const channels: Channel[] = [
    {
      key: "phone",
      label: copy.labels.phone,
      value: contact.phoneDisplay,
      href: contact.phoneHref,
      icon: Phone,
      placeholder: !contact.phoneHref,
    },
    {
      key: "whatsapp",
      label: copy.labels.whatsapp,
      value: copy.whatsappValue,
      href: contact.whatsappHref,
      icon: MessageCircle,
      external: contact.whatsappHref?.startsWith("http") ?? false,
      placeholder: false,
    },
    {
      key: "email",
      label: copy.labels.email,
      value: contact.emailDisplay,
      href: contact.emailHref,
      icon: Mail,
      placeholder: !contact.emailHref,
    },
    {
      key: "reply",
      label: copy.labels.reply,
      value: contact.replyTime,
      href: null,
      icon: Clock,
      placeholder: false,
    },
  ];

  return (
    <article className={cls.card} aria-label={copy.company}>
      <div className={cls.header}>
        <Photo image={photo} sizes="(min-width: 1024px) 560px, (min-width: 768px) 100vw, 350px" />
        <span className={cls.scrim} aria-hidden="true" />
        <span className={cls.logoChip}>
          {/* Same artwork as the navbar logo (150×52), at 80% / 65%. */}
          <Image
            src="/homepage/logo-header.svg"
            alt=""
            width={150}
            height={52}
            className="h-[33.7px] w-auto md:h-[41.5px]"
          />
        </span>
        <div className={cls.caption}>
          <p className={cls.company}>{copy.company}</p>
          <p className={cls.tagline}>{copy.tagline}</p>
        </div>
      </div>

      <div className={cls.body}>
        <ul className="m-0 list-none p-0">
          {channels.map((channel) => {
            const inner = (
              <>
                <span className={cls.badge}>
                  <channel.icon aria-hidden="true" className={cls.badgeIcon} />
                </span>
                <span className="flex min-w-0 flex-[1_1_0] flex-col gap-px md:gap-[2px]">
                  <span className={cls.label}>{channel.label}</span>
                  <span className={`${cls.value} ${channel.placeholder ? "text-orange" : "text-ink"}`}>
                    {breakable(channel.value)}
                  </span>
                </span>
                {channel.href && (
                  <span className={cls.arrow} aria-hidden="true">
                    <ArrowRight aria-hidden="true" size={14} className="text-ink" />
                  </span>
                )}
              </>
            );
            return (
              <li key={channel.key} className="border-sand not-first:border-t">
                {channel.href ? (
                  <a
                    href={channel.href}
                    className={`${cls.row} ${cls.rowLink}`}
                    {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className={cls.row}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>

        <ul className={`m-0 list-none p-0 ${cls.chips}`}>
          {copy.proofs.map((proof) => {
            const ProofIcon = proofIcon(proof.icon);
            return (
              <li key={proof.label} className={cls.chip}>
                <ProofIcon aria-hidden="true" className="size-[13px] flex-none text-orange md:size-[14px]" />
                {proof.label}
              </li>
            );
          })}
        </ul>

        {/* Desktop: pinned to the bottom of the stretched card. */}
        <div className="hidden flex-[1_1_auto] md:block" aria-hidden="true" />
        <div className={cls.hoursBox}>
          <span className={cls.hoursItem}>
            <Clock aria-hidden="true" size={16} className="flex-none text-brown" />
            {contact.hours}
          </span>
          <span className={cls.hoursItem}>
            <Globe aria-hidden="true" size={16} className="flex-none text-brown" />
            {copy.languages.long}
          </span>
        </div>
        <p className={`m-0 ${cls.hoursLine}`}>
          <Clock aria-hidden="true" className="size-[14px] flex-none text-brown" />
          <span>
            {contact.hours} · <Responsive desktop={copy.languages.long} mobile={copy.languages.short} />
          </span>
        </p>
      </div>
    </article>
  );
}
