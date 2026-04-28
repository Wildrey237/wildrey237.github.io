# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start local dev server (Vite HMR)
npm run build     # Production build → dist/
npm run preview   # Preview the production build locally
npm run lint      # ESLint check
```

No test suite is configured.

## Branch & Deployment Model

- **`work`** — development branch (all source code lives here)
- **`main`** — production branch, contains only the compiled `dist/` output served by GitHub Pages

**Do not commit source code to `main`.** Deployment is automated: every push to `work` triggers `.github/workflows/deploy.yml`, which runs `npm run build` and pushes `dist/` to `main` via the JamesIves deploy action.

## Architecture

**Entry point:** `src/main.jsx` bootstraps React with `ChakraProvider` (light mode default, no system preference) and imports `src/i18n.js` before `App`.

**`src/App.jsx`** composes the full page: `ScrollProgressBar` → `Navbar` → five `MotionBox`-wrapped sections (Profile, Skills, Experience, Education, Projects) → `Footer`. Each section animates in on scroll via a shared Framer Motion `whileInView` config.

**Data layer:** All content lives in two JSON files:
- `src/data/data-fr.json` — French content
- `src/data/data-en.json` — English content

Components import both files and select the active one based on the current i18next language. **Keep both files structurally in sync** when adding or removing fields.

**i18n (`src/i18n.js`):** Uses i18next + browser language detector. Detection order: querystring → localStorage → cookie → navigator. Fallback language is English. UI strings (navbar labels, button text, section titles) live in `src/i18n.js` resources; profile/skills/experience data lives in the JSON files.

**Styling:** Chakra UI v2 throughout. Color mode is toggled via Chakra's `useColorMode` hook. No custom CSS beyond `src/index.css` and `src/App.css` (minimal resets).

**Animations:** Framer Motion for section scroll-in and the experience timeline. `react-simple-typewriter` for the name effect in `ProfileSection`.

**Analytics:** GA4 tag (`G-QSFT7C8DBJ`) is loaded in `index.html`. The CV download button in `Footer.jsx` fires a `download_cv` custom event via `window.gtag`.

## Adding a New Section

1. Create `src/components/NewSection.jsx` using Chakra UI layout primitives.
2. Add content to both `data-fr.json` and `data-en.json`.
3. Add UI string keys to both `fr` and `en` translation objects in `src/i18n.js`.
4. Import and insert a `<MotionBox {...sectionAnim}>` block in `src/App.jsx`.
5. Add a nav anchor in `Navbar.jsx` if the section needs a navbar link.
