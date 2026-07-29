# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Next.js dev server (Turbopack/HMR)
npm run build     # Production build → .next/
npm run start     # Serve the production build locally
npm run lint      # next lint (eslint-config-next)
```

No test suite is configured.

## Branch & Deployment Model

Hosted on **Vercel** (framework: Next.js, auto-detected — no `vercel.json` needed).

- **`work`** — production branch. Vercel builds and deploys it on every push.
- Feature branches / PRs → automatic Vercel **preview deployments**.
- **`main`** — legacy GitHub Pages branch, no longer in the deploy loop.

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

**`src/App.jsx`** composes the full page: `ScrollProgressBar` → `Navbar` → five `MotionBox`-wrapped sections (Profile, Skills, Experience, Education, Projects) → `Footer`. Each section animates in on scroll via a shared Framer Motion `whileInView` config.

**Data layer:** All content lives in two JSON files:
- `src/data/data-fr.json` — French content
- `src/data/data-en.json` — English content

Components import both files and select the active one based on the current i18next language. **Keep both files structurally in sync** when adding or removing fields.

**i18n (`src/i18n.js`):** Uses i18next + browser language detector. Detection order: querystring → localStorage → cookie → navigator. Fallback language is English. UI strings (navbar labels, button text, section titles) live in `src/i18n.js` resources; profile/skills/experience data lives in the JSON files.

**Styling:** Chakra UI v2 throughout. Color mode is toggled via Chakra's `useColorMode` hook. No custom CSS beyond `src/index.css` and `src/App.css` (minimal resets).

**Animations:** Framer Motion for section scroll-in and the experience timeline. `react-simple-typewriter` for the name effect in `ProfileSection`.

**Analytics:** Two systems run in parallel — **Vercel Analytics** (`@vercel/analytics`, zero-config) and **GA4** (`G-QSFT7C8DBJ`) via `@next/third-parties` `GoogleAnalytics` in `app/layout.jsx`. The CV download button in `Footer.jsx` fires a `download_cv` custom event via `window.gtag` (still provided by the GA component).

## Adding a New Section

1. Create `src/components/NewSection.jsx` using Chakra UI layout primitives.
2. Add content to both `data-fr.json` and `data-en.json`.
3. Add UI string keys to both `fr` and `en` translation objects in `src/i18n.js`.
4. Import and insert a `<MotionBox {...sectionAnim}>` block in `src/App.jsx`.
5. Add a nav anchor in `Navbar.jsx` if the section needs a navbar link.

Everything under `app/page.jsx` renders inside a `'use client'` boundary, so browser APIs (`window`, `document`) must stay inside `useEffect`/event handlers to survive SSR pre-rendering.
