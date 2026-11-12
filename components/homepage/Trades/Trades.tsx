import { BrickWall, Grid3x3, Hammer, Zap, type LucideIcon } from "lucide-react";
import type { TradeCard, TradeIcon, TradesCopy } from "@/types/homepage";
import Photo from "@/components/common/Photo";

interface TradesProps {
  trades: TradeCard[];
  copy: TradesCopy;
}

const TRADE_ICONS: Record<TradeIcon, LucideIcon> = {
  masonry: BrickWall,
  shuttering: Hammer,
  welding: Grid3x3,
  helpers: Zap,
};

export default function Trades({ trades, copy }: TradesProps) {
  return (
    <section id="trades" className={cls.trades} aria-labelledby="trades-title">
      <div className={cls.trades__inner}>
        <div className={cls.trades__header}>
          <h2 id="trades-title" className={cls.trades__title} data-reveal="clip">
            {copy.title}
          </h2>
          {copy.intro && <p className={cls.trades__copy} data-reveal style={{ "--rd": "150ms" } as React.CSSProperties}>{copy.intro}</p>}
        </div>

        <ul className={cls.trades__grid} data-reveal-stagger>
          {trades.map((trade) => {
            const TradeIconCmp = TRADE_ICONS[trade.icon];
            return (
            <li key={trade.id} className={cls.trade}>
              <Photo
                image={trade.image}
                sizes="(min-width: 1024px) 25vw, 50vw"
              />
              <span className="card-scrim md:hidden" aria-hidden="true" />
              <div className={cls.trade__label}>
                <TradeIconCmp size={20} strokeWidth={1.75} className="text-orange max-md:hidden" aria-hidden="true" />
                <h3 className={cls.trade__title}>{trade.title}</h3>
              </div>
            </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

const cls = {
  trades: "bg-white",
  // Mobile (<768, Figma "Homepage — Mobile 390"): 2×2 photo tiles, caption on a scrim.
  trades__inner: "site-container section-pad flex flex-col gap-6 md:gap-8",
  trades__header: "flex flex-col gap-6 md:gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6",
  trades__title: "heading-xl flex-1",
  trades__copy: "body-lg lg:flex-[0_0_420px]",
  trades__grid: "grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4",
  trade:
    "relative h-[210px] overflow-hidden rounded-[14px] bg-navy-card md:h-[340px] md:rounded-[12px] lg:h-[394.7px]",
  trade__label:
    "absolute inset-x-0 bottom-0 flex items-center gap-2.5 p-4 md:bg-brown md:py-3.5 [&_img]:flex-none",
  trade__title:
    "m-0 text-[14.5px] leading-[19px] font-semibold text-white md:text-[16.5px] md:leading-[20.6px]",
};
