# Centered Milestone Highlight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Center the active milestone on every viewport and give its image, year, and text a restrained Hino-red 3D highlight.

**Architecture:** Keep the native horizontal scroller and its existing state classes. Add a small exported geometry helper to calculate a clamped center target, give the rail and canvas symmetric responsive gutters so the first and last items can center, and express the depth treatment entirely through the current `is-current` CSS state.

**Tech Stack:** React 19, Vite 8, vanilla JavaScript, CSS, Node test runner, Playwright for visual verification.

---

## File Map

- Modify `src/timeline.js`: export and use the centered-scroll geometry helper.
- Modify `src/styles.css`: add symmetric carousel gutters, centered snapping, active-state color, lift, scale, shadow, responsive behavior, and reduced-motion behavior.
- Create `tests/timeline.test.mjs`: unit-test the center-target math and boundary clamping.
- Modify `tests/static.test.mjs`: replace the former leading-edge contract with centered-layout and red-highlight contracts.

### Task 1: Center-target geometry

**Files:**
- Create: `tests/timeline.test.mjs`
- Modify: `src/timeline.js:1-48`

- [ ] **Step 1: Write the failing center-geometry test**

Create `tests/timeline.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { calculateCenteredTarget } from "../src/timeline.js";

test("calculateCenteredTarget centers milestones and clamps both edges", () => {
  const viewportWidth = 1200;
  const eventWidth = 420;
  const maximumScroll = 840;

  assert.equal(calculateCenteredTarget(390, eventWidth, viewportWidth, maximumScroll), 0);
  assert.equal(calculateCenteredTarget(810, eventWidth, viewportWidth, maximumScroll), 420);
  assert.equal(calculateCenteredTarget(1230, eventWidth, viewportWidth, maximumScroll), 840);
  assert.equal(calculateCenteredTarget(-100, eventWidth, viewportWidth, maximumScroll), 0);
  assert.equal(calculateCenteredTarget(1800, eventWidth, viewportWidth, maximumScroll), 840);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
node --test tests/timeline.test.mjs
```

Expected: FAIL because `src/timeline.js` does not export `calculateCenteredTarget`.

- [ ] **Step 3: Implement the geometry helper and use it in timeline navigation**

Add before `setupTimeline` in `src/timeline.js`:

```js
export function calculateCenteredTarget(eventOffsetLeft, eventWidth, viewportWidth, maximumScroll) {
  const upperBound = Math.max(0, maximumScroll);
  const centeredTarget = eventOffsetLeft + eventWidth / 2 - viewportWidth / 2;
  return Math.min(upperBound, Math.max(0, centeredTarget));
}
```

Replace `targetLeftForEvent` with:

```js
function targetLeftForEvent(event) {
  return calculateCenteredTarget(
    event.offsetLeft,
    event.offsetWidth,
    viewport.clientWidth,
    maxScroll()
  );
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
node --test tests/timeline.test.mjs
```

Expected: 1 test passes and 0 fail.

- [ ] **Step 5: Commit the geometry change**

```bash
git add src/timeline.js tests/timeline.test.mjs
git commit -m "feat: center milestone navigation targets"
```

### Task 2: Centered layout and active 3D treatment

**Files:**
- Modify: `tests/static.test.mjs:227-242`
- Modify: `src/styles.css:27-58,1287-1523,2181-2225,2614-2640`

- [ ] **Step 1: Replace the old leading-edge static assertions with centered-highlight assertions**

Update the body of `test("timeline supports drag scrolling without active text reflow", ...)` in `tests/static.test.mjs` to include these contracts while retaining the existing pointer-drag, end-state, and no-font-reflow checks:

```js
assert.match(
  timeline,
  /calculateCenteredTarget\(\s*event\.offsetLeft,\s*event\.offsetWidth,\s*viewport\.clientWidth,\s*maxScroll\(\)\s*\)/s
);
assert.match(
  styles,
  /--timeline-center-gutter:\s*max\(0px, calc\(\(100vw - var\(--timeline-item-width\)\) \/ 2\)\)/
);
assert.match(styles, /\.milestone-event\s*\{[^}]*scroll-snap-align:\s*center/s);

const currentYearBlock = styles.match(/\.timeline-marker\.is-current \.timeline-marker-year \{[\s\S]*?\n\}/)?.[0] || "";
assert.match(currentYearBlock, /color:\s*var\(--hino-red\)/);

const currentTitleBlock = styles.match(/\.milestone-event\.is-current \.milestone-title \{[\s\S]*?\n\}/)?.[0] || "";
assert.match(currentTitleBlock, /color:\s*var\(--hino-red\)/);
assert.doesNotMatch(currentTitleBlock, /font-weight/);

const currentEventBlock = styles.match(/\.milestone-event\.is-current \{[\s\S]*?\n\}/)?.[0] || "";
assert.match(currentEventBlock, /translateY\(-20px\) scale\(1\.08\)/);

const currentCardBlock = styles.match(/\.milestone-event\.is-current \.milestone-card \{[\s\S]*?\n\}/)?.[0] || "";
assert.match(currentCardBlock, /box-shadow:/);
```

