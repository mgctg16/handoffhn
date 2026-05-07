import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;

function file(path) {
  return readFileSync(join(root, path), "utf8");
}

test("project shell files exist", () => {
  [
    "index.html",
    "src/content.js",
    "src/carousel.js",
    "src/render.js",
    "src/timeline.js",
    "src/main.js",
    "src/styles.css",
    "src/assets/hino-logo.svg"
  ].forEach((path) => {
    assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
  });
});

test("index loads app modules and uses a mobile-safe viewport", () => {
  const html = file("index.html");
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  assert.match(html, /src\/styles\.css/);
  assert.match(html, /src\/main\.js/);
  assert.match(html, /<main id="app"/);
});

test("app modules expose the scaffold contract", async () => {
  const [{ sectionOrder, content }, { setupContestCarousel }, { renderPage }, { setupTimeline }] = await Promise.all([
    import("../src/content.js"),
    import("../src/carousel.js"),
    import("../src/render.js"),
    import("../src/timeline.js")
  ]);

  assert.deepEqual(sectionOrder, [
    "hero",
    "appreciation",
    "video",
    "milestones",
    "news",
    "contest",
    "profile",
    "contact"
  ]);
  assert.deepEqual(Object.keys(content).sort(), ["en", "vi"]);
  assert.equal(typeof renderPage, "function");
  assert.equal(typeof renderPage(), "string");
  assert.equal(typeof setupContestCarousel, "function");
  assert.equal(typeof setupContestCarousel(), "function");
  assert.equal(typeof setupTimeline, "function");
  assert.equal(typeof setupTimeline(), "function");
});

test("render module includes semantic sections and language controls", () => {
  const render = file("src/render.js");
  [
    "site-nav",
    "hero",
    "appreciation",
    "video",
    "milestones",
    "news",
    "contest",
    "profile",
    "contact"
  ].forEach((id) => assert.match(render, new RegExp(`id="${id}"`)));
  assert.match(render, /data-lang="vi"/);
  assert.match(render, /data-lang="en"/);
  assert.match(render, /aria-label="Switch language"/);
});

test("rendered pages expose heading ids, language state, and menu label", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  const vi = renderPage(content.vi, "vi");
  const en = renderPage(content.en, "en");

  ["video", "milestones", "news", "contest", "profile"].forEach((id) => {
    assert.match(vi, new RegExp(`aria-labelledby="${id}-title"`));
    assert.match(vi, new RegExp(`id="${id}-title"`));
  });

  assert.match(vi, /aria-label="Toggle navigation"/);
  assert.match(vi, /data-lang="vi" aria-pressed="true"/);
  assert.match(vi, /data-lang="en" aria-pressed="false"/);
  assert.match(en, /data-lang="vi" aria-pressed="false"/);
  assert.match(en, /data-lang="en" aria-pressed="true"/);
});

test("rendered page uses requested Hino logo and copied footer", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  const html = renderPage(content.vi, "vi");

  assert.match(html, /src="src\/assets\/hino-logo\.svg"/);
  assert.match(html, /alt="Hino"/);
  assert.match(html, /id="contact"/);
  assert.match(html, /SẢN PHẨM/);
  assert.match(html, /Series 300/);
  assert.match(html, /DỊCH VỤ VÀ PHỤ TÙNG/);
  assert.match(html, /FOLLOW US/);
  assert.match(html, /CÔNG TY LD TNHH HINO MOTORS VIỆT NAM/);
  assert.match(html, /Hotline:<\/strong> <b>18009280<\/b>/);
  assert.match(html, /Quy định &amp; Điều khoản/);
  assert.match(html, /Lên đầu trang/);
});

test("rendered contest is a draggable five-card carousel with placeholders", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  const html = renderPage(content.vi, "vi");
  const contestCards = html.match(/<article class="contest-card/g) || [];
  const placeholders = html.match(/class="contest-card is-placeholder"/g) || [];

  assert.equal(contestCards.length, 5);
  assert.equal(placeholders.length, 3);
  assert.match(html, /class="contest-carousel" tabindex="0"/);
  assert.match(html, /data-carousel-prev/);
  assert.match(html, /data-carousel-next/);
  assert.match(html, /&lt;Hino cung cấp&gt;/);
});

test("rendered output escapes text and filters unsafe urls", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);
  const data = structuredClone(content.vi);
  data.nav.logoHref = "javascript:alert(1)";
  data.sections.hero.heading = `<img src=x onerror="alert(1)">`;
  data.assets.videoUrl = "javascript:alert(2)";
  data.assets.companyProfileUrl = "data:text/html,<script>alert(3)</script>";

  const html = renderPage(data, "vi");

  assert.doesNotMatch(html, /javascript:/i);
  assert.doesNotMatch(html, /data:text\/html/i);
  assert.doesNotMatch(html, /<img src=x/i);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.match(html, /class="brand-lockup" href="#"/);
  assert.doesNotMatch(html, /<iframe/);
  assert.match(html, /<span class="button primary is-disabled" aria-disabled="true">/);
});

