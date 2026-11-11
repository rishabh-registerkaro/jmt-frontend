import Image from "next/image";
import type { TradeCard, TradeIcon, TradesCopy } from "@/types/homepage";
import Photo from "@/components/common/Photo";

interface TradesProps {
  trades: TradeCard[];
  copy: TradesCopy;
}

const TRADE_ICONS: Record<TradeIcon, string> = {
  masonry: "/homepage/icon-trade-masonry.svg",
  shuttering: "/homepage/icon-trade-shuttering.svg",
  welding: "/homepage/icon-trade-welding.svg",
  helpers: "/homepage/icon-trade-helpers.svg",
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
          {trades.map((trade) => (
            <li key={trade.id} className={cls.trade}>
              <Photo
                image={trade.image}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
              />
              <div className={cls.trade__label}>
                <Image src={TRADE_ICONS[trade.icon]} alt="" width={20} height={20} />
                <h3 className={cls.trade__title}>{trade.title}</h3>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const cls = {
  trades: "bg-white",
  trades__inner: "site-container section-pad flex flex-col gap-8",
  trades__header: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6",
  trades__title: "heading-xl flex-1",
  trades__copy: "body-lg lg:flex-[0_0_420px]",
  trades__grid: "grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-4",
  trade: "relative h-[340px] overflow-hidden rounded-[12px] bg-navy-card lg:h-[394.7px]",
  trade__label: "absolute inset-x-0 bottom-0 flex items-center gap-2.5 bg-brown px-4 py-3.5 [&_img]:flex-none",
  trade__title: "m-0 text-[16.5px] leading-[20.6px] font-semibold text-white",
};
