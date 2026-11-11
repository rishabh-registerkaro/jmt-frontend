import Image from "next/image";
import type { ContactCopy, ContactInfo, HomeImage } from "@/types/homepage";
import Photo from "@/components/common/Photo";
import LeadForm from "./LeadForm";

interface ContactProps {
  contact: ContactInfo;
  image: HomeImage;
  copy: ContactCopy;
}

const cls = {
  card: "flex flex-col overflow-hidden rounded-[20px] bg-brown lg:min-h-[527px]",
  cardBody: [
    "flex flex-[1_1_auto] flex-col justify-end gap-[24px]",
    "px-[24px] py-[28px] md:p-[36px]",
  ].join(" "),
  cardTitle: [
    "m-0 text-white font-semibold",
    "text-[clamp(24px,21.8873239437px+0.5633802817vw,30px)] leading-[1.15] tracking-[-0.6px]",
  ].join(" "),
  row: "flex min-h-[68px] items-center gap-[14px] rounded-[12px] text-inherit no-underline",
  // Only linked rows get the focus ring and the hover underline on the value.
  rowLink: "group/row focus-ring [--focus-color:#fff] [--focus-offset:2px]",
  value: [
    "text-[15.5px] leading-[24.8px] font-semibold text-white wrap-anywhere",
    "group-hover/row:underline group-hover/row:underline-offset-[3px]",
  ].join(" "),
  form: [
    "flex flex-col gap-[20px] xs:gap-[24px] px-[16px] py-[24px] xs:px-[20px] xs:py-[28px] md:p-[37px]",
    "rounded-[20px] border border-card-line bg-white",
    "[filter:drop-shadow(0_30px_30px_rgba(19,53,90,0.35))]", // drop-shadow($shadow-form)
  ].join(" "),
};

export default function Contact({ contact, image, copy }: ContactProps) {
  const whatsappIsExternal = contact.whatsappHref?.startsWith("http") ?? false;

  const channels = [
    {
      key: "call",
      label: copy.labels.call,
      value: contact.phoneDisplay,
      href: contact.phoneHref,
      icon: "/homepage/icon-contact-phone.svg",
      iconSize: 18,
      external: false,
    },
    {
      key: "whatsapp",
      label: copy.labels.whatsapp,
      value: copy.labels.whatsappValue,
      href: contact.whatsappHref,
      icon: "/homepage/icon-contact-chat.svg",
      iconSize: 18,
      external: whatsappIsExternal,
    },
    {
      key: "reply",
      label: copy.labels.reply,
      value: contact.replyTime,
      href: null,
      icon: "/homepage/icon-contact-clock.svg",
      iconSize: 20,
      external: false,
    },
  ];

  return (
    <section id="contact" className="bg-white" aria-labelledby="contact-title">
      <div className="site-container section-pad flex flex-col gap-[24px]">
        <h2 id="contact-title" className="heading-xl">
          {copy.title}
        </h2>

        <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2 lg:items-stretch">
          {/* ── Left: contact card ── */}
          <div className={cls.card}>
            <div className="relative h-[177px] flex-none bg-navy">
              <Photo image={image} sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
            <div className={cls.cardBody}>
              <div className="flex flex-col gap-[8px]">
                <h3 className={cls.cardTitle}>{copy.cardTitle}</h3>
                {copy.cardText && <p className="m-0 text-[15px] leading-[24px] text-mist">{copy.cardText}</p>}
              </div>
              <ul className="border-t border-white/14">
                {channels.map((channel) => {
                  const inner = (
                    <>
                      <span className="flex size-[40px] flex-none items-center justify-center rounded-[12px] bg-white/10">
                        <Image src={channel.icon} alt="" width={channel.iconSize} height={channel.iconSize} />
                      </span>
                      <span className="flex min-w-0 flex-col gap-[2px]">
                        <span className="text-[11.5px] leading-[1.6] font-semibold tracking-[1.4px] text-mist uppercase">
                          {channel.label}
                        </span>
                        <span className={cls.value}>{channel.value}</span>
                      </span>
                    </>
                  );
                  return (
                    <li key={channel.key} className="border-b border-white/14">
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
            </div>
          </div>

          {/* ── Right: requirement form ── */}
          <div className={cls.form}>
            <div className="flex flex-col gap-[4px]">
              <h3 className="m-0 text-[20px] leading-[1.35] xs:text-[22px] xs:leading-[1.6] font-semibold tracking-[-0.4px] text-ink">
                {copy.formTitle}
              </h3>
              {copy.formText && <p className="m-0 text-[14px] leading-[22.4px] text-slate">{copy.formText}</p>}
            </div>
            <LeadForm copy={copy.form} />
          </div>
        </div>
      </div>
    </section>
  );
}
