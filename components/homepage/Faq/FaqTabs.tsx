"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { FaqAudience, FaqGroup } from "@/types/homepage";
import { JOIN_CREW_ANCHOR } from "./anchors";

interface FaqTabsProps {
  groups: FaqGroup[];
}

const ICON_CLASS: Record<FaqAudience, string> = {
  companies: "[mask-image:url(/homepage/icon-companies.svg)]",
  workers: "[mask-image:url(/homepage/icon-workers.svg)]",
};

const cls = {
  list: [
    "flex max-w-full self-stretch xs:inline-flex xs:self-start",
    "h-[54px] p-[5px] rounded-full border border-card-line bg-white",
  ].join(" "),
  tab: [
    "inline-flex min-w-0 flex-[1_1_0] items-center justify-center gap-[6px] px-[10px]",
    "xs:flex-none xs:gap-[8px] xs:px-[18px]",
    "cursor-pointer appearance-none rounded-full whitespace-nowrap",
    "transition-[background-color,color] duration-160 ease-[ease]",
    "focus-ring [--focus-offset:1px]",
  ].join(" "),
  tabIdle: "text-orange hover:bg-peach-100",
  tabActive: "bg-orange text-white",
  // The design ships white/orange variants of each icon; masking one shape with
  // currentColor keeps a single asset per icon and follows the tab state.
  // Both tab labels only fit side by side on the smallest phones without icons
  // (hidden below 375px).
  icon: [
    "size-[17px] flex-none bg-current max-[375px]:hidden",
    "[mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
  ].join(" "),
  item: [
    "rounded-[20px] border",
    "transition-[background-color,border-color,filter] duration-240 ease-[ease] motion-reduce:transition-none",
  ].join(" "),
  itemClosed: "border-card-line-soft bg-white [filter:drop-shadow(0_6px_9px_rgba(19,53,90,0.18))]", // $shadow-faq
  itemOpen: "border-sand-gold bg-peach-50 [filter:drop-shadow(0_20px_20px_rgba(19,53,90,0.3))]", // $shadow-faq-open
  toggle: [
    "flex w-full min-h-[72px] items-center justify-between gap-[16px]",
    "p-[20px] md:px-[26px] rounded-[20px] text-left cursor-pointer appearance-none",
    "focus-ring [--focus-offset:-2px]",
  ].join(" "),
  question: [
    "text-navy font-medium tracking-[0px]",
    "text-[clamp(16.5px,15.6197183099px+0.234741784vw,19px)] leading-[1.3526315789]",
  ].join(" "),
  // Height animation via grid rows (0fr → 1fr); visibility removes the closed
  // answer from the accessibility tree and tab order.
  answerClosed:
    "grid grid-rows-[0fr] invisible [transition:grid-template-rows_240ms_cubic-bezier(0.22,1,0.36,1),visibility_0s_linear_240ms] motion-reduce:[transition:none]",
  answerOpen:
    "grid grid-rows-[1fr] visible [transition:grid-template-rows_240ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:[transition:none]",
  answerText: "body-lg px-[20px] pt-0 pb-[24px] md:pr-[64px] md:pl-[26px]",
};

export default function FaqTabs({ groups }: FaqTabsProps) {
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
      if (link?.getAttribute("href") === hash) showWorkers();
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
    <div className="flex flex-col gap-[20px]">
      <div className={cls.list} role="tablist" aria-label="Questions by audience">
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
              <span className="text-[14.5px] leading-[23.2px] font-semibold">{group.label}</span>
              <span className="text-[12.5px] leading-[20px] font-semibold">
                {group.items.length}
                <span className="sr-only"> questions</span>
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
        <ul className="flex flex-col gap-[14px]">
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
                    className={cls.toggle}
                    aria-expanded={open}
                    aria-controls={answerId}
                    onClick={() => toggle(item.id)}
                  >
                    <span className={cls.question}>{item.question}</span>
                    <Image
                      src={open ? "/homepage/icon-close.svg" : "/homepage/icon-plus.svg"}
                      alt=""
                      width={20}
                      height={20}
                      className="flex-none"
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
