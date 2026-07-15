# Milestone Gesture-First Autoplay UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing milestone timeline discoverable and controllable without arrow buttons while preserving continuous autoplay, the approved layout, and restrained Hino-branded motion.

**Architecture:** Keep `src/timeline.js` as the single behavior owner, replacing the fixed interval with one reschedulable timeout and one cancellable scroll animation. Add only a bilingual gesture hint to the existing markup; edge fades, direction-aware reveal, color focus, dot pulse, and progress glint remain CSS-driven state effects. Pure timer, keyboard, and edge-state helpers make the interaction logic testable without adding a DOM test framework.

**Tech Stack:** Vite, React 19 shell with string-rendered milestone markup, vanilla DOM APIs, CSS animations, Node `node:test`, Playwright browser QA, existing GSAP dependency only where already used elsewhere.

---

## Execution Note

The current worktree already contains approved, uncommitted client-feedback changes in `src/render.js`, `src/timeline.js`, `src/styles.css`, and the related tests. Preserve those changes. Do not reset, checkout, stash, or replace those files wholesale. Stage only the intended files or hunks for each commit, and leave the unrelated `.agent`, `.playwright-cli`, and `output` changes untouched.

## File Map

- Modify `src/render.js`: add localized gesture hint copy and its semantic association with the timeline viewport.
- Modify `src/timeline.js`: add testable helpers, controlled autoplay scheduling, custom scroll settling, gesture/keyboard behavior, hint dismissal, edge state, direction state, and cleanup.
- Modify `src/styles.css`: add hint styling, edge fades, active reveal, color focus, one-shot dot pulse, progress glint, and reduced-motion overrides.
- Modify `tests/timeline.test.mjs`: unit-test scheduler, keyboard target resolution, and edge-state calculation.
- Modify `tests/static.test.mjs`: lock the new markup, passive progress behavior, controller structure, and motion/reduced-motion CSS.
- Reference `docs/superpowers/specs/2026-07-15-milestone-gesture-autoplay-ux-design.md`: approved behavior and acceptance criteria.

### Task 1: Add Bilingual Gesture Guidance Without Changing Layout

**Files:**
- Modify: `src/render.js:18-33`
- Modify: `src/render.js:364-433`
- Test: `tests/static.test.mjs:394-452`

- [ ] **Step 1: Write the failing render test**

Add this test after `rendered milestones expose unpinned horizontal timeline` in `tests/static.test.mjs`:

```js
test("rendered milestones explain gesture navigation and keep progress passive", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  const vi = renderPage(content.vi, "vi");
  const en = renderPage(content.en, "en");

  assert.match(vi, /aria-describedby="timeline-gesture-hint"/);
  assert.match(
    vi,
    /id="timeline-gesture-hint" class="timeline-gesture-hint"[\s\S]*Kéo hoặc vuốt để khám phá/
  );
  assert.match(en, /Drag or swipe to explore/);
  assert.match(vi, /class="timeline-progress"/);
  assert.doesNotMatch(vi, /timeline-progress[^>]*(button|slider|tabindex)/);
  assert.doesNotMatch(vi, /data-timeline-prev|data-timeline-next/);
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run:

```bash
node --test --test-name-pattern="gesture navigation" tests/static.test.mjs
```

Expected: FAIL because `timeline-gesture-hint` and `aria-describedby` are not rendered.

- [ ] **Step 3: Add localized hint copy**

Replace the unused `previous`, `next`, and `skip` values in `milestoneControlLabels` with `gestureHint`:

```js
const milestoneControlLabels = {
  vi: {
    headingLines: ["NHỮNG CỘT MỐC", "ĐÁNG NHỚ"],
    gradientLine: 1,
    gestureHint: "Kéo hoặc vuốt để khám phá"
  },
  en: {
    headingLines: ["MEMORABLE", "MILESTONES"],
    gradientLine: 1,
    gestureHint: "Drag or swipe to explore"
  }
};
```

- [ ] **Step 4: Render the hint and semantic association**

Update the timeline viewport and progress area in `renderMilestones`:

```js
<div
  class="timeline-viewport"
  tabindex="0"
  aria-label="${escapeHtml(section.heading)}"
  aria-describedby="timeline-gesture-hint"
