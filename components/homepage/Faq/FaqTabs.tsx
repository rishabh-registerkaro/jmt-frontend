"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { FaqAudience, FaqGroup } from "@/types/homepage";
import { JOIN_CREW_ANCHOR } from "./anchors";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface FaqTabsProps {
  groups: FaqGroup[];
}

const ICON_CLASS: Record<FaqAudience, string> = {
  companies: "[mask-image:url(/homepage/icon-companies.svg)]",
  workers: "[mask-image:url(/homepage/icon-workers.svg)]",
};

const cls = {
  // Mobile (<768, Figma "Homepage — Mobile 390"): grey pill track, no icons,
  // question count in a small badge.
  list: [
    "inline-flex max-w-full self-start gap-[6px] p-[4px] rounded-full bg-input-bg max-[374px]:gap-[2px]",
    "md:h-[54px] md:gap-0 md:p-[5px] md:border md:border-card-line md:bg-white",
  ].join(" "),
  tab: [
    "inline-flex min-w-0 flex-none items-center justify-center gap-[6px] px-[14px] py-[9px]",
    // Under 375px the Bengali/Hindi labels are too long for 14px padding.
    "max-[374px]:gap-[4px] max-[374px]:px-[9px] max-[374px]:text-[13.5px]",
    "md:gap-[8px] md:px-[18px] md:py-0",
    "cursor-pointer appearance-none rounded-full whitespace-nowrap",
    "transition-[background-color,color] duration-160 ease-[ease]",
    "focus-ring [--focus-offset:1px]",
  ].join(" "),
  tabIdle: "text-ink md:text-orange hover:bg-peach-100",
  tabActive: "bg-orange text-white",
  count:
    "rounded-full px-[7px] py-px text-[11.5px] leading-[16px] font-bold md:rounded-none md:bg-transparent md:p-0 md:text-[12.5px] md:leading-[20px] md:font-semibold",
  countIdle: "bg-white text-slate md:text-inherit",
  countActive: "bg-white/25 text-white",
  // The design ships white/orange variants of each icon; masking one shape with
  // currentColor keeps a single asset per icon and follows the tab state.
  // Both tab labels only fit side by side on the smallest phones without icons
  // (hidden below 375px).
  icon: [
    "hidden size-[17px] flex-none bg-current md:block",
    "[mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
  ].join(" "),
  item: [
    "rounded-[12px] border md:rounded-[20px]",
    "transition-[background-color,border-color,filter] duration-240 ease-[ease] motion-reduce:transition-none",
  ].join(" "),
  // $shadow-faq / $shadow-faq-open from md up; flat cards on phones.
  itemClosed: "border-sand bg-white md:border-card-line-soft md:[filter:drop-shadow(0_6px_9px_rgba(19,53,90,0.18))]",
  itemOpen:
    "border-transparent bg-peach-100 md:border-sand-gold md:bg-peach-50 md:[filter:drop-shadow(0_20px_20px_rgba(19,53,90,0.3))]",
  toggle: [
    "flex w-full items-center justify-between gap-[16px] md:min-h-[72px]",
    "p-[16px] md:p-[20px] md:px-[26px] rounded-[12px] md:rounded-[20px] text-left cursor-pointer appearance-none",
    "focus-ring [--focus-offset:-2px]",
  ].join(" "),
  question: [
    "text-ink font-semibold tracking-[0px] text-[15.5px] leading-[21px]",
    "md:text-navy md:font-medium md:text-[clamp(16.5px,15.6197183099px+0.234741784vw,19px)] md:leading-[1.3526315789]",
  ].join(" "),
  badge: "flex size-[28px] flex-none items-center justify-center rounded-full md:hidden",
  // Height animation via grid rows (0fr → 1fr); visibility removes the closed
  // answer from the accessibility tree and tab order.
  answerClosed:
    "grid grid-rows-[0fr] invisible [transition:grid-template-rows_240ms_cubic-bezier(0.22,1,0.36,1),visibility_0s_linear_240ms] motion-reduce:[transition:none]",
  answerOpen:
    "grid grid-rows-[1fr] visible [transition:grid-template-rows_240ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:[transition:none]",
  answerText:
    "body-lg px-[16px] pt-0 pb-[16px] max-md:text-[14px] max-md:leading-[22px] md:px-[20px] md:pb-[24px] md:pr-[64px] md:pl-[26px]",
};

