"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { LanguageOption, NavLink, SwitcherLanguage } from "@/types/homepage";
import { rememberLocale, useLanguage } from "@/components/i18n/LanguageProvider";

interface NavMenuProps {
  links: NavLink[];
  callHref: string;
  /** Text on the call button (admin: Site details → Labels). */
  callLabel: string;
  /** Switcher entries from the admin; empty hides the switcher. */
  languages: LanguageOption[];
}

// Literal Tailwind font-family utility for each label's script.
const LANGUAGE_FONT: Record<SwitcherLanguage, string> = {
  en: "",
  bn: "font-bengali",
  hi: "font-devanagari",
};

const DESKTOP_QUERY = "(min-width: 1024px)";

// Shared transition strings (SCSS used plain `ease`, not Tailwind's default curve).
const burgerLine =
  "block h-[1.67px] w-[13.33px] rounded-[2px] [transition:transform_240ms_cubic-bezier(0.22,1,0.36,1),background-color_160ms_ease] motion-reduce:transition-none";

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
  langOptionCompact: [
    "inline-flex cursor-pointer appearance-none items-center rounded-full px-[8px] py-[5px]",
    "text-[11.5px] leading-[16px] font-semibold focus-ring [--focus-offset:1px] aria-disabled:cursor-not-allowed",
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
      "before:[transform:translateY(5px)_rotate(45deg)] after:[transform:translateY(-5px)_rotate(-45deg)]",
    ].join(" "),
    pseudo: [
      "before:absolute before:left-0 before:top-[-5px] before:block before:h-[1.67px] before:w-[13.33px] before:rounded-[2px] before:content-['']",
      "after:absolute after:left-0 after:top-[5px] after:block after:h-[1.67px] after:w-[13.33px] after:rounded-[2px] after:content-['']",
      "before:[transition:transform_240ms_cubic-bezier(0.22,1,0.36,1),background-color_160ms_ease]",
      "after:[transition:transform_240ms_cubic-bezier(0.22,1,0.36,1),background-color_160ms_ease]",
      "motion-reduce:before:transition-none motion-reduce:after:transition-none",
    ].join(" "),
  },
};

export default function NavMenu({ links, callHref, callLabel, languages }: NavMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { locale: language, t } = useLanguage();
  const router = useRouter();
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

  const switchTo = useCallback((code: SwitcherLanguage) => router.push(rememberLocale(code)), [router]);

  // The admin hid this language (or the whole switcher): send the visitor to
  // English, or they'd be stuck on a page with no way back.
  useEffect(() => {
    if (language !== "en" && !(languages.length > 1 && languages.some((lang) => lang.code === language))) {
      router.replace(rememberLocale("en"));
    }
  }, [language, languages, router]);

  // A single language has nothing to switch to. Labels never change with the
  // page language, and translate="no" keeps browser translators off them.
  // compact: the mobile header pill (Figma "Homepage — Mobile 390" → Language).
  const renderLanguageToggle = (compact: boolean) => languages.length > 1 && (
    <div
      className={
        compact
          ? "notranslate inline-flex flex-none items-stretch gap-[2px] rounded-full border border-sand p-[3px]"
          : "notranslate inline-flex h-[39.2px] flex-none items-stretch rounded-full border border-input-line bg-input-bg p-1"
      }
      role="group"
      aria-label={t.nav.language}
      translate="no"
    >
      {languages.map((lang) => {
        const selected = lang.code === language;
        return (
          <button
            key={lang.code}
            type="button"
            lang={lang.code}
            translate="no"
            className={[
              compact ? cls.langOptionCompact : cls.langOption,
              "notranslate",
              "flex-none whitespace-nowrap",
              selected ? `${compact ? "bg-orange" : "bg-orange-nav"} text-white` : `${compact ? "text-ink" : "text-slate-strong"} hover:text-orange`,
              LANGUAGE_FONT[lang.code],
            ]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={selected}
            title={lang.name}
            onClick={() => {
              if (!selected) switchTo(lang.code);
            }}
          >
            {lang.label}
            <span className="sr-only"> ({lang.name})</span>
          </button>
        );
      })}
    </div>
  );

  const callButton = (
    <a
      href={callHref}
      className={[
        "inline-flex h-[44px] flex-none items-center gap-2 rounded-full border border-pill-line bg-orange-nav px-[19px]",
        "text-[14px] leading-[22.4px] font-semibold whitespace-nowrap text-white no-underline",
        "transition-[background-color] duration-160 ease-[ease] hover:bg-orange-hover focus-ring",
      ].join(" ")}
    >
      <Image src="/homepage/icon-phone-white-16.svg" alt="" width={16} height={16} />
      {callLabel}
    </a>
  );

  return (
    <>
      {/* Figma "Frame 212": nav + actions share one 916px row, spread to its edges. */}
      <div className="ml-auto hidden min-w-0 flex-[0_1_916px] items-center justify-between gap-6 lg:flex">
        <nav ref={navRef} className="hidden lg:block" aria-label={t.nav.main}>
          <ul className="flex items-center gap-5 xl:gap-7">
            {links.map((link, index) => {
              const hasChildren = link.children.length > 0;
              const isOpen = openDropdown === index;
              const dropdownId = `${idPrefix}-dropdown-${index}`;
              return (
                <li key={`${link.label}-${index}`} className="relative flex-none">
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
          {renderLanguageToggle(false)}
          {callButton}
        </div>
      </div>

      <div className="ml-auto lg:hidden">{renderLanguageToggle(true)}</div>
      <button
        ref={toggleRef}
        type="button"
        className="flex size-[40px] flex-none cursor-pointer appearance-none items-center justify-center rounded-full bg-peach-100 focus-ring lg:hidden"
        aria-expanded={drawerOpen}
        aria-controls={drawerId}
        aria-label={drawerOpen ? t.nav.closeMenu : t.nav.openMenu}
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
          "fixed inset-x-0 top-[64px] md:top-[68px] bottom-0 z-60 flex flex-col gap-6 overflow-y-auto",
          "border-t border-brown/20 bg-white px-4 pt-4 pb-8 md:px-8 lg:hidden [&[hidden]]:hidden",
        ].join(" ")}
        hidden={!drawerOpen}
      >
        <nav aria-label={t.nav.mobile}>
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
          {callButton}
        </div>
      </div>
    </>
  );
}
