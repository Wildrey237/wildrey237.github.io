# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Next.js dev server (Turbopack/HMR)
npm run build     # Production build → .next/
npm run start     # Serve the production build locally
npm run lint      # next lint (eslint-config-next)
```

npm test          # node --test : parcours model + layout invariants (no browser)
npm run test:e2e  # browser test at 1440px (needs Chrome + BASE_URL + ADMIN_PASSWORD; VERCEL_OIDC_TOKEN for protected previews)

## Branch & Deployment Model

Hosted on **Vercel** (framework: Next.js, auto-detected — no `vercel.json` needed).

- **`main`** — production branch (protected). Vercel builds and deploys it on every push; direct pushes are rejected, so all changes land via pull request.
- Feature branches / PRs → automatic Vercel **preview deployments**.

Vercel runs `npm run build` itself; there is no GitHub Actions deploy workflow. `.github/workflows/cv-check.yml` (auto-renames CV PDFs) is retained and is independent of hosting.

Set `NEXT_PUBLIC_SITE_URL` in the Vercel project env to the production URL (drives `metadataBase` / Open Graph absolute URLs in `app/layout.jsx`).

## Architecture

**Framework:** Next.js 15 (App Router, JavaScript). The `app/` directory holds the Next entry points; the React UI lives under `src/`.

**Entry points:**
- `app/layout.jsx` (server) — `metadata`/`viewport` exports (Open Graph, Twitter, fonts, favicon), global CSS imports, and mounts Vercel `<Analytics/>` + `<GoogleAnalytics/>` (`@next/third-parties`).
- `app/providers.jsx` (client) — wraps the tree in Chakra `CacheProvider` + `ChakraProvider` (dark mode default via `ColorModeScript`) and imports `src/i18n.js`.
- `app/page.jsx` (client) — renders `src/App.jsx`.
- `app/not-found.jsx` — branded 404.

**Chakra theme:** extracted to `src/theme.js` (semantic tokens, dark-first). Imported by `app/providers.jsx`.

**`src/App.jsx`** composes the home page (the public CV) from `src/components/accueil/`: `Entete` (sticky header, active link follows the visible section, theme + FR/EN toggles, CV button) → `Hero` → `Experiences` → `Competences` → `Formation` → `Certifications` → `Projets` → `PiedDePage` (`#contact`). Shared pieces live in `accueil/communs.jsx` (`Section`, `Etiquette`, `Puces`, `TexteRiche`, `Detail` = native `<details>` so "Voir le détail" works without JS). No scroll-in opacity animations: content must be visible without JS.

**Design system:** tokens in `src/theme.js` (semantic tokens, light `#F6F5F1` / dark `#0F1115`, accent `#1F3FD1` / `#8EA2FF`; button variants `plein`, `contour`, `discret`; md buttons are 44px high). Fonts via `next/font` in `app/layout.jsx`: Space Grotesk (headings), Inter (body), JetBrains Mono (labels/dates). Color mode: `initialColorMode: 'system'` + cookie (`ColorModeScript type="cookie"` + `cookieStorageManager` in `app/providers.jsx`), applied by a blocking script before paint so pages stay static. Never use `useColorModeValue` for colors (it would flash); use semantic tokens. No emoji in content or UI.

**Homepage layout:** container max 1600px with fluid side padding `clamp(24px, 5vw, 96px)`; hero 7/5 grid with a direct-contacts row (LinkedIn, e-mail with Copy, GitHub); experiences on 3 columns from 1280px; skills 1/2/3/4 columns at 768/1024/1440px, max 8 chips + a "+N" bubble; projects = featured carousel (`projets.phare`, scroll-snap, no autoplay) + full grid on demand.