>
  <div class="timeline-track">
    <div class="timeline-rail" aria-hidden="true">${markers}</div>
    <div class="timeline-canvas">
      ${items}
    </div>
  </div>
</div>
<p id="timeline-gesture-hint" class="timeline-gesture-hint">
  <span class="timeline-gesture-cue" aria-hidden="true">↔</span>
  <span>${escapeHtml(labels.gestureHint)}</span>
</p>
<div class="timeline-progress">
  <div class="timeline-progress-fill" data-timeline-progress role="progressbar" aria-label="Timeline scroll progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
</div>
```

- [ ] **Step 5: Run the focused test and full static test**

Run:

```bash
node --test --test-name-pattern="gesture navigation" tests/static.test.mjs
node --test tests/static.test.mjs
```

Expected: both commands PASS.

- [ ] **Step 6: Commit the render contract**

```bash
git add src/render.js tests/static.test.mjs
git commit -m "feat: add milestone gesture guidance"
```

### Task 2: Add Testable Timeline Scheduling And Navigation Helpers

**Files:**
- Modify: `src/timeline.js:1-6`
- Modify: `tests/timeline.test.mjs:1-15`

- [ ] **Step 1: Write failing helper tests**

Replace the import in `tests/timeline.test.mjs` and append the following tests:

```js
import {
  TIMELINE_AUTOPLAY_DWELL_MS,
  TIMELINE_INTERACTION_RESUME_MS,
  calculateCenteredTarget,
  createTimelineAutoplayScheduler,
  getTimelineEdgeState,
  resolveTimelineKey
} from "../src/timeline.js";

test("timeline timing constants match the approved cadence", () => {
  assert.equal(TIMELINE_AUTOPLAY_DWELL_MS, 4500);
  assert.equal(TIMELINE_INTERACTION_RESUME_MS, 3000);
});

test("createTimelineAutoplayScheduler keeps only one pending timer", () => {
  let nextId = 1;
  const timers = new Map();
  let advances = 0;
  const setTimer = (callback, delay) => {
    const id = nextId;
    nextId += 1;
    timers.set(id, { callback, delay });
    return id;
  };
  const clearTimer = (id) => timers.delete(id);
  const scheduler = createTimelineAutoplayScheduler({
    setTimer,
    clearTimer,
    onAdvance: () => {
      advances += 1;
    }
  });

  scheduler.schedule(TIMELINE_AUTOPLAY_DWELL_MS);
  scheduler.schedule(TIMELINE_INTERACTION_RESUME_MS);

  assert.equal(timers.size, 1);
  assert.equal([...timers.values()][0].delay, 3000);
  assert.equal(scheduler.hasPending(), true);

  [...timers.values()][0].callback();
  assert.equal(advances, 1);
  assert.equal(scheduler.hasPending(), false);
});

test("resolveTimelineKey supports arrows and boundaries", () => {
  assert.equal(resolveTimelineKey("ArrowLeft", 4, 18), 3);
  assert.equal(resolveTimelineKey("ArrowRight", 4, 18), 5);
  assert.equal(resolveTimelineKey("ArrowLeft", 0, 18), 0);
  assert.equal(resolveTimelineKey("ArrowRight", 18, 18), 18);
  assert.equal(resolveTimelineKey("Home", 8, 18), 0);
  assert.equal(resolveTimelineKey("End", 8, 18), 18);
  assert.equal(resolveTimelineKey("Enter", 8, 18), null);
});

