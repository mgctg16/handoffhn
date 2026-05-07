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
    "src/render.js",
    "src/timeline.js",
    "src/main.js",
    "src/styles.css"
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
  const [{ sectionOrder, content }, { renderPage }, { setupTimeline }] = await Promise.all([
    import("../src/content.js"),
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
