"use client";

import { useId, useState } from "react";
import PlusMinus from "@/components/common/PlusMinus";
import type { ServiceFaqContent } from "@/types/service";

interface ServiceFaqListProps {
  items: ServiceFaqContent["items"];
}

// Accordion from Figma "Service FAQ" 237:718 — one question open at a time,
// the first open on load. Open: orange 1.5px border and an orange − badge;
// closed: peach + badge.
const cls = {
  item: "rounded-[14px] border-[1.5px] bg-white transition-colors duration-240 md:rounded-[16px]",
  toggle: [
    "flex w-full cursor-pointer appearance-none items-center justify-between gap-[16px] rounded-[14px] bg-transparent",
    "px-[16px] py-[15px] text-left md:rounded-[16px] md:px-[24px] md:py-[18px] focus-ring [--focus-offset:-2px]",
  ].join(" "),
  question: "text-[15px] leading-[1.35] font-semibold text-ink md:text-[17px] md:leading-[1.4]",
  badge: "flex size-[28px] flex-none md:size-[30px] items-center justify-center rounded-full transition-colors duration-160",
  answerClosed:
    "grid grid-rows-[0fr] invisible [transition:grid-template-rows_240ms_cubic-bezier(0.22,1,0.36,1),visibility_0s_linear_240ms] motion-reduce:[transition:none]",
  answerOpen:
    "grid grid-rows-[1fr] visible [transition:grid-template-rows_240ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:[transition:none]",
  answer: "m-0 px-[16px] pb-[15px] text-[14px] leading-[22px] text-slate md:pr-[68px] md:pb-[18px] md:pl-[24px] md:text-[16px] md:leading-[26px]",
};

export default function ServiceFaqList({ items }: ServiceFaqListProps) {
  const idPrefix = useId();
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <ul className="m-0 flex list-none flex-col gap-[10px] p-0">
      {items.map((item) => {
        const open = item.id === openId;
        const buttonId = `${idPrefix}-q-${item.id}`;
        const panelId = `${idPrefix}-a-${item.id}`;
        return (
          <li key={item.id} className={`${cls.item} ${open ? "border-orange" : "border-transparent"}`}>
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                className={cls.toggle}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
              >
                <span className={cls.question}>{item.question}</span>
                <span
                  className={`${cls.badge} ${open ? "bg-orange text-white" : "bg-peach-100 text-orange"}`}
                  aria-hidden="true"
                >
                  <PlusMinus open={open} size={14} />
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} className={open ? cls.answerOpen : cls.answerClosed}>
              <div className="overflow-hidden">
                <p className={cls.answer}>{item.answer}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