test("getTimelineEdgeState reports available directions", () => {
  assert.deepEqual(getTimelineEdgeState(0, 1200), {
    canScrollLeft: false,
    canScrollRight: true
  });
  assert.deepEqual(getTimelineEdgeState(600, 1200), {
    canScrollLeft: true,
    canScrollRight: true
  });
  assert.deepEqual(getTimelineEdgeState(1200, 1200), {
    canScrollLeft: true,
    canScrollRight: false
  });
  assert.deepEqual(getTimelineEdgeState(0, 0), {
    canScrollLeft: false,
    canScrollRight: false
  });
});
```

- [ ] **Step 2: Run the unit tests and confirm failure**

Run:

```bash
node --test tests/timeline.test.mjs
```

Expected: FAIL because the constants and helper functions are not exported.

- [ ] **Step 3: Implement the timing, scheduler, keyboard, and edge helpers**

Add this block above `calculateCenteredTarget` in `src/timeline.js`:

```js
export const TIMELINE_AUTOPLAY_DWELL_MS = 4500;
export const TIMELINE_INTERACTION_RESUME_MS = 3000;
export const TIMELINE_SCROLL_DURATION_MS = 650;

export function createTimelineAutoplayScheduler({ setTimer, clearTimer, onAdvance }) {
  let timerId = null;

  function cancel() {
    if (timerId === null) {
      return;
    }
    clearTimer(timerId);
    timerId = null;
  }

  function schedule(delay) {
    cancel();
    timerId = setTimer(() => {
      timerId = null;
      onAdvance();
    }, delay);
  }

  return {
    schedule,
    cancel,
    hasPending: () => timerId !== null
  };
}

export function resolveTimelineKey(key, currentIndex, lastIndex) {
  if (key === "ArrowLeft") {
    return Math.max(0, currentIndex - 1);
  }
  if (key === "ArrowRight") {
    return Math.min(lastIndex, currentIndex + 1);
  }
  if (key === "Home") {
    return 0;
  }
  if (key === "End") {
    return lastIndex;
  }
  return null;
}

export function getTimelineEdgeState(scrollLeft, maximumScroll, tolerance = 2) {
  if (maximumScroll <= tolerance) {
    return { canScrollLeft: false, canScrollRight: false };
  }
  return {
    canScrollLeft: scrollLeft > tolerance,
    canScrollRight: scrollLeft < maximumScroll - tolerance
  };
}
```

- [ ] **Step 4: Run the unit tests**

Run:

```bash
node --test tests/timeline.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit the testable primitives**

```bash
git add src/timeline.js tests/timeline.test.mjs
git commit -m "refactor: add timeline scheduling primitives"
```

### Task 3: Replace Fixed Autoplay With A Controlled State Machine

**Files:**
- Modify: `src/timeline.js:7-287`
- Test: `tests/static.test.mjs:582-603`

- [ ] **Step 1: Write the failing controller-structure assertions**

Update `timeline uses native horizontal scrolling and respects reduced motion` in `tests/static.test.mjs`:

```js
test("timeline uses controlled autoplay and scoped interaction listeners", () => {
  const js = file("src/timeline.js");

  assert.match(js, /createTimelineAutoplayScheduler/);
  assert.match(js, /TIMELINE_AUTOPLAY_DWELL_MS/);
  assert.match(js, /TIMELINE_INTERACTION_RESUME_MS/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /visibilitychange/);
  assert.match(js, /viewport\.addEventListener\("wheel"/);
  assert.doesNotMatch(js, /window\.setInterval|setInterval\(/);
  assert.doesNotMatch(js, /window\.addEventListener\("wheel"/);
  assert.doesNotMatch(js, /data-timeline-prev|data-timeline-next/);
});
```

- [ ] **Step 2: Run the focused static test and confirm failure**

Run:

```bash
node --test --test-name-pattern="controlled autoplay" tests/static.test.mjs
```

Expected: FAIL because `setInterval`, global wheel handling, and dead arrow bindings still exist.

- [ ] **Step 3: Add one cancellable scroll animation**

Inside `setupTimeline`, replace native smooth scrolling with a requestAnimationFrame-based helper:

