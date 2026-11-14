# jmt-frontend

The public **Joy Maa Tara** website (English only). Built with Next.js 16 (App Router) and Tailwind CSS 4.

This is a UI-only app with **no database**. All content and form submissions go through the [`jmt-admin`](https://github.com/rishabh-registerkaro/jmt-admin) API, which is its backend.

## Pages

Every page's content is edited in jmt-admin. Each page also ships with bundled default content, so it still renders if jmt-admin is down or nothing has been saved yet.

| URL | Page | Content from (jmt-admin API) | Edited in jmt-admin at | Bundled fallback |
|---|---|---|---|---|
| `/` | Homepage | `GET /api/homepage/client` | Homepage | `data/homepageFallback.ts` |
| `/service/<slug>` | Service pages | `GET /api/jmt-services/client/<slug>` | Services | `data/services/*` |
| `/about` | About | `GET /api/site-pages/client/about` | About Us | `data/about.ts` |
| `/contact` | Contact | `GET /api/site-pages/client/contact` | Contact | `data/contactPage.ts` |
| `/join-our-crew` | Join our crew | `GET /api/site-pages/client/join-our-crew` | Join Our Crew | `data/joinPage.ts` |

The navbar, footer and contact details (phone, WhatsApp, email, hours) on every page come from the homepage document (`getSiteChrome`).

Friendly aliases redirect permanently (308) to the real pages (`proxy.ts`): `/about-us` → `/about`, `/contact-us` → `/contact`, `/join`, `/careers`, `/jobs` → `/join-our-crew`, and `/site-labour-supply`, `/labour-supply` → `/service/site-service-supply`. Section names such as `/services`, `/service` or `/faq` redirect to that homepage section. The site used to be served in English, Bengali and Hindi; old `/en/*`, `/bn/*` and `/hi/*` URLs redirect permanently to the unprefixed English URL.

## How it works

| What | How it works |
|---|---|
| Homepage content | `server/homepage.ts` calls `GET {ADMIN_API_URL}/api/homepage/client` and caches the result. If jmt-admin is unreachable, the page shows the bundled default content, so it never breaks. |
| Service pages | `server/service.ts` reads published pages from `/api/jmt-services/client/<slug>`. Pages published after the build render on their first visit. |
| About, Contact, Join our crew | `server/sitePages.ts` reads the saved document and merges it over the bundled copy, field by field (`lib/sitePages/mergeContent.ts`). Missing fields, values of the wrong type and unsafe image URLs fall back to the bundled value. |
| UI strings | The site is English only. The few UI strings that live in components (screen-reader labels, placeholders) are in `lib/uiText.ts`. |
| Edits going live | After every save, jmt-admin calls this app's `POST /api/revalidate`, which checks `REVALIDATE_SECRET`. Every page refreshes, and the next visit gets the new content. |
| Open tabs auto-refresh | `components/homepage/LiveRefresh.tsx` polls `/api/homepage/version`, which forwards to jmt-admin. |
| Forms | Server Actions send each form to jmt-admin, which saves the lead, emails the admin and rate-limits each visitor (per IP, and per email/phone number). The "Request workers" form (homepage and service pages) goes through `app/actions/leads.ts` to `/api/lead/homepage`, the Contact enquiry form through `app/actions/contactLead.ts` to `/api/lead/contact`, and the Join our crew application through `app/actions/joinApplication.ts` to `/api/lead/join`. All of them appear in jmt-admin → Leads. |
| Lead source | The "Request workers" form sends the page path and title it was filled on, so jmt-admin's **Source** column shows the page. On a service page it also sends the roles ticked in "Roles we supply" (`components/service/RoleSelection.tsx`). |
| Preview of unsaved edits | jmt-admin's **Preview** button opens `/api/preview?token=…&path=…` here. That turns on Next.js Draft Mode for that browser only and stores the token in the `jmt-preview` cookie. While it's on, `server/*` renders the draft (read from jmt-admin's `/api/preview/<token>` with `REVALIDATE_SECRET`) instead of the published content, and `components/preview/PreviewBar.tsx` shows a bar, polls `/api/preview/version` and re-renders as the editor types. "Exit preview" goes to `/api/preview?exit=1`. Every other visitor keeps getting the cached, published pages. See `lib/preview.ts`. |
| SEO | `lib/seo.ts` gives every page an absolute canonical, Open Graph and Twitter tags, and JSON-LD (Organization and WebSite in the layout, a BreadcrumbList on the service, Contact and Join pages, and a Service on each service page). `app/sitemap.ts` lists every page, with `<lastmod>` from the CMS. `app/robots.ts` allows everything except `/api/`. |
| Analytics | Vercel Web Analytics and Speed Insights load only when the site runs on Vercel. |

---

## Requirements

- **Node.js 20.9 or newer** and npm
- A running **jmt-admin** (locally on port 3000, or its deployed URL) for live content and the lead form. Without it the page still renders, using the default content.

## Quick start

```bash
git clone https://github.com/anshgangwar786/jmt-frontend.git
cd jmt-frontend
npm install
cp .env.example .env        # then fill it in (see below)
npm run dev                 # http://localhost:3002
```

For the full local setup, start jmt-admin first (`npm run dev` in that repo, port 3000), then this app.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `ADMIN_API_URL` | **yes** | Origin of jmt-admin, without a trailing slash. Locally that's `http://localhost:3000`. |
| `REVALIDATE_SECRET` | **yes** | Must be the **same value** as `REVALIDATE_SECRET` in jmt-admin's `.env`. If it's missing, CMS edits don't refresh this site, Preview doesn't work, and the lead form's rate limit treats every visitor as a single IP. Generate one with `openssl rand -hex 32`. |
| `SITE_URL` | in production | Public URL of this site, without a trailing slash. Used for canonical and hreflang links, `og:url`/`og:image`, JSON-LD, the sitemap and robots.txt. On Vercel it falls back to the project's production domain, otherwise to `http://localhost:3002`. |
| `PRODUCTION_URL` | no | Origin of the main website. CMS links given as relative paths (such as `/blog/x`) are prefixed with it. If it's empty, those links are hidden. |
| `MEDIA_HOSTNAMES` | no | Hostname(s) of jmt-admin's `HOSTINGER_MEDIA_URL`, comma-separated, without `https://` (e.g. `media.example.com`). When set, `next/image` optimizes photos (AVIF/WebP, responsive sizes), and **only** these hosts are allowed. When empty, images are served as-is. Read at **build** time. |

All of these are server-side only, so none of them reach the browser. Quotes and stray spaces pasted into a hosting dashboard are stripped automatically.

For edits to show up immediately, jmt-admin's `JMT_FRONTEND_URL` must point at this app (default `http://localhost:3002`).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 3002 |
| `npm run build` | Production build (webpack) |
| `npm start` | Serves the production build on port 3002 |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

---

## Project structure

```
proxy.ts                  redirects: friendly aliases, old /en /bn /hi URLs → English
app/
  layout.tsx              root <html>/<body>, fonts, navbar, footer, LiveRefresh, PreviewBar, JSON-LD
  page.tsx                the homepage sections and metadata
  service/[slug]/         service pages
  about/                  About page
  contact/                Contact page
  join-our-crew/          Join our crew page
  not-found.tsx           404 page
  actions/                Server Actions for the forms → jmt-admin (leads, contactLead, joinApplication)
  api/revalidate/         cache refresh, called by jmt-admin after each save
  api/homepage/version/   version check for LiveRefresh (proxied to jmt-admin)
  api/preview/            turns Draft Mode on/off for jmt-admin's Preview button; version/ for PreviewBar
  sitemap.ts robots.ts    /sitemap.xml and /robots.txt
  lib/content/            default homepage content (shared with jmt-admin)
components/
  homepage/               one folder per homepage section (Hero, Services, Faq, …)
  service/ about/ contact/ join/   sections of the other pages
  common/Photo.tsx        cover-cropped image used by the sections
  preview/PreviewBar.tsx  bar shown while previewing unsaved dashboard edits
lib/
  adminApi.ts             jmt-admin URL and shared-secret helpers
  preview.ts              Draft Mode preview: token cookie, draft fetch from jmt-admin
  seo.ts                  page metadata (canonical, OG) and JSON-LD builders
  site.ts                 SITE_URL, absoluteUrl, "is this a Vercel preview deploy"
  homepage/               view-model builder (shared with jmt-admin)
  service/                service page normalizer (shared with jmt-admin)
  sitePages/              CMS-driven pages: registry.ts (which pages, locked fields, cache tags)
                          and mergeContent.ts (shared with jmt-admin)
  siteLinks.ts            page URLs and navbar/footer link mapping
  uiText.ts               UI strings used in components
server/                   cached data fetching from jmt-admin, with fallback
                          (homepage.ts, service.ts, sitePages.ts)
types/ data/ utils/       types, bundled default content and translations, form rules
styles/public.css         design tokens and utilities (from the Figma file)
public/                   bundled images and icons (homepage/, service/, about/, contact/, join/)
next.config.ts            security headers, noindex on Vercel previews, image optimizer (MEDIA_HOSTNAMES),
                          Vercel production env check
```

### Languages

The site is English only. Old `/en`, `/bn` and `/hi` links are redirected to the English page by `proxy.ts`.

### Files shared with jmt-admin

These files have **identical copies** in jmt-admin (marked `SHARED FILE`). When you change one, copy it to the other repo:

- `lib/homepage/buildHomepage.ts`
- `app/lib/content/home-content.ts`
- `types/homepage.ts`
- `data/homepageFallback.ts`
- `utils/leadForm.ts` (also defines the lead form's hidden page and services fields), `utils/contactForm.ts`, `utils/joinForm.ts`
- `lib/service/normalizeServicePage.ts`, `data/services/*`, `types/service.ts`
- `lib/sitePages/mergeContent.ts`
- `data/about.ts`, `data/contactPage.ts`, `data/joinPage.ts`, `types/about.ts`
- `public/homepage/*`, plus the photos in `public/about/` and `public/join/` and `public/contact/chip-*.svg` (jmt-admin uses these for editor previews)
- `PREVIEW_TOKEN_PATTERN` in `lib/preview.ts` must match `TOKEN_PATTERN` in jmt-admin's `app/lib/server/previewStore.ts`

### Changing what the About, Contact or Join pages can show

The bundled copy in `data/` is both the fallback and the **schema** for the admin editor. jmt-admin builds its form from that copy, one field per value.

- **To add a field** (a new heading, list or image), add it to the `data/` file here and use it in the component. Then copy the `data/` file to jmt-admin, and the field becomes editable there. No database change is needed.
- **Optional mobile text** (`short`, `introShort`) is always shown in the editor. An empty `short` means "same as the full text". An empty `introShort` means "same as the intro", and `null` means "not shown on phones".
- **Fields that must not be edited**, such as form options the server checks against a fixed list, go in `SITE_PAGE_LOCKED` in `lib/sitePages/registry.ts` **and** in `locked` in jmt-admin's `app/lib/content/site-pages.ts`.

### Making another page editable

1. Put its copy in a `data/` file and pass it to the page's components as props.
2. Add it to `SITE_PAGE_DEFAULTS` in `lib/sitePages/registry.ts`, and add a getter in `server/sitePages.ts`.
3. Add it to `SITE_PAGES` in jmt-admin's `app/lib/content/site-pages.ts` under the same key, with a copy of the `data/` file. Then add a sidebar item for it in jmt-admin's `components/common/AppSidebar.tsx` pointing at `/dashboard/site-pages/<key>`.

---

## Deployment

### Before you deploy

1. `npm run lint && npm run typecheck && npm run build` all pass.
2. Set `ADMIN_API_URL`, `REVALIDATE_SECRET` and `SITE_URL`, plus `PRODUCTION_URL` and `MEDIA_HOSTNAMES` if they're needed, on the host.
3. In **jmt-admin**, set `JMT_FRONTEND_URL` and `NEXT_PUBLIC_JMT_FRONTEND_URL` to this site's public URL and `REVALIDATE_SECRET` to the same value.
4. After the deploy, check that `/` loads, that `/en`, `/bn` and `/hi` redirect to `/`, and that an unknown URL shows the 404 page. Open `/about`, `/contact`, `/join-our-crew` and a `/service/<slug>` page. Save something in the CMS and confirm it appears on the site. Click **Preview** in a jmt-admin editor and confirm the preview bar appears.
5. Check that `/sitemap.xml` lists the pages with your real domain (not localhost) and that `/robots.txt` points at it.

### Vercel

- Import the repo, set the environment variables, and deploy. No extra configuration is needed.
- A **production** build fails on purpose if `ADMIN_API_URL`, `REVALIDATE_SECRET` or `SITE_URL` is missing or points at localhost (`next.config.ts`).
- Preview deployments are kept out of search engines: `X-Robots-Tag: noindex`, a `noindex` meta tag, `Disallow: /` in robots.txt and an empty sitemap.
- Web Analytics and Speed Insights start reporting once you enable them in the Vercel project.

### Docker

```bash
docker build -t jmt-frontend .
docker run -d --name jmt-frontend -p 3002:3002 --env-file .env --restart unless-stopped jmt-frontend
```

The image is a two-stage build. It installs the exact versions from `package-lock.json` (`npm ci`), drops the dev dependencies, and runs as the non-root `node` user. Secrets are passed at runtime and never baked into the image (`.env` is excluded by `.dockerignore`).

### Node host (Hostinger, VPS, …)

```bash
npm ci
npm run build
npm start          # port 3002
```

Set the environment variables in the host's dashboard. `next.config.ts` caps build workers at 2 (`experimental.cpus`), because Hostinger containers report the host's full CPU count and the build otherwise runs out of threads.

The site needs a long-running Node server. It uses a proxy, Server Actions and on-demand revalidation, so it **can't be a static export**.

### Notes

- **jmt-admin doesn't need to be reachable during the build.** If it's down, the pages are prerendered with the fallback content, and the live content takes over within 10 minutes or right away on the next CMS save.
- Fonts come from Google Fonts **at build time** and are then self-hosted. The build machine needs internet access. If a build fails with an error in `next/font`, it's usually a network blip, so run it again.
- Images are optimized by Next only when `MEDIA_HOSTNAMES` is set. Then every host that CMS images come from must be in it, or those images fail to load. When it's empty, images are served as-is and any host works.
- Every response carries security headers (HSTS, `nosniff`, a referrer policy, no framing by other sites, and `upgrade-insecure-requests` so older `http://` media URLs load over HTTPS). `/api/*` is always `noindex`.

## Troubleshooting

- **A page shows default content and the server log says `jmt-admin API unavailable`** (or `[site-pages] … using bundled content`). Check that `ADMIN_API_URL` is right and that jmt-admin is reachable from this server.
- **CMS edits don't appear.** `REVALIDATE_SECRET` must match in both apps, and jmt-admin's `JMT_FRONTEND_URL` must point here. Pages also refresh on their own every 10 minutes.
- **A form says it couldn't send.** jmt-admin is unreachable at `ADMIN_API_URL`. The server log has the details. "Too many submissions" means jmt-admin's spam limit was hit; it clears after 10 minutes.
- **The preview bar says the preview expired, or Preview shows the live page.** The draft is gone from jmt-admin (older than 2 hours, restarted, or another instance). Click Preview in the dashboard again. If it never works, check `REVALIDATE_SECRET` in both apps and the server log for `[preview]`.
- **Some CMS images are broken after setting `MEDIA_HOSTNAMES`.** Their host isn't in the list. Add it and rebuild, or clear the variable.
- **The sitemap or canonical links show `localhost`.** `SITE_URL` wasn't set on the host.
- **About, Contact or Join edits don't show, and jmt-admin returns 500 for `/api/site-pages/client/…`.** The `jmt_site_pages` table doesn't exist yet. Run `npx prisma db push` in jmt-admin and restart it. Until then, the pages show their bundled copy.
- **CMS links to pages such as `/blog/…` are missing.** Set `PRODUCTION_URL`.
