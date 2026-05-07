function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function safeUrl(value, fallback = "#", options = {}) {
  const { allowHash = true } = options;
  const url = String(value || "").trim();

  if (!url) {
    return escapeHtml(fallback);
  }

  if (url.startsWith("#")) {
    return escapeHtml(allowHash ? url : fallback);
  }

  if (url.startsWith("/") && !url.startsWith("//")) {
    return escapeHtml(url);
  }

  if (url.startsWith("./") || url.startsWith("../") || url.startsWith("?")) {
    return escapeHtml(url);
  }

  if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(url) && !url.startsWith("//")) {
    return escapeHtml(url);
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return escapeHtml(url);
    }
  } catch {
    return escapeHtml(fallback);
  }

  return escapeHtml(fallback);
}

function hasSafeUrl(value, options = {}) {
  return safeUrl(value, "", options) !== "";
}

function mediaPlaceholder(label, className = "") {
  return `<div class="media-placeholder ${className}" role="img" aria-label="${escapeHtml(label)}">${escapeHtml(label)}</div>`;
}

function sectionHeading(section, headingId, kicker = "") {
  return `
    <div class="section-heading">
      ${kicker ? `<p class="eyebrow">${escapeHtml(kicker)}</p>` : ""}
      <h2 id="${escapeHtml(headingId)}">${escapeHtml(section.heading)}</h2>
      ${section.subtext ? `<p>${escapeHtml(section.subtext)}</p>` : ""}
    </div>
  `;
}

