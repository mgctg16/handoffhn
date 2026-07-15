import test from "node:test";
import assert from "node:assert/strict";
import {
  TIMELINE_AUTOPLAY_DWELL_MS,
  TIMELINE_INTERACTION_RESUME_MS,
  calculateCenteredTarget,
  createTimelineAutoplayScheduler,
  getTimelineEdgeState,
  resolveTimelineKey,
  shouldStartTimelineDrag
} from "../src/timeline.js";

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

test("shouldStartTimelineDrag preserves clicks until movement clears the threshold", () => {
  assert.equal(shouldStartTimelineDrag(0), false);
  assert.equal(shouldStartTimelineDrag(6), false);
  assert.equal(shouldStartTimelineDrag(-6), false);
  assert.equal(shouldStartTimelineDrag(7), true);
  assert.equal(shouldStartTimelineDrag(-12), true);
});
