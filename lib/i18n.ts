// Languages of the public homepage and the UI strings that are not CMS content.
//
//   /     English (served from app/[lang] with lang "en" — proxy.ts rewrites it)
//   /bn   Bengali
//   /hi   Hindi
//
// Page copy (headings, cards, FAQ, form labels…) comes translated from the
// CMS (HomePageContent.translations). Only the few strings that live in the
// components — screen-reader labels and the like — are in locales/*.json.

import en from "@/locales/en.json";
import bn from "@/locales/bn.json";
import hi from "@/locales/hi.json";
import { SWITCHER_LANGUAGES, isSwitcherLanguage, type SwitcherLanguage } from "@/types/homepage";

export type Locale = SwitcherLanguage;
export const LOCALES = SWITCHER_LANGUAGES;
export const DEFAULT_LOCALE: Locale = "en";
export const hasLocale = isSwitcherLanguage;

/** Remembers the visitor's choice; proxy.ts reads it to send "/" to /bn or /hi. */
export const LOCALE_COOKIE = "jmt-locale";
/** Same choice, kept in localStorage for client-side code. */
export const LOCALE_STORAGE_KEY = "jmt-locale";

export type Dictionary = typeof en;

// `satisfies` makes a missing key in bn/hi a type error.
const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  bn: bn satisfies Dictionary,
  hi: hi satisfies Dictionary,
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** Public URL of the homepage in `locale`. */
export function localePath(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
}