function renderNav(data, activeLang) {
  const links = data.nav.links
    .map(([id, label]) => `<a href="${safeUrl(`#${id}`)}">${escapeHtml(label)}</a>`)
    .join("");

  return `
    <header class="site-nav" id="site-nav">
      <a class="brand-lockup" href="${safeUrl(data.nav.logoHref)}" aria-label="${escapeHtml(data.nav.homeLabel)}">
        <span class="hino-logo">HINO</span>
        <span class="a30-mark">30</span>
      </a>
      <button class="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false" aria-controls="nav-links">
        <span></span><span></span><span></span>
      </button>
      <nav class="nav-links" id="nav-links" aria-label="Primary navigation">
        ${links}
      </nav>
      <div class="language-toggle" aria-label="Switch language">
        <button type="button" data-lang="vi" aria-pressed="${activeLang === "vi"}">VI</button>
        <button type="button" data-lang="en" aria-pressed="${activeLang === "en"}">EN</button>
      </div>
    </header>
  `;
}

function renderHero(section) {
  return `
    <section class="hero-banner" id="hero" aria-labelledby="hero-title">
      <div class="hero-scrim"></div>
      <div class="hero-content">
        <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
        <h1 id="hero-title">${escapeHtml(section.heading)}</h1>
        <p class="hero-copy">${escapeHtml(section.subtext)}</p>
        <div class="hero-actions">
          <a class="button primary" href="#milestones">Milestones</a>
          <a class="button secondary" href="#video">Video</a>
        </div>
      </div>
    </section>
  `;
}

function renderAppreciation(section) {
  return `
    <section class="split-section" id="appreciation" aria-labelledby="appreciation-title">
      ${mediaPlaceholder("TGĐ photo placeholder", "portrait-placeholder")}
      <div class="split-copy">
        <h2 id="appreciation-title">${escapeHtml(section.heading)}</h2>
        <blockquote>${escapeHtml(section.quote)}</blockquote>
        <p class="person-line">${escapeHtml(section.nameTitle)}</p>
      </div>
    </section>
  `;
}

function renderVideo(section, assets) {
  const hasVideoUrl = hasSafeUrl(assets.videoUrl, { allowHash: false });
  const videoUrl = safeUrl(assets.videoUrl, "#", { allowHash: false });
  const videoBody = hasVideoUrl
    ? `<iframe src="${videoUrl}" title="${escapeHtml(section.heading)}" allowfullscreen></iframe>`
    : mediaPlaceholder("Video placeholder - awaiting Hino YouTube link", "video-placeholder");
  const cta = hasVideoUrl
    ? `<a class="button primary" href="${videoUrl}">${escapeHtml(section.cta)}</a>`
    : `<span class="button primary is-disabled" aria-disabled="true">${escapeHtml(section.cta)}</span>`;

  return `
    <section class="content-band" id="video" aria-labelledby="video-title">
      ${sectionHeading(section, "video-title")}
      <div class="video-frame">${videoBody}</div>
      ${cta}
    </section>
  `;
}

function renderMilestones(section) {
  const items = section.items
    .map((item, index) => `
      <article class="milestone-card" tabindex="0" data-index="${index}">
        <div class="milestone-dot" aria-hidden="true"></div>
        <p class="milestone-year">${escapeHtml(item.year)}</p>
        <p class="milestone-text">${escapeHtml(item.text)}</p>
        ${mediaPlaceholder(item.imageAlt, "milestone-image")}
      </article>
    `)
    .join("");

  return `
    <section class="timeline-section" id="milestones" aria-labelledby="milestones-title">
      ${sectionHeading(section, "milestones-title")}
      <div class="timeline-pin">
        <div class="timeline-viewport" tabindex="0" aria-label="${escapeHtml(section.heading)}">
          <div class="timeline-track">${items}</div>
        </div>
        <div class="timeline-progress" aria-hidden="true"><span></span></div>
      </div>
    </section>
  `;
}

function renderCards(section, type) {
  const items = section.items
    .map((item) => `
      <article class="${type}-card">
        ${mediaPlaceholder(`${type} image placeholder`, "card-image")}
        <div class="card-copy">
          <h3>${escapeHtml(item.title || item.name)}</h3>
          <p>${escapeHtml(item.excerpt || item.quote)}</p>
          ${section.cta ? `<a class="text-link" href="#${type}">${escapeHtml(section.cta)}</a>` : ""}
        </div>
      </article>
    `)
    .join("");

  if (type === "news") {
    return `
      <section class="card-section" id="news" aria-labelledby="news-title">
        ${sectionHeading(section, "news-title")}
        <div class="card-grid">${items}</div>
      </section>
    `;
  }

  return `
    <section class="card-section" id="contest" aria-labelledby="contest-title">
      ${sectionHeading(section, "contest-title")}
      <div class="card-grid">${items}</div>
    </section>
  `;
}

function renderProfile(section, assets) {
  const hasProfileUrl = hasSafeUrl(assets.companyProfileUrl);
  const href = safeUrl(assets.companyProfileUrl);
  const cta = hasProfileUrl
    ? `<a class="button primary" href="${href}">${escapeHtml(section.cta)}</a>`
    : `<span class="button primary is-disabled" aria-disabled="true">${escapeHtml(section.cta)}</span>`;

  return `
    <section class="profile-cta" id="profile" aria-labelledby="profile-title">
      ${sectionHeading(section, "profile-title")}
      ${cta}
    </section>
  `;
}

function renderContact(section) {
  return `
    <section class="contact-section" id="contact" aria-labelledby="contact-title">
      <h2 id="contact-title">${escapeHtml(section.heading)}</h2>
      <address>
        <strong>${escapeHtml(section.company)}</strong>
        <span>${escapeHtml(section.address)}</span>
        <span>${escapeHtml(section.tax)}</span>
        <span>${escapeHtml(section.hotline)}</span>
      </address>
    </section>
  `;
}

export function renderPage(data, activeLang) {
  if (!data) {
    return "";
  }

  const sections = data.sections;
  return `
    ${renderNav(data, activeLang)}
    ${renderHero(sections.hero)}
    ${renderAppreciation(sections.appreciation)}
    ${renderVideo(sections.video, data.assets)}
    ${renderMilestones(sections.milestones)}
    ${renderCards(sections.news, "news")}
    ${renderCards(sections.contest, "contest")}
    ${renderProfile(sections.profile, data.assets)}
    ${renderContact(sections.contact)}
    <footer class="site-footer">
      <p>© Hino Motors Vietnam</p>
      <a href="https://hino.vn/">hino.vn</a>
    </footer>
  `;
}
