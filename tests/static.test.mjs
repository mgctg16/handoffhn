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
    "src/smoothScroll.js",
    "src/timeline.js",
    "src/main.jsx",
    "src/App.jsx",
    "src/components/ui/button.jsx",
    "src/lib/utils.js",
    "src/styles.css",
    "src/a30new.svg",
    "src/assets/back-milestone.jpg",
    "src/assets/hinologonew.png",
    "src/assets/hinobannernew.jpg",
    "src/assets/new1.png",
    "src/assets/new2.png",
    "src/assets/finalvi.webp",
    "src/assets/finalen.webp",
    "src/assets/director-yoshio-osaka-website.png",
    "src/assets/a30-nav-white-new.svg",
    "src/assets/news-eco-driving-can-tho.jpg",
    "src/assets/news-vilog-2025.jpg",
    "src/assets/milestone-1995.jpg",
    "src/assets/milestone-1996.jpg",
    "src/assets/milestone-1997.jpg",
    "src/assets/milestone-2001.jpg",
    "src/assets/milestone-2006.jpg",
    "src/assets/milestone-2007.jpg",
    "src/assets/milestone-2008.png",
    "src/assets/milestone-2010.jpg",
    "src/assets/milestone-2011.jpg",
    "src/assets/milestone-2013.jpg",
    "src/assets/milestone-2015.jpg",
    "src/assets/milestone-2016.jpg",
    "src/assets/milestone-2018.png",
    "src/assets/milestone-2021.png",
    "src/assets/milestone-2022.png",
    "src/assets/milestone-2023.jpg",
    "src/assets/milestone-2024.jpg",
    "src/assets/milestone-2025.jpg",
    "src/assets/milestone-2026-new-office.jpg"
  ].forEach((path) => {
    assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
  });
});

test("index loads app modules and uses a mobile-safe viewport", () => {
  const html = file("index.html");
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  assert.match(html, /src\/styles\.css/);
  assert.match(html, /src\/main\.jsx/);
  assert.match(html, /<main id="app"/);
});

test("project is configured as a Vite React app with shadcn registry support", () => {
  const pkg = JSON.parse(file("package.json"));
  const components = JSON.parse(file("components.json"));

  assert.match(pkg.scripts.dev, /vite/);
  assert.match(pkg.scripts.build, /vite build/);
  assert.match(pkg.scripts.serve, /vite --host/);
  assert.ok(pkg.dependencies.react);
  assert.ok(pkg.dependencies["react-dom"]);
  assert.ok(pkg.dependencies["@base-ui/react"]);
  assert.equal(components.$schema, "https://ui.shadcn.com/schema.json");
  assert.equal(components.style, "base-nova");
  assert.equal(components.aliases.ui, "@/components/ui");
  assert.equal(components.registries["@react-bits"], "https://reactbits.dev/r/{name}.json");
});

test("app modules expose the scaffold contract", async () => {
  const [{ sectionOrder, content }, { renderPage }, { setupTimeline }, { setupSmoothScroll }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js"),
    import("../src/timeline.js"),
    import("../src/smoothScroll.js")
  ]);

  assert.deepEqual(sectionOrder, [
    "hero",
    "appreciation",
    "video",
    "milestones",
    "statistics",
    "news",
    "profile",
    "contact"
  ]);
  assert.deepEqual(Object.keys(content).sort(), ["en", "vi"]);
  assert.equal(typeof renderPage, "function");
  assert.equal(typeof renderPage(), "string");
  assert.equal(typeof setupTimeline, "function");
  assert.equal(typeof setupTimeline(), "function");
  assert.equal(typeof setupSmoothScroll, "function");
  assert.equal(typeof setupSmoothScroll(), "function");
});

