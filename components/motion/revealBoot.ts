// Inline script for app/layout.tsx. Runs while the HTML is parsed,
// before first paint, and adds html.reveal-ready unless the visitor prefers
// reduced motion. That class enables the hero entrance and the scroll
// reveals (styles/public.css, ScrollReveal.tsx). Without JS it's never set,
// so nothing is ever hidden.
export const REVEAL_BOOT_SCRIPT = `(function(){var r=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(!r){document.documentElement.classList.add("reveal-ready")}})();`;
