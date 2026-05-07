export function setupContestCarousel(section) {
  if (!section || typeof window === "undefined") {
    return () => {};
  }

  const viewport = section.querySelector(".contest-carousel");
  const track = section.querySelector(".contest-track");
  const prev = section.querySelector("[data-carousel-prev]");
  const next = section.querySelector("[data-carousel-next]");

  if (!viewport || !track || !prev || !next) {
    return () => {};
  }

  let dragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let frame = 0;

  function maxScroll() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  function updateButtons() {
    const max = maxScroll();
    prev.disabled = viewport.scrollLeft <= 2;
    next.disabled = viewport.scrollLeft >= max - 2;
  }

  function requestUpdate() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(updateButtons);
  }

  function scrollStep() {
    const firstCard = track.querySelector(".contest-card");
    if (!firstCard) {
      return viewport.clientWidth * 0.8;
    }

    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
    return firstCard.getBoundingClientRect().width + gap;
  }

  function scrollByCards(direction) {
    viewport.scrollBy({
      left: scrollStep() * direction,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
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

    viewport.scrollLeft = startScrollLeft - (event.clientX - startX);
    requestUpdate();
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
    if (event.key === "ArrowRight") {
      scrollByCards(1);
      event.preventDefault();
    }

    if (event.key === "ArrowLeft") {
      scrollByCards(-1);
      event.preventDefault();
    }
  }

  function onPrevClick() {
    scrollByCards(-1);
  }

  function onNextClick() {
    scrollByCards(1);
  }

  prev.addEventListener("click", onPrevClick);
  next.addEventListener("click", onNextClick);
  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove);
  viewport.addEventListener("pointerup", onPointerUp);
  viewport.addEventListener("pointercancel", onPointerUp);
  viewport.addEventListener("scroll", requestUpdate, { passive: true });
  viewport.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", requestUpdate);

  requestUpdate();

  return () => {
    cancelAnimationFrame(frame);
    prev.removeEventListener("click", onPrevClick);
    next.removeEventListener("click", onNextClick);
    viewport.removeEventListener("pointerdown", onPointerDown);
    viewport.removeEventListener("pointermove", onPointerMove);
    viewport.removeEventListener("pointerup", onPointerUp);
    viewport.removeEventListener("pointercancel", onPointerUp);
    viewport.removeEventListener("scroll", requestUpdate);
    viewport.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", requestUpdate);
  };
}