```js
let scrollAnimation = null;

function cancelScrollAnimation() {
  if (!scrollAnimation) {
    return;
  }
  window.cancelAnimationFrame(scrollAnimation.id);
  scrollAnimation.resolve(false);
  scrollAnimation = null;
}

function animateScrollTo(targetLeft, options = {}) {
  cancelScrollAnimation();
  const clampedTarget = Math.min(maxScroll(), Math.max(0, targetLeft));
  if (options.immediate || reduceMotion.matches) {
    viewport.scrollLeft = clampedTarget;
    applyProgress(currentScrollProgress(), ratios);
    return Promise.resolve(true);
  }

  const startLeft = viewport.scrollLeft;
  const distance = clampedTarget - startLeft;
  const startedAt = performance.now();

  return new Promise((resolve) => {
    function tick(now) {
      const progress = Math.min(1, (now - startedAt) / TIMELINE_SCROLL_DURATION_MS);
      const eased = 1 - Math.pow(1 - progress, 3);
      viewport.scrollLeft = startLeft + distance * eased;
      if (progress < 1) {
        scrollAnimation.id = window.requestAnimationFrame(tick);
        return;
      }
      scrollAnimation = null;
      viewport.scrollLeft = clampedTarget;
      applyProgress(currentScrollProgress(), ratios);
      resolve(true);
    }

    scrollAnimation = {
      id: window.requestAnimationFrame(tick),
      resolve
    };
  });
}
```

- [ ] **Step 4: Create one scheduler and explicit visibility state**

Replace `idleUntil` and `autoplayId` with:

```js
let isDragging = false;
let isSectionVisible = false;
let autoplayEnabled = !reduceMotion.matches && events.length > 1 && maxScroll() > 0;
let navigationToken = 0;

const autoplay = createTimelineAutoplayScheduler({
  setTimer: (callback, delay) => window.setTimeout(callback, delay),
  clearTimer: (id) => window.clearTimeout(id),
  onAdvance: advanceAutoplay
});

function canAutoplay() {
  return autoplayEnabled && isSectionVisible && !document.hidden && !isDragging;
}

function scheduleAutoplay(delay = TIMELINE_AUTOPLAY_DWELL_MS) {
  autoplay.cancel();
  if (canAutoplay()) {
    autoplay.schedule(delay);
  }
}

async function advanceAutoplay() {
  if (!canAutoplay()) {
    return;
  }
  const index = currentIndex();
  const nextIndex = index >= events.length - 1 ? 0 : index + 1;
  const completed = await goToIndex(nextIndex, {
    source: "autoplay",
    immediate: index >= events.length - 1
  });
  if (completed) {
    scheduleAutoplay();
  }
}
```

The wrap from the final milestone to the first milestone is immediate, followed by the approved active reveal. This avoids a long reverse sweep across all 19 milestones.

- [ ] **Step 5: Route all movement through the asynchronous `goToIndex`**

Replace `goToIndex` with:

```js
async function goToIndex(index, options = {}) {
  if (!ratios.length) {
    return false;
  }

  const token = navigationToken + 1;
  navigationToken = token;
  const safeIndex = Math.min(events.length - 1, Math.max(0, index));
  const fromIndex = currentIndex();
  const direction = options.direction || (safeIndex >= fromIndex ? "forward" : "backward");
  section.dataset.timelineDirection = direction;
  const targetLeft = targetLeftForEvent(events[safeIndex]);
  const completed = await animateScrollTo(targetLeft, options);
  if (!completed || token !== navigationToken) {
    return false;
  }
  applyProgress(currentScrollProgress(), ratios);
  return true;
}
```

Delete `scrollToProgress`, `pauseAutoplay`, `onPreviousClick`, `onNextClick`, `previousButton`, and `nextButton`; none are part of the approved gesture-first design.

- [ ] **Step 6: Scope visibility and wheel behavior to the timeline**

Add:

```js
const visibilityObserver = new IntersectionObserver((entries) => {
  isSectionVisible = entries.some((entry) => entry.isIntersecting);
  if (isSectionVisible) {
    scheduleAutoplay();
  } else {
    autoplay.cancel();
  }
}, { threshold: 0.2 });

function onVisibilityChange() {
  if (document.hidden) {
    autoplay.cancel();
  } else {
    scheduleAutoplay();
  }
}

function onViewportWheel(event) {
  if (Math.abs(event.deltaX) > 0) {
    autoplay.cancel();
    scheduleAutoplay(TIMELINE_INTERACTION_RESUME_MS);
  }
}
```

