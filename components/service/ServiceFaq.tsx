import { MessageCircle, Phone } from "lucide-react";
import Photo from "@/components/common/Photo";
import type { ContactInfo } from "@/types/homepage";
import type { ServiceFaqContent } from "@/types/service";
import { UI_TEXT as t } from "@/lib/uiText";
import { AccentTitle, Eyebrow, SECTION_TITLE } from "./SectionHeader";
import ServiceFaqList from "./ServiceFaqList";

interface ServiceFaqProps {
  id: string;
  content: ServiceFaqContent;
  contact: ContactInfo;
}

// Figma "Service FAQ" 237:700 — founder photo card 440 | questions 792, gap 48.
const cls = {
  split: "grid grid-cols-1 gap-[20px] md:gap-[32px] lg:grid-cols-[minmax(0,440fr)_minmax(0,792fr)] lg:gap-[48px]",
  // lg: fixed height, pinned to the top of the row. As a stretched grid item it
  // grew whenever an answer opened, re-cropping the photo; now it never moves.
  card: "relative isolate flex min-h-[300px] flex-col justify-end overflow-hidden rounded-[18px] bg-navy-card md:min-h-[520px] md:rounded-[20px] lg:order-first lg:h-[774px] lg:min-h-0 lg:self-start",
  shade: "absolute inset-0 bg-[linear-gradient(180deg,rgba(8,27,48,0)_30%,rgba(8,27,48,0.9)_100%)] md:bg-[linear-gradient(180deg,rgba(8,27,48,0)_45%,rgba(8,27,48,0.9)_100%)]",
  caption: "relative z-1 flex flex-col items-start gap-[10px] px-[18px] pb-[18px] md:gap-[14px] md:px-[28px] md:pb-[28px]",
  kicker: "m-0 text-[11px] leading-[normal] font-bold tracking-[1.32px] text-peach-200 uppercase md:text-[12px] md:tracking-[1.44px]",
  title: "m-0 max-w-[384px] text-[20px] leading-[25px] font-bold text-white md:text-[clamp(22px,20.5915492958px+0.3755868545vw,26px)] md:leading-[1.23]",
  role: "m-0 text-[13px] leading-[normal] text-white/80 md:text-[15px]",
  call: "btn-primary [--btn-h:40px] gap-[6px] py-[10px] pr-[18px] pl-[16px] text-[14px] leading-[normal] [--focus-color:#fff] md:[--btn-h:46px] md:gap-[8px] md:pr-[22px] md:pl-[20px] md:text-[15px]",
  whatsapp: [
    "btn-base [--btn-h:40px] gap-[6px] border border-white/40 bg-white/15 py-[10px] pr-[18px] pl-[16px]",
    "text-[14px] leading-[normal] text-white hover:bg-white/25 [--focus-color:#fff]",
    "md:[--btn-h:46px] md:gap-[8px] md:pr-[22px] md:pl-[20px] md:text-[15px]",
  ].join(" "),
};

export default function ServiceFaq({ id, content, contact }: ServiceFaqProps) {
  const { card } = content;
  const whatsappHref = contact.whatsappHref ?? "#contact";
  const whatsappIsExternal = whatsappHref.startsWith("http");

  return (
    <section id={id} className="scroll-mt-[65px] bg-peach-100" aria-labelledby={`${id}-title`}>
      <div className="site-container section-pad max-md:px-[20px]">
        <div className={cls.split}>
          <div className="flex min-w-0 flex-col gap-[20px] md:gap-[10px]" data-reveal style={{ "--rd": "150ms" } as React.CSSProperties}>
            <div className="flex flex-col gap-[20px] md:gap-[14px] md:pb-[14px]">
              <Eyebrow>{content.copy.eyebrow}</Eyebrow>
              <h2 id={`${id}-title`} className={SECTION_TITLE}>
                <AccentTitle heading={content.copy.heading} />
              </h2>
            </div>
            <ServiceFaqList items={content.items} />
          </div>

          <aside className={cls.card} aria-labelledby={`${id}-owner`} data-reveal="left">
            <Photo image={card.image} sizes="(min-width: 1024px) 34vw, 100vw" />
            <span className={cls.shade} aria-hidden="true" />
            <div className={cls.caption}>
              <p className={cls.kicker}>{card.kicker}</p>
              <h3 id={`${id}-owner`} className={cls.title}>
                {card.title}
              </h3>
              <p className={cls.role}>{card.role}</p>
              <div className="flex flex-wrap gap-[10px]">
                <a href={contact.phoneHref ?? "#contact"} className={cls.call}>
                  <Phone className="size-[15px] text-white md:size-[17px]" aria-hidden="true" />
                  {card.call}
                </a>
                <a
                  href={whatsappHref}
                  className={cls.whatsapp}
                  {...(whatsappIsExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <MessageCircle className="size-[15px] text-white md:size-[17px]" aria-hidden="true" />
                  {card.whatsapp}
                  {whatsappIsExternal && <span className="sr-only"> {t.opensWhatsApp}</span>}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