**Data layer:** Content lives in **MongoDB Atlas** (`MONGODB_URI`, provisioned via the Vercel Marketplace; optional `MONGODB_DB`, default `portfolio`). Collections: `profil`, `experiences`, `formations`, `projets` (with `domaine` ia-data/systemes/web and `personnel` for the home filters), `competences`, `certifications`, `noeuds` (the 74 cells of the private `/parcours` map), `journal`, plus `_migrations` (applied data patches). Translatable text is stored as `{fr, en}` in the same document; links are by `_id`; computed values are never stored.
- `src/lib/donnees/schemas.js` — `$jsonSchema` validators, indexes and enums.
- `src/lib/donnees/depuisJson.js` — builds documents from the legacy `src/data/data-fr.json` / `data-en.json` + `prereqMapData.js` (still the migration source).
- `src/lib/donnees/lecture.js` — server-side read used by `app/page.jsx` (ISR, `revalidate = 3600`); falls back to the JSON files only when `MONGODB_URI` is absent or the DB is not migrated yet.
- `src/lib/donnees/versAffichage.js` — converts documents to the legacy per-language shape consumed by components via `useDonnees()` (`src/data/DonneesContext.jsx`).
- Data changes to an existing DB go through versioned, idempotent patches in `src/lib/donnees/correctifs.js` (applied once, recorded in `_migrations`). Validator changes: `collMod`, or — since the Vercel/Atlas user lacks `collMod` — a copy into a temp collection + `rename` (new fields must be optional).
- `npm run migrer` (`scripts/migrer-mongodb.mjs`, `--essai` dry run) — initializes an empty DB from the JSON files; once the `profil` doc exists it only updates validators/indexes and leaves content alone (MongoDB is the source of truth, content is edited in `/admin`). `--resync` forces content back from the JSON (recreating deleted items); state fields (node `etat`/`historique`, project `statut`/`noeuds`, skill `noeuds`) are never overwritten.

**Admin (`/admin`):** private back-office (server-rendered HTML forms + Server Actions in `app/admin/actions.js`, works without JS). Layout: dark sidebar (`app/admin/NavAdmin.jsx`, groups « Site public · CV » and « Parcours privé »; collapses into a `<details>` menu below 960px), content styled by `app/admin/admin.css` with the site palette (light/dark follows the site theme class), French UI with accents, 44px targets. Node state = 3-way segmented control (`app/admin/noeuds/EtatNoeud.jsx`: direct call with JS, plain form submit without). A map learning project only becomes a CV project through « Ajouter aux projets du CV… » → prefilled `/admin/projets/nouveau?depuis=<node>`; the created project keeps `noeudOrigine` (one CV project per node). Protected by `middleware.js` (matcher `/admin/:path*`): an HMAC-SHA256 token signed with `ADMIN_PASSWORD`, stored in the httpOnly `admin_session` cookie (path `/admin`, 8 h, `sameSite: strict`); every action re-checks the session (`src/lib/admin/garde.js`). Changing `ADMIN_PASSWORD` invalidates all sessions; if it is unset, access is denied. Pages: profile, experiences, education, projects, skills (create / edit / delete with a confirmation checkbox), node state (`etat` + `historique`), daily `journal` (one doc per date, upsert). Dates are typed as `AAAA` or `AAAA-MM` (January 1st renders as a year only). Mutations call `revalidatePath` on public pages. `/admin` is disallowed in `robots.js`, absent from `sitemap.js`, and sent with `X-Robots-Tag: noindex`.

