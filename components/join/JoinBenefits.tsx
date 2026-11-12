import { BookOpen, HardHat, House, ShieldCheck, User, Wallet, type LucideIcon } from "lucide-react";
import { Responsive } from "@/components/about/shared";
import type { BenefitIcon } from "@/data/joinPage";
import { JOIN_PAGE } from "@/data/joinPage";
import { JOIN_INNER, JoinSectionHeader } from "./shared";

const ICONS: Record<BenefitIcon, LucideIcon> = {
  wallet: Wallet,
  shield: ShieldCheck,
  hat: HardHat,
  book: BookOpen,
  user: User,
  home: House,
};

// Figma "2 · What you get" — desktop 311:106 (3×2 peach cards, brown "No
// joining fee" banner), mobile 313:91 (one column, shorter banner text).
const cls = {
  inner: `${JOIN_INNER} flex flex-col gap-[16px] md:gap-[28px] lg:gap-[36px]`,
  grid: "m-0 grid list-none grid-cols-1 gap-[10px] p-0 md:grid-cols-2 md:gap-[16px] lg:grid-cols-3 lg:gap-[20px]",
  card: "flex items-center gap-[14px] rounded-[16px] bg-peach-100 p-[16px] md:gap-[16px] md:rounded-[20px] md:p-[24px]",
  badge: "flex size-[44px] flex-none items-center justify-center rounded-[12px] bg-orange md:size-[52px] md:rounded-[14px]",
  title: "m-0 text-[16px] leading-[normal] font-bold text-ink md:text-[18px]",
  text: "m-0 text-[13.5px] leading-[20px] text-slate md:text-[14.5px] md:leading-[22px]",
  banner: "flex items-center gap-[12px] rounded-[16px] bg-brown p-[16px] md:gap-[14px] md:px-[24px] md:py-[18px]",
  coin: "flex size-[40px] flex-none items-center justify-center rounded-full bg-orange text-[14px] leading-[normal] font-bold text-white md:size-[44px] md:text-[15px]",
};

export default function JoinBenefits({ content }: { content: (typeof JOIN_PAGE)["benefits"] }) {
  return (
    <section id="what-you-get" className="bg-white" aria-labelledby="join-benefits-title">
      <div className={cls.inner}>
        <JoinSectionHeader id="join-benefits-title" copy={content.copy} />
        <ul className={cls.grid} data-reveal-stagger>
          {content.items.map((item, index) => {
            const Icon = ICONS[item.icon];
            return (
            <li key={item.title} className={cls.card} style={{ "--i": index } as React.CSSProperties}>
              <span className={cls.badge} aria-hidden="true">
                <Icon className="size-[21px] flex-none text-white md:size-[24px]" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-[3px] md:gap-[6px]">
                <span className={cls.title}>{item.title}</span>
                <span className={cls.text}>{item.text}</span>
              </span>
            </li>
            );
          })}
        </ul>
        <div className={cls.banner} data-reveal>
          <span className={cls.coin} aria-hidden="true">
            {content.noFee.badge}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-[2px] leading-[normal]">
            <strong className="text-[16px] font-bold text-white md:text-[19px]">{content.noFee.title}</strong>
            <span className="text-[13px] text-peach-200 md:text-[14.5px]">
              <Responsive copy={content.noFee.text} />
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