Register the observer on `section`, register `visibilitychange` on `document`, and register `wheel` only on `viewport`. Do not prevent the default vertical wheel behavior.

- [ ] **Step 7: Update cleanup**

Cleanup must include:

```js
autoplay.cancel();
cancelScrollAnimation();
visibilityObserver.disconnect();
document.removeEventListener("visibilitychange", onVisibilityChange);
viewport.removeEventListener("wheel", onViewportWheel);
```

Also remove all deleted arrow and global wheel/touch/key listeners from cleanup.

- [ ] **Step 8: Run controller tests**

Run:

```bash
node --test tests/timeline.test.mjs
node --test --test-name-pattern="controlled autoplay" tests/static.test.mjs
```

Expected: PASS, with no `setInterval` or dead arrow controller code.

- [ ] **Step 9: Commit controlled autoplay**

```bash
git add src/timeline.js tests/static.test.mjs
git commit -m "feat: control milestone autoplay lifecycle"
```

### Task 4: Add Gesture Completion, Keyboard Navigation, Hint Dismissal, And Edge State

**Files:**
- Modify: `src/timeline.js:120-287`
- Test: `tests/static.test.mjs:231-285`

- [ ] **Step 1: Write failing interaction assertions**

Add these assertions to the timeline interaction test in `tests/static.test.mjs`:

```js
assert.match(timeline, /addEventListener\("keydown", onViewportKeyDown\)/);
assert.match(timeline, /resolveTimelineKey\(/);
assert.match(timeline, /TIMELINE_INTERACTION_RESUME_MS/);
assert.match(timeline, /classList\.add\("has-interacted"\)/);
assert.match(timeline, /classList\.toggle\("can-scroll-left"/);
assert.match(timeline, /classList\.toggle\("can-scroll-right"/);
assert.match(timeline, /goToIndex\(currentIndex\(\), \{ source: "drag" \}\)/);
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run:

```bash
node --test --test-name-pattern="drag scrolling" tests/static.test.mjs
```

Expected: FAIL because keyboard navigation, hint dismissal, and edge classes do not exist.

- [ ] **Step 3: Add shared manual-interaction helpers**

Inside `setupTimeline`, add:

```js
function dismissGestureHint() {
  if (section.classList.contains("has-interacted")) {
    return;
  }
  section.classList.add("has-interacted");
  viewport.removeAttribute("aria-describedby");
}

function updateEdgeState() {
  const state = getTimelineEdgeState(viewport.scrollLeft, maxScroll());
  section.classList.toggle("can-scroll-left", state.canScrollLeft);
  section.classList.toggle("can-scroll-right", state.canScrollRight);
  section.classList.toggle("has-timeline-overflow", state.canScrollLeft || state.canScrollRight);
}

function resumeAfterInteraction() {
  scheduleAutoplay(TIMELINE_INTERACTION_RESUME_MS);
}

async function navigateManually(index, source) {
  autoplay.cancel();
  dismissGestureHint();
  await goToIndex(index, { source });
  resumeAfterInteraction();
}

function onViewportWheel(event) {
  if (Math.abs(event.deltaX) <= 0) {
    return;
  }
  autoplay.cancel();
  dismissGestureHint();
  resumeAfterInteraction();
}
```

- [ ] **Step 4: Complete drag behavior and centered settling**

Update the pointer handlers:

```js
function onPointerDown(event) {
  if (event.button !== 0 && event.pointerType === "mouse") {
    return;
  }
  autoplay.cancel();
  cancelScrollAnimation();
  isDragging = true;
  dragStartX = event.clientX;
  dragStartScrollLeft = viewport.scrollLeft;
  viewport.classList.add("is-dragging");
  viewport.setPointerCapture?.(event.pointerId);
}

function onPointerMove(event) {
  if (!isDragging) {
    return;
  }
  event.preventDefault();
  viewport.scrollLeft = dragStartScrollLeft - (event.clientX - dragStartX);
  applyProgress(currentScrollProgress(), ratios);
  updateEdgeState();
}

