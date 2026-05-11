# Hino Client Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Apply the approved Hino client feedback by correcting logo assets, tightening typography, improving the hero, and adding subtle brand background patterns.

**Architecture:** Keep the current static HTML/CSS/ES module structure. Asset paths remain in `src/assets`, copy and render logic stays in `src/content.js` and `src/render.js`, and all visual changes stay in `src/styles.css`.

**Tech Stack:** Vanilla JavaScript ES modules, CSS, Node test runner.

---

### Task 1: Lock Asset Expectations

**Files:**
- Modify: `tests/static.test.mjs`
- Modify: `tests/content.test.mjs`

- [x] **Step 1: Update static asset existence tests**

Add `src/assets/a30-mark.svg` and `src/assets/hero-banner.png` to the shell file list in `tests/static.test.mjs`.

- [x] **Step 2: Add render assertions**

In `tests/static.test.mjs`, extend the logo/footer test to assert:

```js
assert.match(html, /src="src\/assets\/hino-logo\.svg"/);
assert.match(html, /src="src\/assets\/a30-mark\.svg"/);
assert.match(html, /src="src\/assets\/hero-banner\.png"/);
```

- [x] **Step 3: Add CSS assertions**

In `tests/static.test.mjs`, extend the CSS quality test to assert:

```js
assert.match(css, /Helvetica Neue/);
assert.match(css, /section-pattern/);
assert.doesNotMatch(css, /\.hino-logo\s*\{[^}]*border-radius/s);
assert.doesNotMatch(css, /\.hino-logo\s*\{[^}]*box-shadow/s);
```

- [x] **Step 4: Run tests and verify failure**

Run: `npm test`

Expected before implementation: tests fail because the CSS still uses the old typography and rounded/shadowed logo styling.

### Task 2: Replace and Preserve Brand Assets

**Files:**
- Modify: `src/assets/hino-logo.svg`
- Confirm: `src/assets/a30-mark.svg`
- Confirm: `src/assets/hero-banner.png`

- [x] **Step 1: Copy source Hino logo**

Run:

```bash
cp /Users/tienduonn/Downloads/Asset\ 1de.svg src/assets/hino-logo.svg
```

- [x] **Step 2: Copy source A30 mark**

Run:

```bash
cp /Users/tienduonn/Downloads/Asset\ 4de.svg src/assets/a30-mark.svg
```

- [x] **Step 3: Confirm checksums**

Run:

```bash
shasum -a 256 src/assets/hino-logo.svg /Users/tienduonn/Downloads/Asset\ 1de.svg src/assets/a30-mark.svg /Users/tienduonn/Downloads/Asset\ 4de.svg
```

Expected: project Hino logo hash matches `Asset 1de.svg`; project A30 mark hash matches `Asset 4de.svg`.

### Task 3: Adjust Hero Rendering

**Files:**
- Modify: `src/render.js`

- [x] **Step 1: Keep hero image rendered from `heroBannerUrl`**

Confirm `renderHero()` still renders:

```js
<img class="hero-image" src="${heroBannerUrl}" alt="Hino 30 years hero banner">
```

- [x] **Step 2: Hide competing visual copy while keeping accessible content**

Wrap hero text in a class that can be visually reduced for image-backed hero sections:

```html
<div class="hero-content">
```

Implementation remains in CSS so markup stays semantic and testable.

### Task 4: Apply Typography and Background Pattern

**Files:**
- Modify: `src/styles.css`

- [x] **Step 1: Switch font stack**

Change body and component font stacks to:

```css
font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
```

- [x] **Step 2: Remove logo rounding and shadow**

Update `.hino-logo`:

```css
.hino-logo {
  display: block;
  width: auto;
  height: 48px;
  object-fit: contain;
}
```

- [x] **Step 3: Tighten type scale**

Reduce major headings:

```css
h1 {
  font-size: clamp(2rem, 4.1vw, 4.1rem);
}

.split-copy h2,
.section-heading h2 {
  font-size: clamp(1.72rem, 3.15vw, 3rem);
}
```

- [x] **Step 4: Lighten hero overlay**

For image-backed hero:

```css
.hero-banner.has-image .hero-scrim {
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 48%, rgba(255, 255, 255, 0) 100%),
    linear-gradient(180deg, rgba(10, 18, 30, 0.02), rgba(10, 18, 30, 0.06));
}
```

- [x] **Step 5: Add section pattern utility**

Add CSS using `section-pattern` on existing sections:

```css
.section-pattern {
  position: relative;
  isolation: isolate;
}
```

Apply the class in selectors through CSS grouping or markup where appropriate.

### Task 5: Verify, Commit, and Push

**Files:**
- Modify: `tests/static.test.mjs`
- Modify: `src/assets/hino-logo.svg`
- Modify: `src/assets/a30-mark.svg`
- Modify: `src/styles.css`
- Optional Modify: `src/render.js`

- [x] **Step 1: Run full tests**

Run: `npm test`

Expected: all tests pass.

- [x] **Step 2: Run whitespace check**

Run: `git diff --check`

Expected: no output and exit 0.

- [x] **Step 3: Commit**

Run:

```bash
git add docs/superpowers/plans/2026-05-11-hino-client-feedback.md src/assets/hino-logo.svg src/assets/a30-mark.svg src/styles.css src/render.js tests/static.test.mjs tests/content.test.mjs
git commit -m "feat: apply hino client visual feedback"
```

- [x] **Step 4: Push**

Run:

```bash
git push origin main
```

