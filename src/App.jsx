import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { content } from "./content.js";
import GradientText from "./components/GradientText";
import { renderPage } from "./render.js";
import { setupTimeline } from "./timeline.js";
import { setupPageMotion } from "./motion.js";
import { setupSmoothScroll } from "./smoothScroll.js";

export function App() {
  const [activeLang, setActiveLang] = useState("vi");
  const pageRef = useRef(null);

  const html = useMemo(() => renderPage(content[activeLang], activeLang), [activeLang]);

  useEffect(() => {
    document.documentElement.lang = activeLang;
  }, [activeLang]);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) {
      return undefined;
    }

    const cleanupSmoothScroll = setupSmoothScroll();
    const cleanupTimeline = setupTimeline(root.querySelector(".timeline-section"));
    const cleanupPageMotion = setupPageMotion(root);
    const siteNav = root.querySelector(".site-nav");
    const menu = root.querySelector(".menu-toggle");
    const navLinks = root.querySelector("#nav-links");
    const navAnchors = Array.from(root.querySelectorAll("#nav-links a"));
    const languageButtons = Array.from(root.querySelectorAll("[data-lang]"));
    const gradientTargets = Array.from(root.querySelectorAll("[data-gradient-text]"));
    const gradientTextRoots = [];
    const gradientMountId = window.setTimeout(() => {
      gradientTargets.forEach((container) => {
        container.textContent = "";
        const gradientRoot = createRoot(container);
        gradientRoot.render(
          <GradientText
            colors={["#111111", "#c90000", "#5f0505", "#111111"]}
            animationSpeed={3}
            showBorder={false}
            className="hero-gradient-text"
          >
            {container.dataset.gradientText}
          </GradientText>
        );
        gradientTextRoots.push(gradientRoot);
      });
    }, 0);

    function updateNavSurface() {
      siteNav?.classList.toggle("is-scrolled", window.scrollY > 24);
    }

    function setMenuOpen(open) {
      const isMobile = window.innerWidth <= 900;
      menu?.setAttribute("aria-expanded", String(open));
      siteNav?.classList.toggle("is-menu-open", open);
      navLinks?.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-lock", open);

      if (isMobile) {
        navLinks?.setAttribute("aria-hidden", String(!open));
      } else {
        navLinks?.removeAttribute("aria-hidden");
      }
    }

    function onMenuClick() {
      const expanded = menu.getAttribute("aria-expanded") === "true";
      setMenuOpen(!expanded);
    }

    function onNavAnchorClick() {
      setMenuOpen(false);
    }

    function onDocumentClick(event) {
      if (!siteNav?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    function onResize() {
      if (window.innerWidth > 900) {
        setMenuOpen(false);
      } else if (menu?.getAttribute("aria-expanded") !== "true") {
        navLinks?.setAttribute("aria-hidden", "true");
      }
    }

    function onLanguageClick(event) {
      const nextLang = event.currentTarget.dataset.lang;
      if (nextLang === activeLang || !content[nextLang]) {
        return;
      }

      setActiveLang(nextLang);
      setMenuOpen(false);
      document.querySelector("#app")?.focus({ preventScroll: true });
    }

    onResize();
    updateNavSurface();
    menu?.addEventListener("click", onMenuClick);
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", updateNavSurface, { passive: true });
    window.addEventListener("resize", onResize);
    navAnchors.forEach((anchor) => anchor.addEventListener("click", onNavAnchorClick));
    languageButtons.forEach((button) => button.addEventListener("click", onLanguageClick));

    return () => {
      cleanupPageMotion();
      cleanupTimeline();
      cleanupSmoothScroll();
      menu?.removeEventListener("click", onMenuClick);
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", updateNavSurface);
      window.removeEventListener("resize", onResize);
      document.body.classList.remove("nav-lock");
      window.clearTimeout(gradientMountId);
      navAnchors.forEach((anchor) => anchor.removeEventListener("click", onNavAnchorClick));
      languageButtons.forEach((button) => button.removeEventListener("click", onLanguageClick));
      gradientTextRoots.forEach((gradientRoot) => {
        window.setTimeout(() => gradientRoot.unmount(), 0);
      });
    };
  }, [activeLang, html]);

  return <div ref={pageRef} className="react-page" dangerouslySetInnerHTML={{ __html: html }} />;
}