async function stopDragging(event) {
  if (!isDragging) {
    return;
  }
  isDragging = false;
  viewport.classList.remove("is-dragging");
  viewport.releasePointerCapture?.(event.pointerId);
  const moved = Math.abs(viewport.scrollLeft - dragStartScrollLeft) > 6;
  if (moved) {
    dismissGestureHint();
  }
  await goToIndex(currentIndex(), { source: "drag" });
  resumeAfterInteraction();
}
```

- [ ] **Step 5: Add year-click and keyboard navigation**

Use:

```js
function onMarkerClick(event) {
  navigateManually(markers.indexOf(event.currentTarget), "marker");
}

function onViewportKeyDown(event) {
  const targetIndex = resolveTimelineKey(event.key, currentIndex(), events.length - 1);
  if (targetIndex === null) {
    return;
  }
  event.preventDefault();
  navigateManually(targetIndex, "keyboard");
}
```

Register `keydown` on `viewport`, not `window`, so unrelated page shortcuts are unaffected.

- [ ] **Step 6: Update progress and edge state on every scroll/build**

Update `onViewportScroll` and `build`:

```js
function onViewportScroll() {
  applyProgress(currentScrollProgress(), ratios);
  updateEdgeState();
}

function build() {
  canvas.style.transform = "";
  const distance = maxScroll();
  const hasOverflow = distance > 0;
  ratios = eventCenterRatios(distance);
  autoplayEnabled = !reduceMotion.matches && events.length > 1 && hasOverflow;
  applyProgress(currentScrollProgress(), ratios);
  updateEdgeState();
  section.classList.toggle("is-static-timeline", !hasOverflow);
  if (!hasOverflow || section.classList.contains("has-interacted")) {
    viewport.removeAttribute("aria-describedby");
  } else {
    viewport.setAttribute("aria-describedby", "timeline-gesture-hint");
  }
  if (!autoplayEnabled) {
    autoplay.cancel();
  }
}
```

- [ ] **Step 7: Run unit and static tests**

Run:

```bash
node --test tests/timeline.test.mjs tests/static.test.mjs
```

Expected: PASS.

- [ ] **Step 8: Commit gesture and keyboard behavior**

```bash
git add src/timeline.js tests/static.test.mjs
git commit -m "feat: add gesture-first milestone controls"
```

### Task 5: Add Restrained Motion And Discoverability Styling

**Files:**
- Modify: `src/styles.css:1232-1582`
- Modify: `src/styles.css:2193-2242`
- Modify: `src/styles.css:2628-2655`
- Modify: `src/timeline.js:67-97`
- Test: `tests/static.test.mjs:231-285`
- Test: `tests/static.test.mjs:415-452`

- [ ] **Step 1: Write failing CSS contract assertions**

Add a new static test:

```js
test("timeline motion stays gesture-first, subtle, and reduced-motion safe", () => {
  const css = file("src/styles.css");
  const js = file("src/timeline.js");

  assert.match(css, /\.timeline-gesture-hint\s*\{/);
  assert.match(css, /\.timeline-pin::before/);
  assert.match(css, /\.timeline-pin::after/);
  assert.match(css, /\.can-scroll-left/);
  assert.match(css, /\.can-scroll-right/);
  assert.match(css, /@keyframes milestoneEnter/);
  assert.match(css, /@keyframes timelineDotPulse/);
  assert.match(css, /@keyframes timelineProgressGlint/);
  assert.match(css, /filter:\s*saturate\(0\.72\)/);
  assert.match(js, /timelineDirection/);
  assert.match(js, /is-entering/);
  assert.match(js, /is-advancing/);
  assert.doesNotMatch(css, /spotlight|cursor-follow|perspective\(/i);
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.timeline-progress-fill::after[\s\S]*display:\s*none/s
  );
});
```

- [ ] **Step 2: Run the motion test and confirm failure**

Run:

```bash
node --test --test-name-pattern="motion stays gesture-first" tests/static.test.mjs
```

Expected: FAIL because the hint, fades, keyframes, and state classes are not styled.

- [ ] **Step 3: Add hint, focus, and edge-fade CSS**

Add after `.timeline-viewport.is-dragging`:

```css
.timeline-viewport {
  touch-action: pan-y;
}

.timeline-viewport:focus-visible {
  outline: 2px solid rgba(201, 0, 0, 0.72);
  outline-offset: -4px;
}

.timeline-gesture-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: max-content;
  max-width: calc(100% - 36px);
  min-height: 28px;
  margin: 18px auto 0;
  color: #7a8594;
  font-size: clamp(0.82rem, 0.92vw, 0.94rem);
  font-weight: 600;
  transition: opacity 240ms ease, transform 240ms ease;
}

