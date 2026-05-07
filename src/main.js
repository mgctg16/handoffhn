import { content } from "./content.js";
import { renderPage } from "./render.js";
import { setupTimeline } from "./timeline.js";

const app = document.querySelector("#app");
let activeLang = "vi";
let cleanupTimeline = () => {};

function render() {
  document.documentElement.lang = activeLang;
  cleanupTimeline();
  app.innerHTML = renderPage(content[activeLang], activeLang);
  cleanupTimeline = setupTimeline(document.querySelector(".timeline-section"));

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextLang = button.dataset.lang;
      if (nextLang === activeLang || !content[nextLang]) {
        return;
      }

      activeLang = nextLang;
      render();
      app.focus({ preventScroll: true });
    });
  });

  const menu = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector("#nav-links");
  menu.addEventListener("click", () => {
    const expanded = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", String(!expanded));
    navLinks.classList.toggle("is-open", !expanded);
  });
}

render();
