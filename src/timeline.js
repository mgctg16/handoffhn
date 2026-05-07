export function setupTimeline(section) {
  if (!section || typeof window === "undefined") {
    return () => {};
  }

  const viewport = section.querySelector(".timeline-viewport");
  const track = section.querySelector(".timeline-track");
  const progress = section.querySelector(".timeline-progress span");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!viewport || !track || !progress || !reduceMotion) {
    return () => {};
  }

  let dragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let frame = 0;

  function maxScroll() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  function setProgress() {
    const max = maxScroll();
    const ratio = max === 0 ? 0 : viewport.scrollLeft / max;
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
  }

  function syncPinnedScroll() {
    if (reduceMotion.matches || window.innerWidth < 900) {
      setProgress();
      return;
    }

    const rect = section.getBoundingClientRect();
    const pinDistance = Math.max(1, section.offsetHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, -rect.top / pinDistance));
    viewport.scrollLeft = maxScroll() * ratio;
    setProgress();
  }

  function requestSync() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(syncPinnedScroll);
  }

  function onPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    dragging = true;
    startX = event.clientX;
    startScrollLeft = viewport.scrollLeft;
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add("is-dragging");
  }

  function onPointerMove(event) {
    if (!dragging) {
      return;
    }

    const delta = event.clientX - startX;
    viewport.scrollLeft = startScrollLeft - delta;
    setProgress();
  }

  function onPointerUp(event) {
    if (!dragging) {
      return;
    }

    dragging = false;
    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    viewport.classList.remove("is-dragging");
  }

  function onKeyDown(event) {
    const step = Math.max(220, viewport.clientWidth * 0.45);

    if (event.key === "ArrowRight") {
      viewport.scrollBy({ left: step, behavior: reduceMotion.matches ? "auto" : "smooth" });
      event.preventDefault();
    }

    if (event.key === "ArrowLeft") {
      viewport.scrollBy({ left: -step, behavior: reduceMotion.matches ? "auto" : "smooth" });
      event.preventDefault();
    }
  }

  function addMotionListener() {
    if (typeof reduceMotion.addEventListener === "function") {
      reduceMotion.addEventListener("change", requestSync);
      return () => reduceMotion.removeEventListener("change", requestSync);
    }

    reduceMotion.addListener(requestSync);
    return () => reduceMotion.removeListener(requestSync);
  }

  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove);
  viewport.addEventListener("pointerup", onPointerUp);
  viewport.addEventListener("pointercancel", onPointerUp);
  viewport.addEventListener("scroll", setProgress, { passive: true });
  viewport.addEventListener("keydown", onKeyDown);
  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync);
  const removeMotionListener = addMotionListener();

  requestSync();

  return () => {
    cancelAnimationFrame(frame);
    viewport.removeEventListener("pointerdown", onPointerDown);
    viewport.removeEventListener("pointermove", onPointerMove);
    viewport.removeEventListener("pointerup", onPointerUp);
    viewport.removeEventListener("pointercancel", onPointerUp);
    viewport.removeEventListener("scroll", setProgress);
    viewport.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("scroll", requestSync);
    window.removeEventListener("resize", requestSync);
    removeMotionListener();
  };
}