.timeline-gesture-cue {
  color: var(--hino-red);
  font-size: 1.1em;
  letter-spacing: 0.08em;
}

.timeline-section.has-interacted .timeline-gesture-hint,
.timeline-section.is-static-timeline .timeline-gesture-hint {
  opacity: 0;
  transform: translateY(4px);
  pointer-events: none;
}

.timeline-pin::before,
.timeline-pin::after {
  position: absolute;
  top: 0;
  bottom: 54px;
  z-index: 10;
  width: clamp(24px, 5vw, 72px);
  content: "";
  opacity: 0;
  pointer-events: none;
  transition: opacity 220ms ease;
}

.timeline-pin::before {
  left: 0;
  background: linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
}

.timeline-pin::after {
  right: 0;
  background: linear-gradient(270deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
}

.timeline-section.can-scroll-left .timeline-pin::before,
.timeline-section.can-scroll-right .timeline-pin::after {
  opacity: 0.92;
}
```

- [ ] **Step 4: Add active reveal, color focus, dot pulse, and progress glint**

Add these variables and rules near the milestone styles:

```css
.timeline-section {
  --milestone-active-scale: 1.2;
  --milestone-enter-x: 12px;
}

.timeline-section[data-timeline-direction="backward"] {
  --milestone-enter-x: -12px;
}

.milestone-image {
  filter: saturate(0.72) contrast(0.96);
  transition: filter 420ms ease, opacity 320ms ease;
}

.milestone-event.is-current .milestone-image {
  filter: saturate(1.08) contrast(1.06);
}

.milestone-event.is-entering .milestone-copy {
  animation: milestoneEnter 480ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.milestone-event.is-entering .milestone-card {
  animation: milestoneCardEnter 480ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.timeline-marker.is-entering .timeline-dot {
  animation: timelineDotPulse 520ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes milestoneEnter {
  from { opacity: 0.62; transform: translateX(var(--milestone-enter-x)); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes milestoneCardEnter {
  from { opacity: 0.82; transform: translateX(var(--milestone-enter-x)) translateY(0) scale(var(--milestone-active-scale)); }
  to { opacity: 1; transform: translateX(0) translateY(0) scale(var(--milestone-active-scale)); }
}

@keyframes timelineDotPulse {
  0% { box-shadow: 0 0 0 0 rgba(201, 0, 0, 0.34); }
  100% { box-shadow: 0 0 0 12px rgba(201, 0, 0, 0); }
}

.timeline-progress-fill::after {
  position: absolute;
  inset: 0 auto 0 -32px;
  width: 32px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent);
  content: "";
  opacity: 0;
}

.timeline-section.is-advancing .timeline-progress-fill::after {
  opacity: 1;
  animation: timelineProgressGlint 650ms ease-out;
}

@keyframes timelineProgressGlint {
  from { transform: translateX(0); }
  to { transform: translateX(352px); }
}
```

Replace hard-coded active scales with the variable:

```css
.milestone-event.is-current .milestone-card {
  transform: translateY(0) scale(var(--milestone-active-scale));
}

@media (max-width: 900px) {
  .timeline-section {
    --milestone-active-scale: 1.15;
  }
}
```

- [ ] **Step 5: Toggle one-shot motion state from the controller**

Track and clear motion timers:

```js
let motionTimerId = null;

function markEntering(index, direction, source) {
  events.forEach((event) => event.classList.remove("is-entering"));
  markers.forEach((marker) => marker.classList.remove("is-entering"));
  section.dataset.timelineDirection = direction;
  events[index]?.classList.add("is-entering");
  markers[index]?.classList.add("is-entering");
  section.classList.toggle("is-advancing", source === "autoplay");
  window.clearTimeout(motionTimerId);
  motionTimerId = window.setTimeout(() => {
    events[index]?.classList.remove("is-entering");
    markers[index]?.classList.remove("is-entering");
    section.classList.remove("is-advancing");
  }, TIMELINE_SCROLL_DURATION_MS);
}
```

Call `markEntering(safeIndex, direction, options.source)` immediately before `animateScrollTo` in `goToIndex`. Clear `motionTimerId` during cleanup.

- [ ] **Step 6: Add reduced-motion overrides**

Inside the existing reduced-motion media query, add:

```css
.milestone-event.is-entering .milestone-copy,
.milestone-event.is-entering .milestone-card,
.timeline-marker.is-entering .timeline-dot {
  animation: none;
}

.milestone-image {
  transition: none;
}

.timeline-progress-fill::after {
  display: none;
}
```

- [ ] **Step 7: Run motion and full tests**

Run:

```bash
node --test --test-name-pattern="motion stays gesture-first" tests/static.test.mjs
npm test
```

Expected: focused test and all tests PASS.

- [ ] **Step 8: Commit the motion polish**

```bash
git add src/styles.css src/timeline.js tests/static.test.mjs
git commit -m "feat: polish milestone gesture feedback"
```

### Task 6: Verify Responsive Behavior And Production Build

**Files:**
- Verify: `src/render.js`
- Verify: `src/timeline.js`
- Verify: `src/styles.css`
- Verify: `tests/timeline.test.mjs`
- Verify: `tests/static.test.mjs`

- [ ] **Step 1: Run whitespace and regression checks**

Run:

```bash
git diff --check
npm test
```

Expected: no whitespace errors and all tests PASS.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: Vite completes successfully and `dist/` contains the milestone assets.

- [ ] **Step 3: Start the local site**

Run:

```bash
npm run dev
```

Expected: Vite serves `http://localhost:5173/`.

- [ ] **Step 4: Verify desktop at 1440px and 1024px**

Check `#milestones` at both widths:

- initial milestone is `1996`;
- hint is visible before interaction;
- left and right fades reflect available content;
- autoplay advances one item after about 4.5 seconds;
- active copy/card settle in the correct direction;
- dot pulses once and progress glint runs only for autoplay;
- drag pauses motion and centers the nearest milestone on release;
- autoplay resumes three seconds after release;
- click on a year navigates and resumes after three seconds;
- `ArrowLeft`, `ArrowRight`, `Home`, and `End` work when the viewport is focused;
- progress bar cannot be clicked or dragged;
- no arrows, spotlight, tilt, or layout reflow appear.

- [ ] **Step 5: Verify mobile at 390px and 768px**

Check:

- swipe works without vertical page lock;
- active card remains unclipped;
- hint fits on one line or wraps cleanly without overlap;
- edge fades do not obscure active copy or block touch;
- autoplay resume behavior matches desktop;
- no horizontal page overflow occurs.

- [ ] **Step 6: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce` and confirm:

- manual centering and keyboard navigation work;
- translation, pulse, glint, and color animation are disabled;
- autoplay remains disabled according to the existing policy;
- hint and edge fades still communicate navigation.

- [ ] **Step 7: Inspect runtime errors**

Confirm there are no application console errors, no repeated timers after language switching, and no leaked listeners after React Strict Mode cleanup/reinitialization. An external YouTube permissions-policy message may be recorded separately but must not be attributed to the timeline.

- [ ] **Step 8: Commit final verification fixes if needed**

If QA requires a source correction, stage only the affected source and test files, then commit:

```bash
git add src/render.js src/timeline.js src/styles.css tests/timeline.test.mjs tests/static.test.mjs
git commit -m "fix: finalize milestone gesture UX"
```

If no correction is required, do not create an empty commit.
