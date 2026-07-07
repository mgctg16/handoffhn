import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function splitTextForScrub(element) {
  const text = element.textContent || "";
  const words = text.trim().split(/\s+/);

  if (words.length < 4) {
    return () => {};
  }

  element.dataset.motionText = text;
  element.innerHTML = words
    .map((word) => `<span class="motion-word">${escapeHtml(word)}</span>`)
    .join(" ");

  return () => {
    element.textContent = element.dataset.motionText || text;
    delete element.dataset.motionText;
  };
}

function revealOnEntry(targets, options = {}) {
  const elements = gsap.utils.toArray(targets);

  if (!elements.length) {
    return;
  }

  gsap.from(elements, {
    y: options.y ?? 28,
    scale: options.scale ?? 0.96,
    rotateX: options.rotateX ?? -8,
    clipPath: options.clipPath ?? "inset(0 0 18% 0 round 8px)",
    autoAlpha: 0,
    duration: options.duration ?? 0.86,
    stagger: options.stagger ?? 0.08,
    ease: "power4.out",
    transformOrigin: "50% 100%",
    scrollTrigger: {
      trigger: options.trigger || elements[0],
      start: options.start || "top 88%",
      once: true
    }
  });
}

function formatCount(value, suffix, decimals = Number.isInteger(value) ? 0 : 1, locale = "en-US") {
  const numberLocale = locale === "vi-VN" && decimals === 0 ? "vi-VN" : "en-US";
  return `${value.toLocaleString(numberLocale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}${suffix || ""}`;
}

function setupCountAnimations(root, reduceMotion) {
  const elements = Array.from(root.querySelectorAll("[data-count-to]"));
  const timers = [];
  const frames = [];

  if (!elements.length) {
    return () => {};
  }

  function animateElement(element, index) {
    if (element.dataset.countComplete === "true" || element.dataset.countRunning === "true") {
      return;
    }

    const target = Number.parseFloat(element.dataset.countTo || "0");
    const suffix = element.dataset.countSuffix || "";
    const locale = element.dataset.countLocale || "en-US";
    const decimals = Number.isInteger(target) ? 0 : 1;

    element.dataset.countRunning = "true";

    if (reduceMotion.matches) {
      element.textContent = formatCount(target, suffix, decimals, locale);
      element.dataset.countComplete = "true";
      delete element.dataset.countRunning;
      return;
    }

    const duration = 2500;
    const delay = 180 + index * 130;
    element.textContent = formatCount(0, suffix, decimals, locale);

    const timer = window.setTimeout(() => {
      const startedAt = performance.now();

      function tick(now) {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = formatCount(target * eased, suffix, decimals, locale);

        if (progress < 1) {
          frames.push(window.requestAnimationFrame(tick));
        } else {
          element.textContent = formatCount(target, suffix, decimals, locale);
          element.dataset.countComplete = "true";
          delete element.dataset.countRunning;
        }
      }

      frames.push(window.requestAnimationFrame(tick));
    }, delay);

    timers.push(timer);
  }

  if (!("IntersectionObserver" in window)) {
    elements.forEach(animateElement);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      frames.forEach((frame) => window.cancelAnimationFrame(frame));
    };
  }

  function triggerVisibleCounters() {
    elements.forEach((element, index) => {
      if (element.dataset.countComplete === "true") {
        return;
      }

      const trigger = element.closest(".stats-section") || element;
      const rect = trigger.getBoundingClientRect();
      const visible = rect.top < window.innerHeight * 0.76 && rect.bottom > window.innerHeight * 0.18;

      if (visible) {
        animateElement(element, index);
      }
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const targetElements = elements.filter((element) => {
        const trigger = element.closest(".stats-section") || element;
        return trigger === entry.target;
      });

      targetElements.forEach((element) => {
        animateElement(element, elements.indexOf(element));
      });
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: "0px 0px -24% 0px",
    threshold: 0.18
  });

  const triggers = new Set(elements.map((element) => element.closest(".stats-section") || element));
  triggers.forEach((trigger) => observer.observe(trigger));
  triggerVisibleCounters();
  const visibilityTimer = window.setTimeout(triggerVisibleCounters, 240);
  window.addEventListener("scroll", triggerVisibleCounters, { passive: true });
  window.addEventListener("resize", triggerVisibleCounters);

  return () => {
    observer.disconnect();
    window.clearTimeout(visibilityTimer);
    window.removeEventListener("scroll", triggerVisibleCounters);
    window.removeEventListener("resize", triggerVisibleCounters);
    timers.forEach((timer) => window.clearTimeout(timer));
    frames.forEach((frame) => window.cancelAnimationFrame(frame));
    elements.forEach((element) => {
      if (element.dataset.countRunning === "true" && element.dataset.countComplete !== "true") {
        delete element.dataset.countRunning;
      }
    });
  };
}

export function setupPageMotion(root) {
  if (!root || typeof window === "undefined") {
    return () => {};
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const cleanupCounters = setupCountAnimations(root, reduceMotion);

  if (reduceMotion.matches) {
    return cleanupCounters;
  }

  const splitCleanups = [];
  const ctx = gsap.context(() => {
    const loadTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    const navIntroTargets = [".brand-lockup", ".language-toggle button"];
    if (window.matchMedia("(min-width: 901px)").matches) {
      navIntroTargets.splice(1, 0, ".nav-links a");
    }

    loadTimeline
      .from(".site-nav", { y: -18, autoAlpha: 0, duration: 0.62 })
      .from(
        navIntroTargets.join(", "),
        { y: -10, autoAlpha: 0, duration: 0.48, stagger: 0.035 },
        "-=0.34"
      )
      .from(".hero-image-full", { y: 16, autoAlpha: 0.82, duration: 1.08 }, "-=0.16")
      .from(".scroll-cue", { y: 10, autoAlpha: 0, duration: 0.42 }, "-=0.36");

    root.querySelectorAll(".section-heading p").forEach((element) => {
      splitCleanups.push(splitTextForScrub(element));
      const words = element.querySelectorAll(".motion-word");

      if (!words.length) {
        return;
      }

      gsap.fromTo(
        words,
        { opacity: 0.18 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.08,
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            end: "bottom 48%",
            scrub: true
          }
        }
      );
    });

    root.querySelectorAll(".split-section, .stats-section, .content-band, .timeline-section, .card-section, .profile-cta, .site-footer")
      .forEach((section) => {
        revealOnEntry(
          section.querySelectorAll(
            ".portrait-placeholder, .split-copy > *, .section-heading > *, .video-frame, .asset-status, .timeline-pin, .news-card, .profile-cta .button, .footer-group, .footer-contact, .footer-bottom-inner > *"
          ),
          { trigger: section }
        );
      });

    gsap.utils.toArray(".card-image, .milestone-image").forEach((image) => {
      gsap.fromTo(
        image,
        { scale: 0.94, autoAlpha: 0.72 },
        {
          scale: 1,
          autoAlpha: 1,
          ease: "none",
          scrollTrigger: {
            trigger: image,
            start: "top 92%",
            end: "bottom 42%",
            scrub: true
          }
        }
      );
    });

    ScrollTrigger.refresh();
  }, root);

  return () => {
    ctx.revert();
    splitCleanups.forEach((cleanup) => cleanup());
    cleanupCounters();
  };
}