- [ ] **Step 2: Run the focused static test and verify it fails**

Run:

```bash
node --test --test-name-pattern="timeline supports drag scrolling" tests/static.test.mjs
```

Expected: FAIL because the stylesheet still uses the leading gutter, start snapping, dark active text, and no active-event scale.

- [ ] **Step 3: Add symmetric responsive gutters**

In `:root`, replace `--timeline-leading-gutter` and `--timeline-gutter` with:

```css
--timeline-center-gutter: max(0px, calc((100vw - var(--timeline-item-width)) / 2));
```

Remove the left padding and scroll padding from `.timeline-viewport`. Change `.timeline-rail` to use symmetric padding:

```css
.timeline-rail {
  padding: 0 var(--timeline-center-gutter);
}
```

Give `.timeline-canvas` the same symmetric padding and remove the former trailing `::after` spacer:

```css
.timeline-canvas {
  padding: 0 var(--timeline-center-gutter);
}

.timeline-canvas::after {
  content: none;
}
```

Change the milestone snap point:

```css
.milestone-event {
  scroll-snap-align: center;
}
```

Within `@media (max-width: 900px)`, set the shared item width once and reuse it for the rail, markers, and events:

```css
.timeline-section {
  --timeline-item-width: min(84vw, 420px);
}

.timeline-rail {
  grid-template-columns: repeat(19, minmax(var(--timeline-item-width), 1fr));
}

.timeline-marker {
  min-width: var(--timeline-item-width);
}

.milestone-event {
  flex-basis: var(--timeline-item-width);
  width: var(--timeline-item-width);
}
```

- [ ] **Step 4: Add the active red and depth treatment**

Extend `.timeline-marker-year` with a color transition, then add:

```css
.timeline-marker.is-current .timeline-marker-year {
  color: var(--hino-red);
  font-weight: 700;
}
```

Extend `.milestone-event` with a transform transition and add:

```css
.milestone-event.is-current {
  z-index: 4;
  transform: translateY(-20px) scale(1.08);
}
```

Keep the current title weight unchanged and update its color:

```css
.milestone-event.is-current .milestone-title {
  color: var(--hino-red);
  line-height: 1.32;
}
```

Add `box-shadow` to the existing active-card rule:

```css
.milestone-event.is-current .milestone-card {
  opacity: 1;
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.24), 0 8px 20px rgba(201, 0, 0, 0.1);
}
```

Add the compact effect after the `max-width: 900px` block:

```css
@media (max-width: 700px) {
  .milestone-event.is-current {
    transform: translateY(-12px) scale(1.04);
  }
}
```

Inside `@media (prefers-reduced-motion: reduce)`, disable the decorative transform while preserving the centered position and red state:

```css
.milestone-event.is-current {
  transform: none;
}
```

- [ ] **Step 5: Run the focused and complete test suites**

Run:

```bash
node --test --test-name-pattern="timeline supports drag scrolling" tests/static.test.mjs
npm test
```

Expected: the focused test passes; the complete suite reports 0 failures.

- [ ] **Step 6: Commit the visual behavior**

```bash
git add src/styles.css tests/static.test.mjs
git commit -m "feat: highlight centered milestone"
```

### Task 3: Production and browser verification

**Files:**
- Verify: `src/timeline.js`
- Verify: `src/styles.css`

- [ ] **Step 1: Build the production bundle**

Run:

```bash
npm run build
```

Expected: Vite completes successfully and `scripts/copy-assets.mjs` finishes without an error.

- [ ] **Step 2: Start the local development server**

Run:

```bash
npm run dev
```

Expected: Vite reports the site at `http://localhost:5173/`.

- [ ] **Step 3: Verify desktop behavior at 1440px and 1024px**

Open `http://localhost:5173/#milestones` at 1440px and 1024px widths and verify:

- The active milestone image is horizontally centered.
- Previous and next milestones remain partially visible.
- Active dot, year, and event text are Hino red.
- Active content lifts and scales without clipping or overlapping the arrow controls.
- Arrow navigation, marker selection, drag scrolling, and autoplay all update the same centered milestone.
- The first, a middle, and the 2026 milestones can each reach the center without horizontal or vertical clipping.
- The browser console has no errors.

- [ ] **Step 4: Verify compact behavior at 320px and 768px**

At both widths, verify the active card centers, narrow neighboring previews remain visible, text stays legible, horizontal dragging works, and no horizontal or vertical clipping appears.

- [ ] **Step 5: Verify language switching and reduced motion**

Switch between Vietnamese and English and confirm the same active styling and centering behavior. Emulate `prefers-reduced-motion: reduce` and confirm milestone navigation still centers items without the scale/lift transform.

- [ ] **Step 6: Confirm the working tree only contains intended changes**

Run:

```bash
git status --short
```

Expected: no uncommitted source or test changes remain; only deliberate runtime artifacts, if any, are reported.
