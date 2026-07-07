# Hino A30 Landing Page UI Demo

This repository contains the UI demo for the Hino Motors Vietnam A30 anniversary landing page. It is a static frontend project built with Vite and React, intended as a starting point for client-side development, deployment, and future CMS or backend integration.

## Current Scope

This handoff includes:

- A responsive one-page landing page UI for desktop and mobile.
- Vietnamese and English frontend language switching.
- Static page content, images, timeline, video section, news section, anniversary profile CTA, footer, and UI animations.
- Automated tests for content structure, rendering, required assets, and key UI behavior.

This handoff does not include:

- Backend APIs.
- CMS integration.
- Database setup.
- Admin dashboard.
- Authentication.
- Form submission or lead capture.
- Production analytics/tracking setup.
- Final production hosting or CI/CD configuration.

The current codebase is therefore a frontend UI demo. The client development team can use it as the UI base and connect it to the backend, CMS, hosting, and operational stack selected for production.

## Tech Stack

- Vite
- React 19
- Tailwind CSS 4 / shadcn configuration
- GSAP, Lenis, and Motion for UI behavior and animation
- Node.js test runner

## Requirements

- A recent Node.js version compatible with Vite 8
- npm

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Default local URL:

```text
http://localhost:5173
```

Equivalent command:

```bash
npm run serve
```

## Production Build

```bash
npm run build
```

Build output:

```text
dist/
```

After Vite builds the app, `scripts/copy-assets.mjs` copies `src/assets` and `src/a30new.svg` into `dist/src` so the current static asset paths continue to work in the production build.

## Preview Production Build

```bash
npm run preview
```

Default preview URL:

```text
http://localhost:4173
```

## Tests

```bash
npm test
```

The tests cover:

- Required project files and assets.
- Vietnamese and English content structure.
- Section order and rendering output.
- Navigation, footer, timeline, news, video, and profile CTA behavior.
- Basic UI quality gates such as responsive overflow protection, focus states, placeholder handling, and unsafe URL filtering.

## Project Structure

```text
.
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── components.json
├── scripts/
│   └── copy-assets.mjs
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── content.js
│   ├── render.js
│   ├── styles.css
│   ├── motion.js
│   ├── smoothScroll.js
│   ├── timeline.js
│   ├── a30new.svg
│   ├── assets/
│   ├── components/
│   └── lib/
└── tests/
```

## Content and Data Model

Most page data currently lives in:

```text
src/content.js
```

This file includes:

- Vietnamese and English copy.
- Milestone entries.
- Image paths.
- YouTube video URL.
- Navigation and footer links.
- Statistics, news, profile, and contact data.

If a CMS is added later, `src/content.js` is the main reference for the data structure that should be moved into CMS fields or an API response.

## CMS and Backend Integration Notes

The development team may choose any CMS or backend stack that fits the client's infrastructure. Typical options include a headless CMS, an internal CMS, WordPress, Strapi, Sanity, Directus, or an existing enterprise content system.

Recommended integration targets:

- `content.vi` and `content.en` for bilingual page content.
- `assets.videoUrl` for the official video URL.
- `assets.companyProfileUrl` for the final anniversary profile or yearbook file/link.
- `sections.news.items` for managed news articles.
- `sections.statistics.items` for statistics that may need future updates.
- Footer links, office addresses, hotline numbers, and policy links for production accuracy.

When connecting a CMS or API, keep the Vietnamese and English content structures aligned so the language toggle can continue to switch the full page consistently.

## Deployment Notes

The simplest deployment path is static hosting:

1. Run `npm install`.
2. Run `npm run build`.
3. Deploy the generated `dist/` folder to the selected static host or CDN.

If the production version requires CMS/API data, the development team should decide:

- Where the frontend will be hosted.
- Where the API/CMS will be hosted.
- Whether the project should remain a static Vite app or move to another framework such as Next.js.
- How production media assets will be stored and delivered.
- How cache, CDN, content updates, and deployment approvals will work.

## Asset Path Notes

The rendered HTML currently references several assets with paths such as:

```text
src/assets/...
src/a30new.svg
```

The existing build script preserves those paths by copying assets into `dist/src`. If the team later refactors assets into Vite imports, a CMS media library, or a CDN, this copy step can be updated or removed together with the relevant tests.

## Developer Handoff Checklist

- Install dependencies with `npm install`.
- Run `npm test` to confirm the baseline.
- Run `npm run dev` and review `http://localhost:5173`.
- Run `npm run build` before deployment.
- Confirm final content, media, URLs, and contact details with the client.
- Select the CMS/backend/deployment stack for production.
- If CMS/API integration is added, preserve bilingual content parity and update tests for any schema changes.
