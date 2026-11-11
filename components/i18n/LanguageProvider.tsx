"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  getDictionary,
  localePath,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: DEFAULT_LOCALE,
  t: getDictionary(DEFAULT_LOCALE),
});

/**
 * The page's language for client components. The language itself comes from
 * the URL (app/[lang]); this only shares it and remembers it.
 */
export function LanguageProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  useEffect(() => {
    // The server already rendered <html lang>; keep it right after client-side switches too.
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Storage blocked (private mode etc.) — the URL and cookie still work.
    }
  }, [locale]);

  return <LanguageContext.Provider value={{ locale, t: getDictionary(locale) }}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

/** Saves the choice (cookie for the server redirect on "/", localStorage for the client) and returns its URL. */
export function rememberLocale(locale: Locale): string {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore: see above.
  }
  return localePath(locale);
}
