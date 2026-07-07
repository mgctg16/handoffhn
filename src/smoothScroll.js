import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function setupSmoothScroll() {
  if (typeof window === "undefined") {
    return () => {};
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) {
    return () => {};
  }

  const lenis = new Lenis({
    anchors: {
      offset: -76
    },
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false
  });

  const updateScrollTrigger = () => ScrollTrigger.update();
  const tick = (time) => {
    lenis.raf(time * 1000);
  };

  lenis.on("scroll", updateScrollTrigger);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  window.__hinoLenis = lenis;

  const initialHashId = window.setTimeout(() => {
    if (window.location.hash) {
      ScrollTrigger.refresh();
      lenis.scrollTo(window.location.hash, {
        offset: -76,
        immediate: true,
        force: true
      });
    }
  }, 350);

  return () => {
    window.clearTimeout(initialHashId);
    gsap.ticker.remove(tick);
    lenis.off("scroll", updateScrollTrigger);
    if (window.__hinoLenis === lenis) {
      delete window.__hinoLenis;
    }
    lenis.destroy();
  };
}