export default function FaqTabs({ groups }: FaqTabsProps) {
  const { t } = useLanguage();
  const idPrefix = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  // One open question per audience; the first starts open, as in the design.
  const [openByAudience, setOpenByAudience] = useState<Partial<Record<FaqAudience, string | null>>>({});
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Open the workers tab when arriving via a "Join our crew" link — on load,
  // on hash change, and on repeat clicks (which don't fire hashchange).
  useEffect(() => {
    const workersIndex = groups.findIndex((group) => group.audience === "workers");
    if (workersIndex < 0) return;
    const hash = `#${JOIN_CREW_ANCHOR}`;

    const showWorkers = () => setActiveIndex(workersIndex);
    const onHashChange = () => {
      if (window.location.hash === hash) showWorkers();
    };
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      // Navbar links may carry the home path ("/#join-our-crew", "/bn#…").
      if (link?.getAttribute("href")?.endsWith(hash)) showWorkers();
    };

    onHashChange();
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onClick);
    };
  }, [groups]);

  const activeGroup = groups[activeIndex];
  if (!activeGroup) return null;

  const openId =
    activeGroup.audience in openByAudience
      ? openByAudience[activeGroup.audience] ?? null
      : activeGroup.items[0]?.id ?? null;

  const selectTab = (index: number) => {
    setActiveIndex(index);
    tabRefs.current[index]?.focus();
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = groups.length - 1;
    const keyTargets: Record<string, number> = {
      ArrowRight: activeIndex === last ? 0 : activeIndex + 1,
      ArrowLeft: activeIndex === 0 ? last : activeIndex - 1,
      Home: 0,
      End: last,
    };
    const target = keyTargets[event.key];
    if (target !== undefined) {
      event.preventDefault();
      selectTab(target);
    }
  };

  const toggle = (itemId: string) => {
    setOpenByAudience((current) => ({
      ...current,
      [activeGroup.audience]: openId === itemId ? null : itemId,
    }));
  };

  const panelId = `${idPrefix}-panel`;

  return (
    <div className="flex flex-col gap-[18px] md:gap-[20px]">
      <div className={cls.list} role="tablist" aria-label={t.faq.tabs}>
        {groups.map((group, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={group.audience}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={`${idPrefix}-tab-${group.audience}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              className={`${cls.tab} ${selected ? cls.tabActive : cls.tabIdle}`}
              onClick={() => setActiveIndex(index)}
              onKeyDown={onTabKeyDown}
            >
              <span className={`${cls.icon} ${ICON_CLASS[group.audience]}`} aria-hidden="true" />
              <span className="text-[13.5px] leading-[18px] font-semibold md:text-[14.5px] md:leading-[23.2px]">
                {group.label}
              </span>
              <span className={`${cls.count} ${selected ? cls.countActive : cls.countIdle}`}>
                {group.items.length}
                <span className="sr-only"> {t.faq.questionsSuffix}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-tab-${activeGroup.audience}`}
      >
        <ul className="flex flex-col gap-[10px] md:gap-[14px]">
          {activeGroup.items.map((item) => {
            const open = item.id === openId;
            const buttonId = `${idPrefix}-q-${activeGroup.audience}-${item.id}`;
            const answerId = `${idPrefix}-a-${activeGroup.audience}-${item.id}`;
            return (
              <li key={item.id} className={`${cls.item} ${open ? cls.itemOpen : cls.itemClosed}`}>
                <h3 className="m-0">
                  <button
                    id={buttonId}
                    type="button"
                    className={`${cls.toggle} ${open ? "max-md:pb-2" : ""}`}
                    aria-expanded={open}
                    aria-controls={answerId}
                    onClick={() => toggle(item.id)}
                  >
                    <span className={cls.question}>{item.question}</span>
                    <span className={`${cls.badge} ${open ? "bg-orange" : "bg-input-bg"}`} aria-hidden="true">
                      <Image
                        src={open ? "/homepage/m/x-white.svg" : "/homepage/m/plus.svg"}
                        alt=""
                        width={13}
                        height={13}
                      />
                    </span>
                    <Image
                      src={open ? "/homepage/icon-close.svg" : "/homepage/icon-plus.svg"}
                      alt=""
                      width={20}
                      height={20}
                      className="hidden flex-none md:block"
                    />
                  </button>
                </h3>
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={open ? cls.answerOpen : cls.answerClosed}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className={cls.answerText}>{item.answer}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
