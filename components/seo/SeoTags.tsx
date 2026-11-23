// Renders SEO & Scripts from jmt-admin (server/seo.ts).
//
//   <GtmNoscript>   first thing in <body> (GTM's no-JavaScript fallback)
//   <Gtm>           GTM bootstrap, after the page is interactive
//   <CustomScripts> pasted snippets, rebuilt from allow-listed nodes
//   <JsonLd>        structured data, in the server HTML
//   <PageSeo>       one page's own schema and scripts
//
// Tracking (GTM and custom scripts) is left out on Vercel preview deployments
// and while an editor previews unsaved changes, so test traffic never reaches
// analytics. JSON-LD is always rendered.

import Script, { type ScriptProps } from "next/script";
import { draftMode } from "next/headers";
import { IS_NON_PRODUCTION_DEPLOY } from "@/lib/site";
import { jsonLdHtml } from "@/lib/seo";
import { GTM_ID_PATTERN, getPageSeo, type ScriptTiming, type SeoNode, type SeoScript } from "@/server/seo";

/** True when GTM and custom scripts should load on this render. */
export async function trackingEnabled(): Promise<boolean> {
  if (IS_NON_PRODUCTION_DEPLOY) return false;
  return !(await draftMode()).isEnabled;
}

// ── Google Tag Manager ───────────────────────────────────────────────────────

/** GTM container bootstrap (Google's snippet). `gtmId` is checked against GTM_ID_PATTERN first. */
export function Gtm({ gtmId }: { gtmId: string | null }) {
  if (!gtmId || !GTM_ID_PATTERN.test(gtmId)) return null;
  const code = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`;
  return <Script id="gtm" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: code }} />;
}

/** GTM for visitors without JavaScript; belongs right after <body>. */
export function GtmNoscript({ gtmId }: { gtmId: string | null }) {
  if (!gtmId || !GTM_ID_PATTERN.test(gtmId)) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}`}
        height={0}
        width={0}
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}

// ── JSON-LD ──────────────────────────────────────────────────────────────────

export function JsonLd({ data }: { data: unknown }) {
  if (Array.isArray(data) && data.length === 0) return null;
  // jsonLdHtml escapes "<", so the JSON can't close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(data)} />;
}

// ── Custom scripts ───────────────────────────────────────────────────────────

const STRATEGY: Record<ScriptTiming, NonNullable<ScriptProps["strategy"]>> = {
  early: "beforeInteractive",
  default: "afterInteractive",
  lazy: "lazyOnload",
};

/** HTML attribute names → React prop names, for the few that differ. */
const PROP_NAMES: Record<string, string> = {
  crossorigin: "crossOrigin",
  referrerpolicy: "referrerPolicy",
  nomodule: "noModule",
  charset: "charSet",
};
const BOOLEAN_ATTRS = new Set(["async", "defer", "nomodule"]);

function toProps(attrs: Record<string, string>): Record<string, string | boolean> {
  const props: Record<string, string | boolean> = {};
  for (const [name, value] of Object.entries(attrs)) {
    props[PROP_NAMES[name] ?? name] = BOOLEAN_ATTRS.has(name) ? true : value;
  }
  return props;
}

function renderNode(node: SeoNode, key: string, timing: ScriptTiming) {
  switch (node.tag) {
    case "script": {
      // next/script needs an id to track inline scripts; keep the vendor's when given.
      const { id = key, ...rest } = toProps(node.attrs);
      const props = { ...rest, id: String(id), strategy: STRATEGY[timing] };
      return node.inner ? (
        <Script key={key} {...props} dangerouslySetInnerHTML={{ __html: node.inner }} />
      ) : (
        <Script key={key} {...props} />
      );
    }
    case "noscript":
      return <noscript key={key} dangerouslySetInnerHTML={{ __html: node.inner }} />;
    // React hoists <meta> and <link> into <head>.
    case "meta":
      return <meta key={key} {...toProps(node.attrs)} />;
    case "link":
      return <link key={key} {...toProps(node.attrs)} />;
    case "jsonld":
      return <JsonLd key={key} data={node.data} />;
  }
}

/** Every node of every script. "early" scripts must be rendered from the root layout. */
export function CustomScripts({ scripts }: { scripts: SeoScript[] }) {
  if (scripts.length === 0) return null;
  return <>{scripts.flatMap((script) => script.nodes.map((node, i) => renderNode(node, `seo-${script.id}-${i}`, script.timing)))}</>;
}

// ── One page ─────────────────────────────────────────────────────────────────

/**
 * A page's own schema and scripts from Dashboard → SEO & Scripts → Pages.
 * `path` must be the page's public path, the same one its canonical uses.
 */
export async function PageSeo({ path }: { path: string }) {
  const [entry, tracking] = await Promise.all([getPageSeo(path), trackingEnabled()]);
  return (
    <>
      <JsonLd data={entry.schemas} />
      {tracking && <CustomScripts scripts={entry.scripts} />}
    </>
  );
}
