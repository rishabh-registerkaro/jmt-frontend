# jmt-frontend

The public **Joy Maa Tara** homepage, in English, Bengali and Hindi. Built with Next.js 16 (App Router) and Tailwind CSS 4.

This is a UI-only app with **no database**. All content and form submissions go through the [`jmt-admin`](https://github.com/rishabh-registerkaro/jmt-admin) API, which is its backend.    qwdw

| What | How it works |
|---|---|
| Page content | `server/homepage.ts` calls `GET {ADMIN_API_URL}/api/homepage/client` once per language and caches the result. If jmt-admin is unreachable, the page shows the bundled default content, so it never breaks. |
| Languages | `/` is English, `/bn` is Bengali, `/hi` is Hindi. Translated page copy comes from the CMS. The few UI strings that live in components are in `locales/*.json`. |
| Edits going live | After every save, jmt-admin calls this app's `POST /api/revalidate`, which checks `REVALIDATE_SECRET`. All three languages refresh, and the next visit gets the new content. |
| Open tabs auto-refresh | `components/homepage/LiveRefresh.tsx` polls `/api/homepage/version`, which forwards to jmt-admin. |
| "Request workers" form | The Server Action in `app/actions/leads.ts` sends it to `POST {ADMIN_API_URL}/api/lead/homepage`. jmt-admin saves the lead, emails the admin and rate-limits each visitor. |

---

## Requirements

- **Node.js 20.9 or newer** and npm
- A running **jmt-admin** (locally on port 3000, or its deployed URL) for live content and the lead form. Without it the page still renders, using the default content.

## Quick start

```bash
git clone <this-repo-url> jmt-frontend
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
| `REVALIDATE_SECRET` | **yes** | Must be the **same value** as `REVALIDATE_SECRET` in jmt-admin's `.env`. If it's missing, CMS edits don't refresh this site, and the lead form's rate limit treats every visitor as a single IP. Generate one with `openssl rand -hex 32`. |
| `SITE_URL` | in production | Public URL of this site, without a trailing slash. Used to build absolute social-share (`og:image`) links. |
| `PRODUCTION_URL` | no | Origin of the main Global Elite website. CMS links given as relative paths (such as `/blog/x`) are prefixed with it. If it's empty, those links are hidden. |

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
proxy.ts                  language routing: "/" → English, /bn, /hi; /en/* redirects to /*
app/
  [lang]/layout.tsx       root <html lang>/<body>, fonts, navbar, footer, LiveRefresh
  [lang]/page.tsx         the homepage sections and metadata
  global-not-found.tsx    404 page for any other URL
  actions/leads.ts        Server Action for the lead form → jmt-admin
  api/revalidate/         cache refresh, called by jmt-admin after each save
  api/homepage/version/   version check for LiveRefresh (proxied to jmt-admin)
  lib/content/            default homepage content (shared with jmt-admin)
components/
  homepage/               one folder per homepage section (Hero, Services, Faq, …)
  i18n/                   LanguageProvider (current language + UI strings)
  common/Photo.tsx        cover-cropped image used by the sections
lib/
  adminApi.ts             jmt-admin URL and shared-secret helpers
  i18n.ts                 locale list, dictionaries, cookie names
  homepage/               view-model builder (shared with jmt-admin)
locales/                  en / bn / hi UI strings (bn and hi must have every key in en)
server/homepage.ts        cached data fetching from jmt-admin, with fallback
types/ data/ utils/       homepage types, fallback content and translations, lead-form rules
styles/public.css         design tokens and utilities (from the Figma file)
public/homepage/          bundled images and icons
```

### Languages

- The supported languages are listed in **two places that must match**: `SWITCHER_LANGUAGES` in `types/homepage.ts` and `TRANSLATED` in `proxy.ts`. The proxy is kept free of app imports on purpose.
- The navbar switcher saves the visitor's choice in the `jmt-locale` cookie. After that, visiting `/` redirects them to `/bn` or `/hi`.
- If a key is missing from `locales/bn.json` or `locales/hi.json`, `npm run typecheck` fails.

### Files shared with jmt-admin

These files have **identical copies** in jmt-admin (marked `SHARED FILE`). When you change one, copy it to the other repo:

- `lib/homepage/buildHomepage.ts`
- `app/lib/content/home-content.ts`
- `types/homepage.ts`
- `data/homepageFallback.ts`
- `utils/leadForm.ts`
- `public/homepage/*`

---

## Deployment

### Before you deploy

1. `npm run lint && npm run typecheck && npm run build` all pass.
2. Set `ADMIN_API_URL`, `REVALIDATE_SECRET` and `SITE_URL`, plus `PRODUCTION_URL` if it's needed, on the host.
3. In **jmt-admin**, set `JMT_FRONTEND_URL` to this site's public URL and `REVALIDATE_SECRET` to the same value.
4. After the deploy, check that `/`, `/bn` and `/hi` load, that `/en` redirects to `/`, and that an unknown URL shows the 404 page. Save something in the CMS and confirm it appears on the site.

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
- Images aren't optimized by Next (`images.unoptimized`), so no image domain allow-list is needed for the CMS media host.

## Troubleshooting

- **The page shows default content and the server log says `jmt-admin API unavailable`.** Check that `ADMIN_API_URL` is right and that jmt-admin is reachable from this server.
- **CMS edits don't appear.** `REVALIDATE_SECRET` must match in both apps, and jmt-admin's `JMT_FRONTEND_URL` must point here. Pages also refresh on their own every 10 minutes.
- **The lead form says "couldn't send your request".** jmt-admin is unreachable at `ADMIN_API_URL`. The server log has the details.
- **CMS links to pages such as `/blog/…` are missing.** Set `PRODUCTION_URL`.
- **`/` keeps opening in Bengali or Hindi.** That's the `jmt-locale` cookie from the language switcher. Pick English in the switcher, or clear the cookie.