**Learning path (`/parcours`):** replaces the old `/ml-map` (308 redirect). Public in read-only mode but **not referenced**: `noindex` meta + `X-Robots-Tag: noindex, nofollow` header (`next.config.mjs`), deliberately NOT disallowed in `robots.js` (crawlers must read the noindex), absent from the sitemap and from the public menu. Editing node state is admin-only: buttons hidden for visitors, `POST /api/parcours/etat` returns 401 without the admin session. Nodes are laid out on the ORIGINAL bands of `prereqMapData.js` (math, ml, graph, algo, data, proj — `BANDES_CARTE` in `modele.js`, colors `bande.*` in the theme); the 3 rails (IA & ML = ml+graph+data, Maths, Algo) are only used for the top cards. Band filter chips (multi-select, URL `?bandes=math,ml`): unselected bands disappear from the DOM; the « Afficher les prérequis externes » checkbox (off by default) adds direct prerequisites from other bands as 35% dashed ghosts. Clicking a node highlights its direct links (prerequisites amber, unlocked nodes accent, rest at 20%; « Chaîne complète » extends upstream/downstream via `voisinage()`), lighter on hover; the node sheet opens as a right side panel (bottom sheet < 768px), URL `?noeud=ml1`; re-click, click on empty space or Escape closes it. Server page reads `noeuds` and renders `src/components/parcours/Parcours.jsx`. Pure modules: `src/lib/parcours/modele.js` (3 rails IA & ML / Maths / Algo, displayed status en-cours / ensuite / plus-tard / maitrise, "Autour de moi" subset) and `src/lib/parcours/flux.js` (React Flow layout: one horizontal band per original band in the order math, ml, graph, algo, data, proj; x = original `col` compacted to the displayed columns, band rows = original `row` compacted; one port per link on each card side and one vertical corridor per link (`centreX`); camera framing helpers `cibleInitiale`, `vuePour`, `vueSelection`). The map is rendered by React Flow (`@xyflow/react`) in `src/components/parcours/CarteFlux.jsx` (client only, `next/dynamic`, desktop only): custom `carte` nodes (220x72, text >= 13px), `bande` background nodes (non-selectable, under the cards), custom smoothstep `lien` edges (arrow at the end; highlighted links drawn last but never above cards), MiniMap in band colors, zoom 30-200 %. Colors come from Chakra CSS variables (`carte.css`), so light/dark needs no JS. Initial framing: in-progress nodes and their neighbours, else the first column (left-aligned, 100 %); never below 80 %. Clicking a node reframes it and its neighbours over 400 ms (never below 80 %, the node always stays visible). Shared bits (card style, status pill, legend, highlight roles) live in `src/components/parcours/communs.jsx`. Rail counters count course nodes only (not `proj`). Desktop (>= 1024px) is full-screen: the page never scrolls (`main` = 100dvh); a 44px header (title, one-line « Avancement » summary collapsed by default, expandable to one line per rail where clicking a rail filters) and a 44px toolbar (view toggle, band chips, « Prérequis externes » checkbox, node search by code or title that selects and centers the node) leave >= 85 % of the screen to the map. Legend behind a « ? » button bottom-left; zoom controls and MiniMap bottom-right. Opening the 400px side panel shrinks the page, so the React Flow view resizes (no overlap). Mobile (< 1024px): list per band + bottom sheet, no map. State changes go through `app/parcours/actions.js` → `src/lib/donnees/noeuds.js` (shared with `/admin/noeuds`). Map learning projects (`bande: "proj"`) live in `noeuds` and are unrelated to CV `projets`. **The map is private and fully separate from the homepage:** `versAffichage.js` never sends node links (`noeuds`, `noeudOrigine`) to the public page (guarded by `tests/affichage.test.mjs`); never add public links to `/parcours`. `src/components/PrereqMap/prereqMapData.js` is kept only as the migration source.

**i18n (`src/i18n.js`):** Uses i18next + browser language detector. Detection order: querystring → localStorage → cookie → navigator. Fallback language is English. UI strings (navbar labels, button text, section titles) live in `src/i18n.js` resources; profile/skills/experience data lives in the JSON files.

**Styling:** Chakra UI v2 throughout. Color mode is toggled via Chakra's `useColorMode` hook. No custom CSS beyond `src/index.css` and `src/App.css` (minimal resets).

**Animations:** Framer Motion for section scroll-in and the experience timeline. `react-simple-typewriter` for the name effect in `ProfileSection`.

**Analytics:** Two systems run in parallel — **Vercel Analytics** (`@vercel/analytics`, zero-config) and **GA4** (`G-QSFT7C8DBJ`) via `@next/third-parties` `GoogleAnalytics` in `app/layout.jsx`. The CV download button in `Footer.jsx` fires a `download_cv` custom event via `window.gtag` (still provided by the GA component).

## Adding a New Section

1. Create `src/components/NewSection.jsx` using Chakra UI layout primitives.
2. Add a collection (validator in `src/lib/donnees/schemas.js`, reader in `src/lib/donnees/lecture.js`) and an `/admin` page to edit it; translatable text as `{fr, en}`.
3. Add UI string keys to both `fr` and `en` translation objects in `src/i18n.js`.
4. Import and insert a `<MotionBox {...sectionAnim}>` block in `src/App.jsx`.
5. Add a nav anchor in `Navbar.jsx` if the section needs a navbar link.

Everything under `app/page.jsx` renders inside a `'use client'` boundary, so browser APIs (`window`, `document`) must stay inside `useEffect`/event handlers to survive SSR pre-rendering.
