"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { NavLink } from "@/types/homepage";

interface NavMenuProps {
  links: NavLink[];
  callHref: string;
}

// `className` is a literal Tailwind font-family utility for the label's script.
const LANGUAGES = [
  { code: "en", label: "EN", name: "English", available: true, className: "" },
  { code: "bn", label: "বাং", name: "Bengali", available: false, className: "font-bengali" },
  { code: "hi", label: "हिं", name: "Hindi", available: false, className: "font-devanagari" },
] as const;

const DESKTOP_QUERY = "(min-width: 1024px)";

// Shared transition strings (SCSS used plain `ease`, not Tailwind's default curve).
const burgerLine =
  "block h-[2px] w-[22px] rounded-[2px] [transition:transform_240ms_cubic-bezier(0.22,1,0.36,1),background-color_160ms_ease] motion-reduce:transition-none";

const cls = {
  menuLink: [
    "inline-flex cursor-pointer appearance-none items-center gap-1.5 rounded-[6px] py-2",
    "text-[15px] leading-[24px] font-medium whitespace-nowrap text-ink no-underline",
    "transition-[color] duration-160 ease-[ease] hover:text-orange focus-ring",
  ].join(" "),
  // Closed: visibility flips only after the fade (0s linear 160ms delay); open: flips immediately.
  dropdownBase:
    "absolute top-[calc(100%_+_12px)] -left-4 min-w-[260px] rounded-[12px] border border-card-line bg-white p-2 shadow-panel",
  dropdownClosed:
    "invisible -translate-y-[4px] opacity-0 [transition:opacity_160ms_ease,translate_160ms_ease,visibility_0s_linear_160ms] motion-reduce:transition-none",
  dropdownOpen: "visible translate-y-0 opacity-100 [transition:opacity_160ms_ease,translate_160ms_ease]",
  dropdownLink: [
    "block rounded-[8px] px-3 py-2.5 text-[15px] leading-[22px] font-medium text-ink no-underline",
    "hover:bg-peach-100 hover:text-brown focus-ring [--focus-offset:0px]",
  ].join(" "),
  langOption: [
    "inline-flex cursor-pointer appearance-none items-center rounded-full px-[11px]",
    "text-[12px] leading-[19.2px] font-semibold focus-ring [--focus-offset:1px] aria-disabled:cursor-not-allowed",
  ].join(" "),
  // drawer__link and drawer__heading share these.
  drawerRow: "block px-1 py-4 text-[18px] leading-[26px] font-semibold text-ink no-underline",
  drawerSublink: [
    "block px-1 py-2.5 text-[15px] leading-[22px] font-medium text-slate no-underline",
    "focus-ring [--focus-offset:0px]",
  ].join(" "),
  burgerBars: {
    base: `relative ${burgerLine}`,
    closed: "bg-brown before:bg-brown after:bg-brown",
    open: [
      "bg-transparent before:bg-brown after:bg-brown",
      "before:[transform:translateY(7px)_rotate(45deg)] after:[transform:translateY(-7px)_rotate(-45deg)]",
    ].join(" "),
    pseudo: [
      "before:absolute before:left-0 before:top-[-7px] before:block before:h-[2px] before:w-[22px] before:rounded-[2px] before:content-['']",
      "after:absolute after:left-0 after:top-[7px] after:block after:h-[2px] after:w-[22px] after:rounded-[2px] after:content-['']",
      "before:[transition:transform_240ms_cubic-bezier(0.22,1,0.36,1),background-color_160ms_ease]",
      "after:[transition:transform_240ms_cubic-bezier(0.22,1,0.36,1),background-color_160ms_ease]",
      "motion-reduce:before:transition-none motion-reduce:after:transition-none",
    ].join(" "),
  },
};