test("render module includes semantic sections and language controls", () => {
  const render = file("src/render.js");
  [
    "site-nav",
    "hero",
    "appreciation",
    "statistics",
    "video",
    "milestones",
    "news",
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

  ["statistics", "video", "milestones", "news", "profile"].forEach((id) => {
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

  assert.match(html, /src="src\/assets\/Asset 1redblack\.svg"/);
  assert.match(html, /src="src\/a30new\.svg"/);
  assert.match(html, /src="src\/assets\/finalvi\.webp"/);
  assert.doesNotMatch(html, /src="src\/assets\/hino-logo\.svg"/);
  assert.doesNotMatch(html, /src="src\/assets\/a30-mark\.svg"/);
  assert.doesNotMatch(html, /src="src\/assets\/hero-banner\.png"/);
  assert.match(html, /<a class="hino-logo-link" href="https:\/\/hino\.vn\/" aria-label="Hino Việt Nam">/);
  assert.match(html, /<a class="a30-mark" href="#hero" aria-label="Hino 30 years anniversary">/);
  assert.match(html, /alt="Hino"/);
  assert.match(html, /id="contact"/);
  assert.match(html, /SẢN PHẨM/);
  assert.match(html, /Series 300/);
  assert.match(html, /DỊCH VỤ VÀ PHỤ TÙNG/);
  assert.match(html, /THEO DÕI CHÚNG TÔI/);
  assert.match(html, /CÔNG TY LIÊN DOANH TNHH HINO MOTORS VIỆT NAM/);
  assert.match(html, /Tầng 15 - Tòa nhà văn phòng 16 Láng Hạ/);
  assert.match(html, /Tầng 22 - Cao ốc Saigon Trade Center/);
  assert.match(html, /\+8424 73 016 017 \| \+8424 3861 6018/);
  assert.match(html, /Quy định &amp; Điều khoản/);
  assert.doesNotMatch(html, /Lên đầu trang|Back to top|class="back-to-top"/);
});

test("rendered footer links mirror hino.vn footer destinations", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  const vi = renderPage(content.vi, "vi");
  const en = renderPage(content.en, "en");

  assert.match(vi, /<a href="https:\/\/hino\.vn\/san-pham\/\?section=section-series-300">Series 300<\/a>/);
  assert.match(vi, /<a href="https:\/\/hino\.vn\/san-pham\/\?section=section-500-series">Series 500<\/a>/);
  assert.match(vi, /<a href="https:\/\/hino\.vn\/san-pham\/\?section=section-series-700">Series 700<\/a>/);
  assert.match(vi, /<a href="https:\/\/hino\.vn\/gioi-thieu\/">Hino Motors Việt Nam<\/a>/);
  assert.match(en, /<a href="https:\/\/hino\.vn\/gioi-thieu\/">Hino Motors Vietnam<\/a>/);
  assert.match(vi, /<a href="https:\/\/hino\.vn\/chang-duong\/">Chặng đường<\/a>/);
  assert.match(en, /<a href="https:\/\/hino\.vn\/chang-duong\/">Milestones<\/a>/);
  assert.match(vi, /<a href="https:\/\/hino\.vn\/tuyen-dung\/">Tuyển dụng<\/a>/);
  assert.match(vi, /<a href="https:\/\/hino\.vn\/dich-vu\/dich-vu-sau-ban-hang-s159\.html">Dịch vụ sau bán hàng<\/a>/);
  assert.match(en, /<a href="https:\/\/hino\.vn\/dich-vu\/dich-vu-sau-ban-hang-s159\.html">After-sales service<\/a>/);
  assert.match(vi, /<a href="https:\/\/hino\.vn\/dich-vu\/chinh-sach-bao-hanh-s162\.html">Chính sách bảo hành<\/a>/);
  assert.match(vi, /<a href="https:\/\/hino\.vn\/dich-vu\/phu-tung-chinh-hang-s2315\.html">Phụ tùng chính hãng<\/a>/);
  assert.match(vi, /<a class="footer-social-item" href="https:\/\/www\.facebook\.com\/hinomotorsvietnam\.official">/);
  assert.match(vi, /<a class="footer-social-item" href="https:\/\/www\.youtube\.com\/channel\/UCZgElv0GhgPGXP8z5lCeDsg">/);
  assert.match(vi, /<a href="https:\/\/hino\.vn\/tin-tuc\/dieu-khoan-va-dieu-kien-su-dung-n7043\.html">Quy định &amp; Điều khoản<\/a>/);
  assert.match(en, /<a href="https:\/\/hino\.vn\/tin-tuc\/dieu-khoan-va-dieu-kien-su-dung-n7043\.html">Terms and Conditions<\/a>/);
  assert.match(vi, /<a href="https:\/\/hino\.vn\/chinh-sach-bao-mat\/">Chính sách bảo mật<\/a>/);
  assert.match(vi, /<a href="https:\/\/hino\.vn\/chinh-sach-nhan-quyen\/">Chính sách nhân quyền<\/a>/);
});

test("rendered statistics expose animated numeric counters", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  const html = renderPage(content.vi, "vi");

  assert.match(html, /class="stat-number stat-number--short"[\s\S]*data-count-to="371"/);
  assert.match(html, /data-count-to="1295"[\s\S]*data-count-suffix=""/);
  assert.match(html, /class="stat-number stat-number--long"[\s\S]*data-count-to="2682710"[\s\S]*data-count-suffix=""/);
  assert.match(html, /class="stat-number stat-number--wide"[\s\S]*data-count-to="831809"/);
  assert.match(html, /class="stat-unit">Nhân viên<\/p>/);
  assert.match(html, /class="stat-label">Nhân sự đại lý Hino tại Việt Nam<\/h3>/);
  assert.match(html, /class="stat-disclaimer">Tại thời điểm tháng 6\/2026<\/p>/);
  assert.match(html, /class="stat-label">Dịch vụ bảo dưỡng CPUS<\/h3>/);
  assert.match(html, /class="stats-note">\*Số liệu cập nhật đến ngày 18\/06\/2026<\/p>/);
  assert.doesNotMatch(html, /class="stat-hex"/);
  assert.doesNotMatch(html, /Hệ thống đại lý chính hãng/);
});


test("timeline supports drag scrolling without active text reflow", () => {
  const timeline = file("src/timeline.js");
  const styles = file("src/styles.css");

  assert.match(timeline, /addEventListener\("pointerdown", onPointerDown\)/);
  assert.match(timeline, /viewport\.scrollLeft = dragStartScrollLeft - \(event\.clientX - dragStartX\)/);
  assert.match(
    timeline,
    /calculateCenteredTarget\(\s*event\.offsetLeft,\s*event\.offsetWidth,\s*viewport\.clientWidth,\s*maxScroll\(\)\s*\)/s
  );
  assert.match(
    styles,
    /--timeline-center-gutter:\s*max\(0px, calc\(\(100vw - var\(--timeline-item-width\)\) \/ 2\)\)/
  );
  assert.match(styles, /\.milestone-event\s*\{[^}]*scroll-snap-align:\s*center/s);
  assert.match(timeline, /progress >= 0\.995[\s\S]*activeIndex = events\.length - 1/);
  assert.doesNotMatch(timeline, /classList\.toggle\("is-active", reached\)/);
  assert.match(styles, /\.timeline-viewport\.is-dragging/);
  assert.match(styles, /\.timeline-viewport\.is-dragging \{[\s\S]*scroll-snap-type:\s*none/);
  assert.match(timeline, /addEventListener\("keydown", onViewportKeyDown\)/);
  assert.match(timeline, /resolveTimelineKey\(/);
  assert.match(timeline, /TIMELINE_INTERACTION_RESUME_MS/);
  assert.match(timeline, /classList\.add\("has-interacted"\)/);
  assert.match(timeline, /classList\.toggle\("can-scroll-left"/);
  assert.match(timeline, /classList\.toggle\("can-scroll-right"/);
  assert.match(timeline, /goToIndex\(currentIndex\(\), \{ source: "drag" \}\)/);

  const currentYearBlock = styles.match(/\.timeline-marker\.is-current \.timeline-marker-year \{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(currentYearBlock, /color:\s*var\(--hino-red\)/);

  const currentTitleBlock = styles.match(/\.milestone-event\.is-current \.milestone-title \{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(currentTitleBlock, /color:\s*var\(--hino-red\)/);
  assert.doesNotMatch(currentTitleBlock, /font-weight/);

  const currentEventBlock = styles.match(/\.milestone-event\.is-current \{[\s\S]*?\n\}/)?.[0] || "";
  assert.doesNotMatch(currentEventBlock, /transform:/);

  const currentCardBlock = styles.match(/\.milestone-event\.is-current \.milestone-card \{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(currentCardBlock, /box-shadow:/);
  assert.match(currentCardBlock, /translateY\(0\) scale\(1\.2\)/);

  const cardBlock = styles.match(/\.milestone-card \{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(cardBlock, /margin:\s*18px auto 0/);
  assert.match(cardBlock, /transform-origin:\s*center top/);

  assert.match(
    styles,
    /@media \(max-width: 900px\) \{[\s\S]*?\.milestone-event\.is-current \.milestone-card\s*\{[^}]*transform:\s*translateY\(0\) scale\(1\.15\)/s
  );

  const railBlock = styles.match(/\.timeline-rail \{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(railBlock, /margin:\s*0 0 44px/);

  const trackBlock = styles.match(/\.timeline-track \{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(trackBlock, /padding:\s*6px 0 0/);
  assert.match(
    styles,
    /@media \(max-width: 900px\) \{[\s\S]*?\.timeline-track\s*\{[^}]*padding:\s*6px 0 0/s
  );

  const canvasBlock = styles.match(/\.timeline-canvas \{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(canvasBlock, /padding:\s*0 var\(--timeline-center-gutter\) 72px/);
});


test("footer uses Giang Vo ward in both languages", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  assert.match(renderPage(content.vi, "vi"), /Phường Giảng Võ/);
  assert.match(renderPage(content.en, "en"), /Giang Vo Ward/);
  assert.doesNotMatch(renderPage(content.vi, "vi"), /Phường Ba Đình/);
  assert.doesNotMatch(renderPage(content.en, "en"), /Ba Dinh Ward/);
});


test("rendered page omits the removed contest section", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  const html = renderPage(content.vi, "vi");

  assert.doesNotMatch(html, /id="contest"/);
  assert.doesNotMatch(html, /contest-card/);
  assert.doesNotMatch(html, /Cuộc thi ảnh A30/);
});

test("rendered output escapes text and filters unsafe urls", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);
  const data = structuredClone(content.vi);
  data.nav.logoHref = "javascript:alert(1)";
  data.sections.news.items[0].title = `<img src=x onerror="alert(1)">`;
  data.assets.videoUrl = "javascript:alert(2)";
  data.assets.companyProfileUrl = "data:text/html,<script>alert(3)</script>";

  const html = renderPage(data, "vi");

  assert.doesNotMatch(html, /javascript:/i);
  assert.doesNotMatch(html, /data:text\/html/i);
  assert.doesNotMatch(html, /<img src=x/i);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.match(html, /class="hino-logo-link" href="#"/);
  assert.doesNotMatch(html, /<iframe/);
  assert.doesNotMatch(html, /aria-disabled="true"/);
  assert.match(html, /class="asset-status"/);
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
  assert.match(html, /class="hino-logo-link" href="#"/);
  assert.doesNotMatch(html, /<iframe/);
  assert.doesNotMatch(html, /aria-disabled="true"/);
  assert.match(html, /class="asset-status"/);
});

test("rendered cards keep active CTAs when item hrefs are missing", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  const dataWithoutHref = structuredClone(content.vi);
  dataWithoutHref.sections.news.items.forEach((item) => {
    delete item.href;
  });
  const withoutHref = renderPage(dataWithoutHref, "vi");
  const staleCardCopy = ["Sắp", "cập nhật"].join(" ");
  assert.match(withoutHref, /class="text-link" href="#news">XEM THÊM<\/a>/);
  assert.doesNotMatch(withoutHref, /class="text-status"/);
  assert.doesNotMatch(withoutHref, new RegExp(staleCardCopy));

  const data = structuredClone(content.vi);
  data.sections.news.items[0].href = "/news/a30";
  const withHref = renderPage(data, "vi");
  assert.match(withHref, /class="text-link" href="\/news\/a30">XEM THÊM<\/a>/);
});

test("rendered news and milestones use real local images", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  const html = renderPage(content.vi, "vi");

  assert.match(html, /<figure class="card-media"><img class="card-image" src="src\/assets\/news-vilog-2025\.jpg" alt="Recap sự kiện kỷ niệm 30 năm Hino Motors Việt Nam" loading="lazy"><\/figure>/);
  assert.match(html, /<img class="milestone-image" src="src\/assets\/milestone-1995\.jpg" alt="1995 milestone image" loading="lazy">/);
  assert.match(html, /<img class="milestone-image" src="src\/assets\/milestone-2025\.jpg" alt="2025 milestone image" loading="lazy">/);
  assert.match(html, /<img class="milestone-image" src="src\/assets\/milestone-2026-new-office\.jpg" alt="Hanoi new office grand opening ceremony" loading="lazy">/);
});

test("rendered milestones expose unpinned horizontal timeline", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  const html = renderPage(content.vi, "vi");

  assert.match(html, /class="timeline-header"/);
  assert.doesNotMatch(html, /timeline-intro-mark/);
  assert.match(html, /class="timeline-viewport"\s+tabindex="0"/);
  assert.match(html, /class="timeline-rail"/);
  assert.match(html, /data-timeline-marker data-year="1995"/);
  assert.match(html, /class="timeline-dot"/);
  assert.match(html, /class="timeline-marker-year">2026<\/span>/);
  assert.match(html, /data-initial-year="1996"/);
  assert.doesNotMatch(html, /data-timeline-prev/);
  assert.doesNotMatch(html, /data-timeline-next/);
  assert.match(html, /class="timeline-progress"/);
});

test("rendered milestones explain gesture navigation and keep progress passive", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  const vi = renderPage(content.vi, "vi");
  const en = renderPage(content.en, "en");

  assert.match(vi, /aria-describedby="timeline-gesture-hint"/);
  assert.match(
    vi,
    /id="timeline-gesture-hint" class="timeline-gesture-hint"[\s\S]*Kéo hoặc vuốt để khám phá/
  );
  assert.match(en, /Drag or swipe to explore/);
  assert.match(vi, /class="timeline-progress"/);
  assert.doesNotMatch(vi, /timeline-progress[^>]*(button|slider|tabindex)/);
  assert.doesNotMatch(vi, /data-timeline-prev|data-timeline-next/);
});

test("rendered milestones use coded reference-style timeline structure", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);
  const css = file("src/styles.css");
  const html = renderPage(content.vi, "vi");

  assert.match(html, /class="timeline-header"/);
  assert.match(html, /class="timeline-canvas"/);
  assert.match(html, /id="milestones-title" aria-label="NHỮNG CỘT MỐC ĐÁNG NHỚ"/);
  assert.match(html, /class="timeline-heading-line heading-gradient-text">ĐÁNG NHỚ<\/span>/);
  assert.match(html, /class="timeline-rail"/);
  assert.match(html, /class="timeline-marker"/);
  assert.match(html, /class="timeline-dot"/);
  assert.doesNotMatch(html, /class="milestone-date"/);
  assert.match(html, /class="milestone-title">Mở văn phòng đại diện tại Hà Nội<\/h3>/);
  assert.match(html, /class="milestone-title milestone-list"><li>Khai trương đại lý Hino Sao Bắc \(Hà Nội\)<\/li><li>Khai trương đại lý Hino Lexim \(Hà Nội\)<\/li><li>Kỷ niệm 10 năm thành lập<\/li><\/ul>/);
  assert.match(html, /class="milestone-event milestone-year-2026"/);
  assert.match(html, /Khai trương văn phòng mới tại Hà Nội/);
  assert.doesNotMatch(html, /class="timeline-intro-panel"/);
  assert.doesNotMatch(html, /class="milestone-stem"/);
  assert.doesNotMatch(html, /class="milestone-node"/);
  assert.doesNotMatch(html, /milestone-reference\.png/);
  assert.match(css, /\.timeline-header\s*\{/);
  assert.match(css, /\.timeline-rail\s*\{/);
  assert.match(css, /\.timeline-dot\s*\{/);
  assert.match(css, /\.timeline-canvas\s*\{[^}]*display:\s*flex/s);
  assert.match(css, /\.milestone-event\s*\{[^}]*position:\s*relative/s);
  assert.match(css, /\.timeline-section\s*\{[^}]*min-height:\s*auto/s);
  assert.match(css, /\.timeline-viewport\s*\{[^}]*overflow-x:\s*auto/s);
  assert.doesNotMatch(css, /\.timeline-intro-panel\s*\{/);
  assert.doesNotMatch(css, /\.milestone-index\s*\{/);
  assert.match(css, /\.milestone-image\s*\{[^}]*object-fit:\s*cover/s);
  assert.doesNotMatch(css, /\.milestone-image-anniversary\s*\{/);
  assert.match(css, /\.milestone-event\.is-current/);
  assert.match(css, /\.timeline-marker\.is-active/);
});

test("rendered page avoids design-slop placeholders and preserves the supplied banner artwork", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  const html = renderPage(content.vi, "vi");
  const htmlEn = renderPage(content.en, "en");
  const heroBanner = html.match(/<section class="hero-banner"[\s\S]*?<\/section>/)?.[0] || "";

  assert.doesNotMatch(html, /picsum\.photos/);
  assert.match(html, /<section class="hero-banner" id="hero" aria-label="Hino 30 years anniversary banner">/);
  assert.match(html, /<img class="a30-mark-image a30-mark-default" src="src\/a30new\.svg" width="72" height="50" alt="A30">/);
  assert.match(html, /<img class="a30-mark-image a30-mark-hero" src="src\/assets\/a30-nav-white-new\.svg" width="72" height="50" alt="" aria-hidden="true">/);
  assert.match(html, /<img class="hero-image-full" src="src\/assets\/finalvi\.webp" width="2752" height="1536" alt="Hino 30 years hero banner" fetchpriority="high">/);
  assert.match(htmlEn, /<img class="hero-image-full" src="src\/assets\/finalen\.webp" width="2752" height="1536" alt="Hino 30 years hero banner" fetchpriority="high">/);
  assert.doesNotMatch(heroBanner, /<h1 id="hero-title">/);
  assert.match(heroBanner, /href="#appreciation" aria-label="Scroll to appreciation letter"/);
  assert.doesNotMatch(html, /hero-action-strip/);
  assert.doesNotMatch(html, /hero-copy/);
});

test("build asset copier includes root-level anniversary mark", () => {
  const script = file("scripts/copy-assets.mjs");
  assert.match(script, /src\/a30new\.svg/);
  assert.match(script, /dist\/src\/a30new\.svg/);
});

test("rendered navigation and language toggle are localized and grouped", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  const vi = renderPage(content.vi, "vi");
  const en = renderPage(content.en, "en");

  assert.match(vi, /<div class="language-toggle" role="group" aria-label="Switch language">/);
  assert.match(vi, /href="#appreciation">Lời tri ân<\/a>/);
  assert.match(vi, /href="#milestones">Hành trình phát triển<\/a>/);
  assert.match(vi, /href="#profile">Ấn phẩm 30 năm<\/a>/);
  assert.match(vi, /href="#news">Tin tức<\/a>/);
  assert.match(vi, /href="#contact">Liên hệ<\/a>/);
  assert.match(en, /href="#appreciation">Appreciation letter<\/a>/);
  assert.match(en, /href="#milestones">Milestones<\/a>/);
  assert.match(en, /href="#profile">Company profile<\/a>/);
  assert.match(en, /href="#news">News<\/a>/);
  assert.match(en, /href="#contact">Contact<\/a>/);
});

test("rendered appreciation letter uses director portrait and real copy", async () => {
  const [{ content }, { renderPage }] = await Promise.all([
    import("../src/content.js"),
    import("../src/render.js")
  ]);

  const vi = renderPage(content.vi, "vi");
  const en = renderPage(content.en, "en");

  assert.match(vi, /<section class="appreciation-section section-pattern" id="appreciation" aria-labelledby="appreciation-title">/);
  assert.match(vi, /<img class="director-image" src="src\/assets\/director-yoshio-osaka-website\.png" width="1920" height="1081" alt="Ông Yoshio Osaka trước xe tải Hino 500" loading="lazy">/);
  assert.match(vi, /Thân gửi Quý khách hàng và Quý Đại lý,/);
  assert.match(vi, /YOSHIO OSAKA/);
  assert.match(en, /APPRECIATION LETTER/);
  assert.match(en, /Dear our customers and dealers,/);
  assert.match(en, /Mr\. YOSHIO OSAKA/);
  assert.doesNotMatch(vi + en, /TGĐ photo placeholder|&lt;Hino cung cấp&gt;/);
});

test("css includes approved UI/UX Pro Max quality gates", () => {
  const css = file("src/styles.css");
  assert.match(css, /--hino-red:\s*#c90000/);
  assert.match(css, /Helvetica Neue/);
  assert.match(css, /\.stat-cell\s*\{[^}]*align-items:\s*center/s);
  assert.match(css, /\.stat-cell\s*\{[^}]*justify-items:\s*center/s);
  assert.match(css, /\.stats-grid\s*\{[^}]*grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /@media \(max-width:\s*1100px\) and \(min-width:\s*769px\)[\s\S]*?\.stats-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.doesNotMatch(css, /\.stat-cell \+ \.stat-cell\s*\{[^}]*border-top:\s*0/s);
  assert.match(css, /\.stat-number--short\s*\{/);
  assert.match(css, /\.stat-number--wide\s*\{/);
  assert.match(css, /\.stat-number--long\s*\{/);
  assert.match(css, /section-pattern/);
  assert.match(css, /#video\s*\{[^}]*url\("\.\/assets\/back-milestone\.jpg"\)/s);
  assert.doesNotMatch(css, /body::before\s*\{[^}]*url\("\.\/assets\/back-milestone\.jpg"\)/s);
  assert.doesNotMatch(css, /\.timeline-section\s*\{[^}]*url\("\.\/assets\/back-milestone\.jpg"\)/s);
  assert.doesNotMatch(css, /\.profile-cta\s*\{[^}]*url\("\.\/assets\/back-milestone\.jpg"\)/s);
  assert.doesNotMatch(css, /\.hino-logo\s*\{[^}]*border-radius/s);
  assert.doesNotMatch(css, /\.hino-logo\s*\{[^}]*box-shadow/s);
  assert.match(css, /\.hero-banner/);
  assert.match(css, /\.site-nav\s*\{[^}]*position:\s*fixed/s);
  assert.match(css, /\.site-nav\s*\{[^}]*background:\s*transparent/s);
  assert.match(css, /\.site-nav\.is-scrolled,\s*\.site-nav\.is-menu-open\s*\{[^}]*background:\s*rgba\(255,\s*255,\s*255,\s*0\.94\)/s);
  assert.match(css, /\.a30-mark-default\s*\{[^}]*opacity:\s*0/s);
  assert.match(css, /\.a30-mark-hero\s*\{[^}]*opacity:\s*1/s);
  assert.match(css, /\.site-nav\.is-scrolled \.a30-mark-default,\s*\.site-nav\.is-menu-open \.a30-mark-default\s*\{[^}]*opacity:\s*1/s);
  assert.match(css, /\.hero-banner\s*\{[^}]*min-height:\s*100svh/s);
  assert.doesNotMatch(css, /\.hero-banner::before/);
  assert.match(css, /\.hero-image-full\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9/s);
  assert.match(css, /\.hero-image-full\s*\{[^}]*height:\s*100%/s);
  assert.match(css, /\.hero-image-full\s*\{[^}]*object-fit:\s*cover/s);
  assert.match(css, /@media \(max-width:\s*768px\)[\s\S]*?\.hero-image-full\s*\{[^}]*object-fit:\s*contain/s);
  assert.doesNotMatch(css, /hero-image-full\s*\{[^}]*min-width/s);
  assert.doesNotMatch(css, /hero-image-full\s*\{[^}]*transform:\s*scale/s);
  assert.doesNotMatch(css, /\.hero-banner:hover/);
  assert.doesNotMatch(css, /\.hero-banner::after/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /@media \(max-width:\s*768px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(css, /animation:\s*grid-flow/);
  assert.doesNotMatch(css, /@keyframes grid-flow/);
  assert.doesNotMatch(css, /filter:\s*brightness\(0\.8\)/);
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

test("timeline uses controlled autoplay and scoped interaction listeners", () => {
  const js = file("src/timeline.js");

  assert.match(js, /createTimelineAutoplayScheduler/);
  assert.match(js, /TIMELINE_AUTOPLAY_DWELL_MS/);
  assert.match(js, /TIMELINE_INTERACTION_RESUME_MS/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /visibilitychange/);
  assert.match(js, /viewport\.addEventListener\("wheel"/);
  assert.doesNotMatch(js, /window\.setInterval|setInterval\(/);
  assert.doesNotMatch(js, /window\.addEventListener\("wheel"/);
  assert.doesNotMatch(js, /data-timeline-prev|data-timeline-next/);
});

test("smooth scrolling uses Lenis and stays synchronized with ScrollTrigger", () => {
  const smoothScroll = file("src/smoothScroll.js");
  const css = file("src/styles.css");
  assert.match(smoothScroll, /from "lenis"/);
  assert.match(css, /lenis\/dist\/lenis\.css/);
  assert.match(smoothScroll, /anchors:\s*{/);
  assert.match(smoothScroll, /window\.location\.hash/);
  assert.match(smoothScroll, /lenis\.scrollTo/);
  assert.match(smoothScroll, /ScrollTrigger\.update/);
  assert.match(smoothScroll, /gsap\.ticker\.add/);
  assert.match(smoothScroll, /lenis\.destroy\(\)/);
});

test("css omits the removed contest section styles", () => {
  const css = file("src/styles.css");
  assert.doesNotMatch(css, /\.contest-/);
  assert.doesNotMatch(css, /\.marquee-/);
});

test("rendering protects missing video and profile assets", () => {
  const render = file("src/render.js");
  assert.match(render, /Video placeholder - awaiting Hino YouTube link/);
  assert.match(render, /asset-status/);
  assert.doesNotMatch(render, /aria-disabled="true"/);
  assert.match(render, /companyProfileUrl/);
  assert.doesNotMatch(render, new RegExp(["Sắp", "cập nhật"].join(" ")));
  assert.doesNotMatch(render, new RegExp(["Hồ sơ công ty", "sẽ được cập nhật"].join(" ")));
  assert.doesNotMatch(render, /fake\.pdf/);
});