test("rendered output rejects control-character url obfuscation", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);
  const data = structuredClone(content.vi);
  data.nav.logoHref = "java\nscript:alert(1)";
  data.assets.videoUrl = "jav\tascript:alert(2)";
  data.assets.companyProfileUrl = "java\rscript:alert(3)";

  const html = renderPage(data, "vi");

  assert.doesNotMatch(html, /java\s*script:/i);
  assert.doesNotMatch(html, /jav\s*ascript:/i);
  assert.match(html, /class="brand-lockup" href="#"/);
  assert.doesNotMatch(html, /<iframe/);
  assert.match(html, /<span class="button primary is-disabled" aria-disabled="true">/);
});

test("rendered cards use disabled ctas unless item href exists", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  const withoutHref = renderPage(content.vi, "vi");
  assert.doesNotMatch(withoutHref, /class="text-link" href="#news"/);
  assert.match(withoutHref, /<span class="text-link is-disabled" aria-disabled="true">XEM THÊM<\/span>/);

  const data = structuredClone(content.vi);
  data.sections.news.items[0].href = "/news/a30";
  const withHref = renderPage(data, "vi");
  assert.match(withHref, /class="text-link" href="\/news\/a30">XEM THÊM<\/a>/);
});

test("rendered hero actions and language toggle are localized and grouped", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  const vi = renderPage(content.vi, "vi");
  const en = renderPage(content.en, "en");

  assert.match(vi, /<div class="language-toggle" role="group" aria-label="Switch language">/);
  assert.match(vi, /href="#milestones">Hành trình 30 năm<\/a>/);
  assert.match(vi, /href="#video">Video<\/a>/);
  assert.match(en, /href="#milestones">Milestones<\/a>/);
  assert.match(en, /href="#video">Video<\/a>/);
});

test("css includes approved UI/UX Pro Max quality gates", () => {
  const css = file("src/styles.css");
  assert.match(css, /--hino-red:\s*#c90000/);
  assert.match(css, /Plus Jakarta Sans/);
  assert.match(css, /Be Vietnam Pro/);
  assert.match(css, /\.hero-banner/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /@media \(max-width:\s*768px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
});

test("css avoids responsive overflow and focus clipping regressions", () => {
  const css = file("src/styles.css");
  assert.match(css, /@media \(max-width:\s*900px\)/);
  assert.doesNotMatch(css, /letter-spacing:\s*-/);
  assert.doesNotMatch(css, /html\s*\{[^}]*overflow-x\s*:/s);
  assert.doesNotMatch(css, /body\s*\{[^}]*overflow-x\s*:/s);
  assert.doesNotMatch(css, /\.language-toggle\s*\{[^}]*overflow:\s*hidden/s);
  assert.doesNotMatch(css, /\.timeline-section\s*\{[^}]*overflow:\s*hidden/s);
  assert.doesNotMatch(
    css,
    /\.hero-content\s*\{[^}]*width:\s*min\(760px,\s*calc\(100%\s*-\s*36px\)\)[^}]*margin-left:/s
  );
});

test("timeline implements pinned horizontal behavior, drag, and hidden scrollbar", () => {
  const js = file("src/timeline.js");
  const css = file("src/styles.css");
  assert.match(js, /setupTimeline/);
  assert.match(js, /pointerdown/);
  assert.match(js, /pointermove/);
  assert.match(js, /prefers-reduced-motion:\s*reduce/);
  assert.match(js, /requestAnimationFrame/);
  assert.match(css, /scrollbar-width:\s*none/);
  assert.match(css, /::-webkit-scrollbar/);
  assert.match(css, /\.timeline-progress/);
});

test("contest carousel implements button controls, drag, and hidden scrollbar", () => {
  const js = file("src/carousel.js");
  const css = file("src/styles.css");
  assert.match(js, /setupContestCarousel/);
  assert.match(js, /pointerdown/);
  assert.match(js, /scrollBy/);
  assert.match(js, /requestAnimationFrame/);
  assert.match(css, /\.contest-carousel/);
  assert.match(css, /\.contest-track/);
  assert.match(css, /scroll-snap-type:\s*x proximity/);
  assert.match(css, /\.contest-carousel::-webkit-scrollbar/);
  assert.match(css, /scrollbar-width:\s*none/);
});

test("rendering protects missing video and profile assets", () => {
  const render = file("src/render.js");
  assert.match(render, /Video placeholder - awaiting Hino YouTube link/);
  assert.match(render, /aria-disabled="true"/);
  assert.match(render, /companyProfileUrl/);
  assert.doesNotMatch(render, /fake\.pdf/);
});
