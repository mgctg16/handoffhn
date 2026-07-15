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
  const previousButton = section.querySelector("[data-timeline-prev]");
  const nextButton = section.querySelector("[data-timeline-next]");
  const progressFill = section.querySelector("[data-timeline-progress]");
  const initialYear = section.dataset.initialYear;
  const initialIndex = events.findIndex((event) => event.dataset.year === initialYear);

  if (!viewport || !track || !canvas || !events.length) {
    return () => {};
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let ratios = [];
  let currentProgress = 0;
  let idleUntil = 0;
  let autoplayId = null;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;

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

  function scrollToProgress(progress, options = {}) {
    const clamped = Math.min(1, Math.max(0, progress));
    viewport.scrollTo({
      left: clamped * maxScroll(),
      behavior: options.immediate || reduceMotion.matches ? "auto" : "smooth"
    });
    applyProgress(clamped, ratios);
  }

  function goToIndex(index, options = {}) {
    if (!ratios.length) {
      return;
    }

    const safeIndex = Math.min(events.length - 1, Math.max(0, index));
    const targetLeft = targetLeftForEvent(events[safeIndex]);
    const distance = maxScroll();
    viewport.scrollTo({
      left: targetLeft,
      behavior: options.immediate || reduceMotion.matches ? "auto" : "smooth"
    });
    applyProgress(distance > 0 ? targetLeft / distance : 1, ratios);
  }

  function pauseAutoplay(duration = 5200) {
    idleUntil = Date.now() + duration;
  }

  function build() {
    canvas.style.transform = "";
    events.forEach((event) => {
      event.classList.remove("is-active", "is-current");
      event.removeAttribute("aria-current");
    });
    markers.forEach((marker) => {
      marker.classList.remove("is-active", "is-current");
      marker.removeAttribute("aria-current");
    });

    const distance = maxScroll();
    ratios = eventCenterRatios(distance);
    applyProgress(currentScrollProgress(), ratios);
  }

  function onResize() {
    build();
  }

  function onMotionChange() {
    build();
  }

  function onViewportScroll() {
    applyProgress(currentScrollProgress(), ratios);
  }

  function onPreviousClick() {
    pauseAutoplay();
    goToIndex(currentIndex() - 1);
  }

  function onNextClick() {
    pauseAutoplay();
    goToIndex(currentIndex() + 1);
  }

  function onMarkerClick(event) {
    pauseAutoplay();
    goToIndex(markers.indexOf(event.currentTarget));
  }

  function onUserInput() {
    pauseAutoplay();
  }

  function onPointerDown(event) {
    if (event.button !== 0 && event.pointerType === "mouse") {
      return;
    }
    pauseAutoplay();
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
  }

  function stopDragging(event) {
    if (!isDragging) {
      return;
    }
    isDragging = false;
    viewport.classList.remove("is-dragging");
    viewport.releasePointerCapture?.(event.pointerId);
  }

  function isTimelineVisible() {
    const rect = section.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;
  }

  build();
  if (initialIndex >= 0) {
    goToIndex(initialIndex, { immediate: true });
  }

  if (!reduceMotion.matches) {
    autoplayId = window.setInterval(() => {
      if (document.hidden || Date.now() < idleUntil || !isTimelineVisible()) {
        return;
      }

      const nextIndex = currentIndex() >= events.length - 1 ? 0 : currentIndex() + 1;
      goToIndex(nextIndex);
    }, 2200);
  }

  viewport.addEventListener("scroll", onViewportScroll, { passive: true });
  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove);
  viewport.addEventListener("pointerup", stopDragging);
  viewport.addEventListener("pointercancel", stopDragging);
  viewport.addEventListener("lostpointercapture", stopDragging);
  window.addEventListener("resize", onResize);
  window.addEventListener("wheel", onUserInput, { passive: true });
  window.addEventListener("touchstart", onUserInput, { passive: true });
  window.addEventListener("keydown", onUserInput);
  previousButton?.addEventListener("click", onPreviousClick);
  nextButton?.addEventListener("click", onNextClick);
  markers.forEach((marker) => {
    marker.addEventListener("click", onMarkerClick);
  });
  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", onMotionChange);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(onMotionChange);
  }

  return () => {
    viewport.removeEventListener("scroll", onViewportScroll);
    viewport.removeEventListener("pointerdown", onPointerDown);
    viewport.removeEventListener("pointermove", onPointerMove);
    viewport.removeEventListener("pointerup", stopDragging);
    viewport.removeEventListener("pointercancel", stopDragging);
    viewport.removeEventListener("lostpointercapture", stopDragging);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("wheel", onUserInput);
    window.removeEventListener("touchstart", onUserInput);
    window.removeEventListener("keydown", onUserInput);
    previousButton?.removeEventListener("click", onPreviousClick);
    nextButton?.removeEventListener("click", onNextClick);
    markers.forEach((marker) => {
      marker.removeEventListener("click", onMarkerClick);
    });
    if (autoplayId) {
      window.clearInterval(autoplayId);
    }
    if (typeof reduceMotion.removeEventListener === "function") {
      reduceMotion.removeEventListener("change", onMotionChange);
    } else if (typeof reduceMotion.removeListener === "function") {
      reduceMotion.removeListener(onMotionChange);
    }
  };
}
