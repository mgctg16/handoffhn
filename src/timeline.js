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

export function shouldStartTimelineDrag(deltaX, tolerance = 6) {
  return Math.abs(deltaX) > tolerance;
}

export function calculateCenteredTarget(eventOffsetLeft, eventWidth, viewportWidth, maximumScroll) {
  const upperBound = Math.max(0, maximumScroll);
  const centeredTarget = eventOffsetLeft + eventWidth / 2 - viewportWidth / 2;
  return Math.min(upperBound, Math.max(0, centeredTarget));
}

export function setupTimeline(section) {
  if (!section || typeof window === "undefined") {
    return () => {};
  }

  const viewport = section.querySelector(".timeline-viewport");
  const track = section.querySelector(".timeline-track");
  const canvas = section.querySelector(".timeline-canvas");
  const events = Array.from(section.querySelectorAll(".milestone-event"));
  const markers = Array.from(section.querySelectorAll("[data-timeline-marker]"));
  const progressFill = section.querySelector("[data-timeline-progress]");
  const initialYear = section.dataset.initialYear;
  const initialIndex = events.findIndex((event) => event.dataset.year === initialYear);

  if (!viewport || !track || !canvas || !events.length) {
    return () => {};
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let ratios = [];
  let currentProgress = 0;
  let isDragging = false;
  let isSectionVisible = false;
  let autoplayEnabled = false;
  let navigationToken = 0;
  let scrollAnimation = null;
  let motionTimerId = null;
  let dragHasMoved = false;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;

  const autoplay = createTimelineAutoplayScheduler({
    setTimer: (callback, delay) => window.setTimeout(callback, delay),
    clearTimer: (id) => window.clearTimeout(id),
    onAdvance: advanceAutoplay
  });

  function maxScroll() {
    return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  }

  function currentScrollProgress() {
    const distance = maxScroll();
    if (distance <= 0) {
      return 1;
    }
    return Math.min(1, Math.max(0, viewport.scrollLeft / distance));
  }

  function targetLeftForEvent(event) {
    return calculateCenteredTarget(
      event.offsetLeft,
      event.offsetWidth,
      viewport.clientWidth,
      maxScroll()
    );
  }

  function eventCenterRatios(distance) {
    if (distance <= 0) {
      return events.map(() => 0);
    }
    return events.map((event) => {
      const targetTravel = targetLeftForEvent(event);
      return Math.min(1, Math.max(0, targetTravel / distance));
    });
  }

  function applyProgress(progress, ratios) {
    currentProgress = progress;
    let activeIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < events.length; i += 1) {
      const distance = Math.abs(progress - ratios[i]);
      events[i].classList.remove("is-active", "is-current");
      events[i].removeAttribute("aria-current");
      markers[i]?.classList.remove("is-active", "is-current");
      markers[i]?.removeAttribute("aria-current");
      if (distance < closestDistance) {
        closestDistance = distance;
        activeIndex = i;
      }
    }
    if (progress >= 0.995) {
      activeIndex = events.length - 1;
    }
    if (events[activeIndex]) {
      events[activeIndex].classList.add("is-active", "is-current");
      events[activeIndex].setAttribute("aria-current", "step");
    }
    if (markers[activeIndex]) {
      markers[activeIndex].classList.add("is-active", "is-current");
      markers[activeIndex].setAttribute("aria-current", "step");
    }
    if (progressFill) {
      progressFill.style.transform = `scaleX(${progress})`;
      progressFill.setAttribute("aria-valuenow", Math.round(progress * 100));
    }
  }

  function currentIndex() {
    if (!ratios.length) {
      return 0;
    }

    let index = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < ratios.length; i += 1) {
      const distance = Math.abs(currentProgress - ratios[i]);
      if (distance < closestDistance) {
        closestDistance = distance;
        index = i;
      }
    }
    return index;
  }

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

  async function goToIndex(index, options = {}) {
    if (!ratios.length) {
      return false;
    }

    const token = navigationToken + 1;
    navigationToken = token;
    const safeIndex = Math.min(events.length - 1, Math.max(0, index));
    const fromIndex = currentIndex();
    const direction = options.direction || (safeIndex >= fromIndex ? "forward" : "backward");
    const targetLeft = targetLeftForEvent(events[safeIndex]);
    markEntering(safeIndex, direction, options.source);
    const completed = await animateScrollTo(targetLeft, options);
    if (!completed || token !== navigationToken) {
      return false;
    }
    applyProgress(currentScrollProgress(), ratios);
    return true;
  }

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

  function onResize() {
    build();
  }

  function onMotionChange() {
    build();
    scheduleAutoplay();
  }

  function onViewportScroll() {
    applyProgress(currentScrollProgress(), ratios);
    updateEdgeState();
  }

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
    section.classList.toggle(
      "has-timeline-overflow",
      state.canScrollLeft || state.canScrollRight
    );
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

  function onPointerDown(event) {
    if (event.button !== 0 && event.pointerType === "mouse") {
      return;
    }
    autoplay.cancel();
    cancelScrollAnimation();
    isDragging = true;
    dragHasMoved = false;
    dragStartX = event.clientX;
    dragStartScrollLeft = viewport.scrollLeft;
  }

  function onPointerMove(event) {
    if (!isDragging) {
      return;
    }
    const deltaX = event.clientX - dragStartX;
    if (!dragHasMoved) {
      if (!shouldStartTimelineDrag(deltaX)) {
        return;
      }
      dragHasMoved = true;
      viewport.classList.add("is-dragging");
      viewport.setPointerCapture?.(event.pointerId);
    }
    event.preventDefault();
    viewport.scrollLeft = dragStartScrollLeft - deltaX;
    applyProgress(currentScrollProgress(), ratios);
    updateEdgeState();
  }

  async function stopDragging(event) {
    if (!isDragging) {
      return;
    }
    const moved = dragHasMoved;
    isDragging = false;
    dragHasMoved = false;
    viewport.classList.remove("is-dragging");
    if (viewport.hasPointerCapture?.(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    if (!moved) {
      resumeAfterInteraction();
      return;
    }
    dismissGestureHint();
    await goToIndex(currentIndex(), { source: "drag" });
    resumeAfterInteraction();
  }

  function onVisibilityChange() {
    if (document.hidden) {
      autoplay.cancel();
    } else {
      scheduleAutoplay();
    }
  }

  function onViewportWheel(event) {
    if (Math.abs(event.deltaX) <= 0) {
      return;
    }
    autoplay.cancel();
    cancelScrollAnimation();
    dismissGestureHint();
    resumeAfterInteraction();
  }

  const visibilityObserver = new IntersectionObserver((entries) => {
    isSectionVisible = entries.some((entry) => entry.isIntersecting);
    if (isSectionVisible) {
      scheduleAutoplay();
    } else {
      autoplay.cancel();
    }
  }, { threshold: 0.2 });

  build();
  if (initialIndex >= 0) {
    goToIndex(initialIndex, { immediate: true });
  }

  visibilityObserver.observe(section);

  viewport.addEventListener("scroll", onViewportScroll, { passive: true });
  viewport.addEventListener("wheel", onViewportWheel, { passive: true });
  viewport.addEventListener("keydown", onViewportKeyDown);
  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove);
  viewport.addEventListener("pointerup", stopDragging);
  viewport.addEventListener("pointercancel", stopDragging);
  viewport.addEventListener("lostpointercapture", stopDragging);
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibilityChange);
  markers.forEach((marker) => {
    marker.addEventListener("click", onMarkerClick);
  });
  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", onMotionChange);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(onMotionChange);
  }

  return () => {
    autoplay.cancel();
    cancelScrollAnimation();
    window.clearTimeout(motionTimerId);
    visibilityObserver.disconnect();
    viewport.removeEventListener("scroll", onViewportScroll);
    viewport.removeEventListener("wheel", onViewportWheel);
    viewport.removeEventListener("keydown", onViewportKeyDown);
    viewport.removeEventListener("pointerdown", onPointerDown);
    viewport.removeEventListener("pointermove", onPointerMove);
    viewport.removeEventListener("pointerup", stopDragging);
    viewport.removeEventListener("pointercancel", stopDragging);
    viewport.removeEventListener("lostpointercapture", stopDragging);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    markers.forEach((marker) => {
      marker.removeEventListener("click", onMarkerClick);
    });
    if (typeof reduceMotion.removeEventListener === "function") {
      reduceMotion.removeEventListener("change", onMotionChange);
    } else if (typeof reduceMotion.removeListener === "function") {
      reduceMotion.removeListener(onMotionChange);
    }
  };
}
