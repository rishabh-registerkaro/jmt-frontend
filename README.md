# jmt-frontend

The public **Joy Maa Tara** homepage. Built with Next.js 16 (App Router) and Tailwind CSS 4.

This is a UI-only app with **no database**. All content and form submissions go through the [`jmt-admin`](https://github.com/rishabh-registerkaro/jmt-admin) API, which is its backend.

| What | How it works |
|---|---|
| Page content | `server/homepage.ts` calls `GET {ADMIN_API_URL}/api/homepage/client`. The response is cached. If jmt-admin is unreachable, the page shows the bundled default content, so it never breaks. |
| Edits going live | After every save, jmt-admin calls this app's `POST /api/revalidate` (checked with `REVALIDATE_SECRET`). The next visit gets the new content. |
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
| `REVALIDATE_SECRET` | **yes** | Must be the **same value** as `REVALIDATE_SECRET` in jmt-admin's `.env`. Without it, CMS edits don't refresh this site, and the lead form's rate limit treats every visitor as one IP. |
| `SITE_URL` | for production | Public URL of this site. It's used to build absolute social-share (`og:image`) links. |

All three are server-side only, so none of them reach the browser.

For edits to show up immediately, jmt-admin's `JMT_FRONTEND_URL` must point at this app (default `http://localhost:3002`).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 3002 |
| `npm run build` | Production build |
| `npm start` | Serves the production build on port 3002 |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript checks |

---

## Project structure

```
app/
  layout.tsx              root <html>/<body>, global CSS
  (public)/               the homepage: layout (navbar, footer, LiveRefresh) and page (sections)
  actions/leads.ts        Server Action for the lead form → jmt-admin
  api/revalidate/         cache refresh, called by jmt-admin after each save
  api/homepage/version/   version check for LiveRefresh (proxied to jmt-admin)
  lib/content/            default homepage content (shared with jmt-admin)
components/
  homepage/               one folder per homepage section (Hero, Services, Faq, …)
  common/Photo.tsx        cover-cropped image used by the sections
lib/
  adminApi.ts             jmt-admin URL and shared-secret helpers
  homepage/               view-model builder (shared with jmt-admin)
server/homepage.ts        cached data fetching from jmt-admin, with fallback
types/ data/ utils/       homepage types, fallback content, lead-form rules (shared with jmt-admin)
styles/public.css         design tokens and utilities (from the Figma file)
public/homepage/          bundled images and icons
```

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

**Docker:**

```bash
docker build -t jmt-frontend .
docker run -p 3002:3002 --env-file .env jmt-frontend
```

**Node host:** `npm install && npm run build && npm start`. Set the environment variables in the host's dashboard.

The build doesn't need jmt-admin to be reachable. If jmt-admin is down, the build uses the fallback content. The live content takes over within 10 minutes, or right away on the next CMS save.

## Troubleshooting

- **The page shows default content and the server log says `jmt-admin API unavailable`.** Check that `ADMIN_API_URL` is right and that jmt-admin is running.
- **CMS edits don't appear.** `REVALIDATE_SECRET` must match in both apps, and jmt-admin's `JMT_FRONTEND_URL` must point here. Pages also refresh on their own every 10 minutes.
- **The lead form says "couldn't send your request".** jmt-admin is unreachable at `ADMIN_API_URL`. The server log has the details.
