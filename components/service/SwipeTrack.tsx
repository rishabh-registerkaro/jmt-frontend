"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface SwipeTrackProps {
  /** Number of slides (the list's direct children). */
  count: number;
  /** Accessible name for the dot buttons, e.g. "Show plan". */
  dotLabel: string;
  className: string;
  /** Hides the dots once the list stops swiping, e.g. "lg:hidden". */
  dotsClassName?: string;
  children: ReactNode;
}

/**
 * A list that swipes sideways on phones (CSS scroll-snap does the work) with
 * page dots under it — Figma "Plans carousel (swipe)". Once the list's own
 * classes turn it into a grid, `dotsClassName` hides the dots.
 */
export default function SwipeTrack({ count, dotLabel, className, dotsClassName = "md:hidden", children }: SwipeTrackProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const first = list.firstElementChild as HTMLElement | null;
        if (!first) return;
        const step = first.offsetWidth + parseFloat(getComputedStyle(list).columnGap || "0");
        // At the far end the last slide may not reach the snap start.
        const atEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - 2;
        setActive(atEnd ? count - 1 : Math.round(list.scrollLeft / step));
      });
    };
    list.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      list.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [count]);

  const goTo = (index: number) => {
    const list = listRef.current;
    const slide = list?.children[index] as HTMLElement | undefined;
    // The list is `relative`, so offsetLeft is measured from its padding edge.
    if (list && slide) list.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
  };

  return (
    <>
      <ul ref={listRef} className={className}>
        {children}
      </ul>
      <div className={`flex gap-[6px] ${dotsClassName}`}>
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`${dotLabel} ${index + 1}`}
            aria-current={index === active ? "true" : undefined}
            className={[
              "h-[6px] cursor-pointer rounded-[3px] border-0 p-0 transition-[width,background-color] duration-240",
              "focus-ring [--focus-offset:2px]",
              // Larger invisible hit area for fingers.
              "relative after:absolute after:-inset-[10px] after:content-['']",
              index === active ? "w-[20px] bg-orange" : "w-[6px] bg-sand",
            ].join(" ")}
          />
        ))}
      </div>
    </>
  );
}
