// Shared by the server layout (inline boot script) and IntroLoader (client).
// Kept out of the "use client" module so the server gets the real string.

export const INTRO_STORAGE_KEY = "jmtIntro";

// Runs synchronously while the HTML is parsed, before first paint:
//   intro-play            → first visit in this tab session: show the intro
//   intro-skip intro-done → seen already, or reduced motion: no overlay
//   reveal-ready          → scroll reveals may hide content until it scrolls in
//                           (never with reduced motion; see ScrollReveal.tsx)
export const INTRO_BOOT_SCRIPT = `(function(){var h=document.documentElement;var s=false;try{s=sessionStorage.getItem("${INTRO_STORAGE_KEY}")==="1"}catch(e){}var r=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(s||r){h.classList.add("intro-skip","intro-done")}else{h.classList.add("intro-play")}if(!r){h.classList.add("reveal-ready")}})();`;