export default function NavMenu({ links, callHref }: NavMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const idPrefix = useId();
  const drawerId = `${idPrefix}-drawer`;

  const closeDrawer = useCallback((restoreFocus: boolean) => {
    setDrawerOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Close the desktop dropdown on outside click or Escape.
  useEffect(() => {
    if (openDropdown === null) return;
    const onPointerDown = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenDropdown(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openDropdown]);

  // Mobile drawer: lock page scroll, close on Escape or when resized to desktop.
  useEffect(() => {
    if (!drawerOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer(true);
    };
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) closeDrawer(false);
    };
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [drawerOpen, closeDrawer]);

  const languageToggle = (
    <div
      className="inline-flex h-[39.2px] items-stretch rounded-full border border-input-line bg-input-bg p-1"
      role="group"
      aria-label="Language"
    >
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          lang={lang.code}
          className={[
            cls.langOption,
            lang.available ? "bg-orange-nav text-white" : "text-slate-strong",
            lang.className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={lang.available}
          aria-disabled={!lang.available}
          title={lang.available ? lang.name : `${lang.name} — coming soon`}
          onClick={(event) => {
            if (!lang.available) event.preventDefault();
          }}
        >
          {lang.label}
          {!lang.available && <span className="sr-only"> ({lang.name}, coming soon)</span>}
        </button>
      ))}
    </div>
  );

  const callButton = (
    <a
      href={callHref}
      className={[
        "inline-flex h-[44px] items-center gap-2 rounded-full border border-pill-line bg-orange-nav px-[19px]",
        "text-[14px] leading-[22.4px] font-semibold text-white no-underline",
        "transition-[background-color] duration-160 ease-[ease] hover:bg-orange-hover focus-ring",
      ].join(" ")}
    >
      <Image src="/homepage/icon-phone-white-16.svg" alt="" width={16} height={16} />
      Call
    </a>
  );

  return (
    <>
      {/* Figma "Frame 212": nav + actions share one 916px row, spread to its edges. */}
      <div className="ml-auto hidden min-w-0 flex-[0_1_916px] items-center justify-between gap-6 lg:flex">
        <nav ref={navRef} className="hidden lg:block" aria-label="Main">
          <ul className="flex items-center gap-5 xl:gap-7">
            {links.map((link, index) => {
              const hasChildren = link.children.length > 0;
              const isOpen = openDropdown === index;
              const dropdownId = `${idPrefix}-dropdown-${index}`;
              return (
                <li key={`${link.label}-${index}`} className="relative">
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        className={cls.menuLink}
                        aria-expanded={isOpen}
                        aria-controls={dropdownId}
                        onClick={() => setOpenDropdown(isOpen ? null : index)}
                      >
                        {link.label}
                        <Image
                          src="/homepage/icon-chevron-down.svg"
                          alt=""
                          width={16}
                          height={16}
                          className={[
                            "transition-transform duration-160 ease-[ease] motion-reduce:transition-none",
                            isOpen ? "rotate-180" : "",
                          ].join(" ")}
                        />
                      </button>
                      <ul
                        id={dropdownId}
                        className={[cls.dropdownBase, isOpen ? cls.dropdownOpen : cls.dropdownClosed].join(" ")}
                      >
                        {link.children.map((child) =>
                          child.href ? (
                            <li key={child.label}>
                              <a
                                href={child.href}
                                className={cls.dropdownLink}
                                onClick={() => setOpenDropdown(null)}
                              >
                                {child.label}
                              </a>
                            </li>
                          ) : null,
                        )}
                      </ul>
                    </>
                  ) : (
                    link.href && (
                      <a href={link.href} className={cls.menuLink}>
                        {link.label}
                      </a>
                    )
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden flex-none items-center gap-2.5 lg:flex">
          {languageToggle}
          {callButton}
        </div>
      </div>

      <button
        ref={toggleRef}
        type="button"
        className="ml-auto flex size-[44px] cursor-pointer appearance-none items-center justify-center rounded-[12px] focus-ring lg:hidden"
        aria-expanded={drawerOpen}
        aria-controls={drawerId}
        aria-label={drawerOpen ? "Close menu" : "Open menu"}
        onClick={() => setDrawerOpen((open) => !open)}
      >
        <span
          className={[
            cls.burgerBars.base,
            cls.burgerBars.pseudo,
            drawerOpen ? cls.burgerBars.open : cls.burgerBars.closed,
          ].join(" ")}
        />
      </button>

      <div
        id={drawerId}
        className={[
          "fixed inset-x-0 top-[68px] bottom-0 z-60 flex flex-col gap-6 overflow-y-auto",
          "border-t border-brown/20 bg-white px-4 pt-4 pb-8 md:px-8 lg:hidden [&[hidden]]:hidden",
        ].join(" ")}
        hidden={!drawerOpen}
      >
        <nav aria-label="Mobile">
          <ul>
            {links.map((link, index) => (
              <li key={`${link.label}-${index}`} className="border-b border-card-line-soft">
                {link.href ? (
                  <a
                    href={link.href}
                    className={`${cls.drawerRow} focus-ring [--focus-offset:0px]`}
                    onClick={() => closeDrawer(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <span className={cls.drawerRow}>{link.label}</span>
                )}
                {link.children.length > 0 && (
                  <ul className="pb-3 pl-3">
                    {link.children.map((child) =>
                      child.href ? (
                        <li key={child.label}>
                          <a
                            href={child.href}
                            className={cls.drawerSublink}
                            onClick={() => closeDrawer(false)}
                          >
                            {child.label}
                          </a>
                        </li>
                      ) : null,
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {languageToggle}
          {callButton}
        </div>
      </div>
    </>
  );
}
