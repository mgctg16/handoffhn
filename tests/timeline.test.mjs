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
