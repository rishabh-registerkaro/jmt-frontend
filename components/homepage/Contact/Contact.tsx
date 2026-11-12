import Image from "next/image";
import type { ContactCopy, ContactInfo, HomeImage } from "@/types/homepage";
import Photo from "@/components/common/Photo";
import LeadForm from "./LeadForm";

interface ContactProps {
  contact: ContactInfo;
  image: HomeImage;
  copy: ContactCopy;
}

// Mobile (<768, Figma "Homepage — Mobile 390"): the contact card is a photo
// panel with the copy over a navy wash; the form card is flat with a soft shadow.
const cls = {
  card: "relative flex flex-col overflow-hidden rounded-[18px] bg-navy md:rounded-[20px] md:bg-brown lg:min-h-[527px]",
  // The card stretches to the form's height on desktop (and grows when the
  // form shows validation errors). The photo takes all of that extra height
  // so the copy below stays compact instead of leaving an empty brown gap.
  media: "bg-navy max-md:absolute max-md:inset-0 md:relative md:min-h-[177px] md:flex-[1_1_177px]",
  wash: "pointer-events-none absolute inset-0 bg-[rgba(8,27,48,0.55)] md:hidden",
  cardBody: [
    "relative z-1 flex flex-none flex-col gap-[14px] px-[20px] py-[22px]",
    "md:gap-[24px] md:p-[36px]",
  ].join(" "),
  cardTitle: [
    "m-0 text-white font-bold text-[22px] leading-[30px]",
    "md:font-semibold md:text-[clamp(24px,21.8873239437px+0.5633802817vw,30px)] md:leading-[1.15] md:tracking-[-0.6px]",
  ].join(" "),
  row: "flex min-h-[40px] items-center gap-[12px] rounded-[12px] text-inherit no-underline md:min-h-[68px] md:gap-[14px]",
  // Only linked rows get the focus ring and the hover underline on the value.
  rowLink: "group/row focus-ring [--focus-color:#fff] [--focus-offset:2px]",
  value: [
    "text-[15px] leading-[20px] font-semibold text-white wrap-anywhere md:text-[15.5px] md:leading-[24.8px]",
    "group-hover/row:underline group-hover/row:underline-offset-[3px]",
  ].join(" "),
  form: [
    "flex flex-col gap-[16px] px-[20px] py-[22px] md:gap-[24px] md:p-[37px]",
    "rounded-[18px] border border-sand bg-white shadow-[0_12px_30px_rgba(8,26,48,0.08)]",
    "md:rounded-[20px] md:border-card-line md:shadow-none md:[filter:drop-shadow(0_30px_30px_rgba(19,53,90,0.35))]", // drop-shadow($shadow-form)
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
      <div className="site-container section-pad flex flex-col gap-[24px] max-md:pt-6">
        <h2 id="contact-title" className="heading-xl" data-reveal="clip">
          {copy.title}
        </h2>

        <div className="grid grid-cols-1 gap-[24px] md:gap-[20px] lg:grid-cols-2 lg:items-stretch">
          {/* ── Left: contact card ── */}
          <div className={cls.card} data-reveal="left">
            <div className={cls.media}>
              <Photo image={image} sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
            <span className={cls.wash} aria-hidden="true" />
            <div className={cls.cardBody}>
              <div className="flex flex-col gap-[14px] md:gap-[8px]">
                <h3 className={cls.cardTitle}>{copy.cardTitle}</h3>
                {copy.cardText && (
                  <p className="m-0 text-[14px] leading-[19px] text-white/85 md:text-[15px] md:leading-[24px] md:text-mist">
                    {copy.cardText}
                  </p>
                )}
              </div>
              <ul className="flex flex-col gap-[14px] md:block md:border-t md:border-white/14">
                {channels.map((channel) => {
                  const inner = (
                    <>
                      <span className="flex size-[40px] flex-none items-center justify-center rounded-full bg-white/12 md:rounded-[12px] md:bg-white/10">
                        <Image
                          src={channel.icon}
                          alt=""
                          width={channel.iconSize}
                          height={channel.iconSize}
                          className="max-md:size-[18px]"
                        />
                      </span>
                      <span className="flex min-w-0 flex-col gap-px md:gap-[2px]">
                        <span className="text-[11.5px] leading-[16px] font-normal text-white/75 md:leading-[1.6] md:font-semibold md:tracking-[1.4px] md:text-mist md:uppercase">
                          {channel.label}
                        </span>
                        <span className={cls.value}>{channel.value}</span>
                      </span>
                    </>
                  );
                  return (
                    <li key={channel.key} className="md:border-b md:border-white/14">
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
          <div className={cls.form} data-reveal="right">
            <div className="flex flex-col gap-[16px] md:gap-[4px]">
              <h3 className="m-0 text-[20px] leading-[27px] font-bold text-ink md:text-[22px] md:leading-[1.6] md:font-semibold md:tracking-[-0.4px]">
                {copy.formTitle}
              </h3>
              {copy.formText && (
                <p className="m-0 text-[13.5px] leading-[21px] text-slate md:text-[14px] md:leading-[22.4px]">{copy.formText}</p>
              )}
            </div>
            <LeadForm copy={copy.form} />
          </div>
        </div>
      </div>
    </section>
  );
}
