// The site pages whose copy is edited in jmt-admin (Dashboard → About Us / Contact / Join Our Crew)
// and stored in its `jmt_site_pages` table, one JSON document per page.
// The bundled copy in data/ is the fallback and the schema (mergeContent.ts).
//
// To make another page CMS-driven: add its bundled content here AND in
// jmt-admin/app/lib/content/site-pages.ts (same key and locked paths).

import { ABOUT_PAGE } from "@/data/about";
import { CONTACT_PAGE } from "@/data/contactPage";
import { JOIN_PAGE } from "@/data/joinPage";
import { prepareDefaults } from "./mergeContent";

export const SITE_PAGE_DEFAULTS = {
  about: prepareDefaults(ABOUT_PAGE),
  contact: prepareDefaults(CONTACT_PAGE),
  "join-our-crew": prepareDefaults(JOIN_PAGE),
};

export type SitePageKey = keyof typeof SITE_PAGE_DEFAULTS;
export type SitePageContent<K extends SitePageKey> = (typeof SITE_PAGE_DEFAULTS)[K];

/** Paths that always keep the bundled value. Must match jmt-admin's registry. */
export const SITE_PAGE_LOCKED: Record<SitePageKey, readonly string[]> = {
  about: [],
  // form.services is keyed by the stored values, so only its labels are editable.
  contact: [],
  // Form options are validated against fixed lists in utils/joinForm.ts.
  "join-our-crew": ["form.trades", "form.experience", "form.start", "form.languages[].value"],
};

/** Cache tag of a page. Must match jmtSitePageTags in jmt-admin/app/lib/utils/revalidateFrontend.ts. */
export const sitePageTag = (key: SitePageKey) => `jmt-page-${key}`;
