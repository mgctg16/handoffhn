function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const safeUrlBase = "https://hino.local/";
const unavailableLabels = {
  vi: {
    video: "Video sẽ được cập nhật"
  },
  en: {
    video: "Video coming soon"
  }
};
const milestoneControlLabels = {
  vi: {
    headingLines: ["NHỮNG CỘT MỐC", "ĐÁNG NHỚ"],
    gradientLine: 1,
    previous: "Cột mốc trước",
    next: "Cột mốc tiếp theo",
    skip: "Đến phần tiếp theo"
  },
  en: {
    headingLines: ["MEMORABLE", "MILESTONES"],
    gradientLine: 1,
    previous: "Previous milestone",
    next: "Next milestone",
    skip: "Continue"
  }
};
const footerLabels = {
  vi: {
    products: "SẢN PHẨM",
    about: "VỀ CHÚNG TÔI",
    services: "DỊCH VỤ VÀ PHỤ TÙNG",
    follow: "THEO DÕI CHÚNG TÔI",
    productItems: ["Series 300", "Series 500", "Series 700"],
    aboutItems: ["Hino Motors Việt Nam", "Chặng đường", "Tuyển dụng"],
    serviceItems: ["Dịch vụ sau bán hàng", "Chính sách bảo hành", "Phụ tùng chính hãng"],
    policyItems: ["Quy định & Điều khoản", "Chính sách bảo mật", "Chính sách nhân quyền"],
    copyright: "© 2017 Xe tải Hino. Bản quyền đã được bảo hộ.",
    policyAria: "Liên kết chính sách chân trang"
  },
  en: {
    products: "PRODUCTS",
    about: "ABOUT US",
    services: "SERVICE AND PARTS",
    follow: "FOLLOW US",
    productItems: ["Series 300", "Series 500", "Series 700"],
    aboutItems: ["Hino Motors Vietnam", "Milestones", "Careers"],
    serviceItems: ["After-sales service", "Warranty policy", "Genuine parts"],
    policyItems: ["Terms and Conditions", "Privacy Policy", "Human Rights Policy"],
    copyright: "© 2017 Hino Trucks. All rights reserved.",
    policyAria: "Footer policy links"
  }
};
const footerLinks = {
  products: [
    "https://hino.vn/san-pham/?section=section-series-300",
    "https://hino.vn/san-pham/?section=section-500-series",
    "https://hino.vn/san-pham/?section=section-series-700"
  ],
  about: [
    "https://hino.vn/gioi-thieu/",
    "https://hino.vn/chang-duong/",
    "https://hino.vn/tuyen-dung/"
  ],
  services: [
    "https://hino.vn/dich-vu/dich-vu-sau-ban-hang-s159.html",
    "https://hino.vn/dich-vu/chinh-sach-bao-hanh-s162.html",
    "https://hino.vn/dich-vu/phu-tung-chinh-hang-s2315.html"
  ],
  social: {
    facebook: "https://www.facebook.com/hinomotorsvietnam.official",
    youtube: "https://www.youtube.com/channel/UCZgElv0GhgPGXP8z5lCeDsg"
  },
  policies: [
    "https://hino.vn/tin-tuc/dieu-khoan-va-dieu-kien-su-dung-n7043.html",
    "https://hino.vn/chinh-sach-bao-mat/",
    "https://hino.vn/chinh-sach-nhan-quyen/"
  ]
};

function safeUrl(value, fallback = "#", options = {}) {
  const { allowHash = true } = options;
  const rawUrl = String(value || "");
  const url = rawUrl.trim();

  if (!url || /[\u0000-\u001F\u007F]/.test(rawUrl)) {
    return escapeHtml(fallback);
  }

  if (url.startsWith("#")) {
    return escapeHtml(allowHash ? url : fallback);
  }

  try {
    const parsed = new URL(url, safeUrlBase);
    const base = new URL(safeUrlBase);
    const hasExplicitScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(url);

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      if (!hasExplicitScheme && parsed.origin !== base.origin) {
        return escapeHtml(fallback);
      }

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
  return `
    <div class="media-placeholder ${className}" role="img" aria-label="${escapeHtml(label)}">
      <span>${escapeHtml(label)}</span>
    </div>
  `;
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

function renderPhraseGradientHeading(section, headingId, activeLang, phrase) {
  const heading = String(section.heading || "");
  const phrases = Array.isArray(phrase) ? phrase : [phrase];
  const gradientPhrase = phrases.find((candidate) => candidate && heading.includes(candidate));
  const shouldGradientPhrase = Boolean(gradientPhrase);

  if (!shouldGradientPhrase) {
    return sectionHeading(section, headingId);
  }

  const [before, after] = heading.split(gradientPhrase);
  const beforeText = before.trim();
  const afterText = after.trim();
  const beforeSuffix = beforeText ? " " : "";
  const afterPrefix = afterText && !/^[,.;:!?]/.test(afterText) ? " " : "";
  const headingHtml = `${beforeText ? `<span>${escapeHtml(beforeText)}</span>${beforeSuffix}` : ""}<span class="heading-gradient-text">${escapeHtml(gradientPhrase)}</span>${afterText ? `${afterPrefix}<span>${escapeHtml(afterText)}</span>` : ""}`;

  return `
    <div class="section-heading">
      <h2 id="${escapeHtml(headingId)}" aria-label="${escapeHtml(heading)}">${headingHtml}</h2>
      ${section.subtext ? `<p>${escapeHtml(section.subtext)}</p>` : ""}
    </div>
  `;
}

function renderCutReveal(text, className = "") {
  const words = String(text || "").split(" ");
  const visibleText = words
    .map((word, index) => {
      const space = index < words.length - 1 ? `<span class="cut-reveal-space"> </span>` : "";
      return `<span class="cut-reveal-word" style="--reveal-index: ${index}"><span>${escapeHtml(word)}</span></span>${space}`;
    })
    .join("");

  return `<span class="cut-reveal ${className}" aria-label="${escapeHtml(text)}">${visibleText}</span>`;
}

function renderBlockCutReveal(text, className = "") {
  return `<span class="block-cut-reveal ${className}">${escapeHtml(text)}</span>`;
}

function renderHeroTitle(heading) {
  const text = String(heading || "");
  const match = text.match(/^(30\s+(?:NĂM|YEARS))\s+(.+)$/);

  if (!match) {
    if (text === "GIÁ TRỊ VƯỢT THỜI GIAN") {
      return `
        <h1 id="hero-title" class="hero-title">
          <span class="hero-title-line">${renderCutReveal("GIÁ TRỊ", "hero-title-reveal")}</span>
          <span class="hero-title-line"><span class="hero-gradient-text-host" data-gradient-text="VƯỢT THỜI GIAN" aria-label="VƯỢT THỜI GIAN">VƯỢT THỜI GIAN</span></span>
        </h1>
      `;
    }

    return `<h1 id="hero-title" class="hero-title">${renderCutReveal(text, "hero-title-reveal")}</h1>`;
  }

  return `
        <h1 id="hero-title" class="hero-title">
          <span class="hero-title-count">${renderCutReveal(match[1], "hero-title-count-reveal")}</span>
          <span class="hero-title-main">${renderCutReveal(match[2], "hero-title-reveal")}</span>
        </h1>
  `;
}

function renderNav(data, activeLang) {
  const links = data.nav.links
    .map(([id, label]) => `<a href="${safeUrl(`#${id}`)}">${escapeHtml(label)}</a>`)
    .join("");

  return `
    <header class="site-nav" id="site-nav">
      <div class="brand-lockup" aria-label="${escapeHtml(data.nav.homeLabel)}">
        <a class="hino-logo-link" href="${safeUrl(data.nav.logoHref)}" aria-label="Hino Việt Nam">
          <span class="hino-logo">
            <img class="hino-logo-image hino-logo-default" src="src/assets/Asset 1redblack.svg" width="52" height="52" alt="Hino">
            <img class="hino-logo-image hino-logo-hero" src="src/assets/Asset 3white.svg" width="52" height="52" alt="" aria-hidden="true">
          </span>
        </a>
        <span class="logo-divider"></span>
        <a class="a30-mark" href="#hero" aria-label="Hino 30 years anniversary">
          <img class="a30-mark-image a30-mark-default" src="src/a30new.svg" width="72" height="50" alt="A30">
          <img class="a30-mark-image a30-mark-hero" src="src/assets/a30-nav-white-new.svg" width="72" height="50" alt="" aria-hidden="true">
        </a>
      </div>
      <button class="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false" aria-controls="nav-links">
        <span></span><span></span><span></span>
      </button>
      <nav class="nav-links" id="nav-links" aria-label="Primary navigation">
        ${links}
      </nav>
      <div class="language-toggle" role="group" aria-label="Switch language">
        <button type="button" data-lang="vi" aria-pressed="${activeLang === "vi"}">VI</button>
        <button type="button" data-lang="en" aria-pressed="${activeLang === "en"}">EN</button>
      </div>
    </header>
  `;
}

function renderHero(section, activeLang, assets) {
  const hasHeroBannerUrl = hasSafeUrl(assets.heroBannerUrl, { allowHash: false });
  const heroBannerUrl = safeUrl(assets.heroBannerUrl, "", { allowHash: false });

  return `
    <section class="hero-banner" id="hero" aria-label="Hino 30 years anniversary banner">
      ${hasHeroBannerUrl ? `<img class="hero-image-full" src="${heroBannerUrl}" width="2752" height="1536" alt="Hino 30 years hero banner" fetchpriority="high">` : ""}
      <a class="scroll-cue" href="#appreciation" aria-label="Scroll to appreciation letter">
        <span></span>
      </a>
    </section>
  `;
}

function renderAppreciation(section, activeLang) {
  const headingParts = section.heading.split(" & ");
  const headingText = headingParts.length === 2
    ? `${escapeHtml(headingParts[0])} &amp;<br>${escapeHtml(headingParts[1])}`
    : escapeHtml(section.heading);
  const headingHtml = `<span class="heading-gradient-text">${headingText}</span>`;
  const bodyParagraphs = Array.isArray(section.body) ? section.body : [section.quote || ""];
  const bodyHtml = bodyParagraphs
    .filter((paragraph) => String(paragraph || "").trim())
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
  const signatureLines = [
    section.signatureName || "",
    section.signatureTitle || section.nameTitle || "",
    section.signatureCompany || ""
  ].filter((line) => String(line || "").trim());
  const signatureHtml = signatureLines
    .map((line, index) => `<span class="${index === 0 ? "signature-name" : "signature-meta"}">${escapeHtml(line)}</span>`)
    .join("");
  const imageUrl = safeUrl(section.imageUrl, "", { allowHash: false });
  const portrait = imageUrl
    ? `<img class="director-image" src="${imageUrl}" width="1920" height="1081" alt="${escapeHtml(section.imageAlt || section.signatureName || "Director portrait")}" loading="lazy">`
    : mediaPlaceholder("Director photo", "portrait-placeholder");

  return `
    <section class="appreciation-section section-pattern" id="appreciation" aria-labelledby="appreciation-title">
      <div class="appreciation-portrait-panel">
        <figure class="director-portrait">
          <div class="director-image-frame">
            ${portrait}
          </div>
        </figure>
      </div>
      <div class="appreciation-letter">
        <h2 id="appreciation-title">${headingHtml}</h2>
        <div class="letter-body">
          ${section.salutation ? `<p class="letter-salutation">${escapeHtml(section.salutation)}</p>` : ""}
          ${bodyHtml}
        </div>
        <p class="person-line">${signatureHtml}</p>
      </div>
    </section>
  `;
}

function renderStatistics(section, activeLang = "vi") {
  const countLocale = activeLang === "vi" ? "vi-VN" : "en-US";
  const items = section.items
    .map((item, i) => {
      const digitCount = String(item.value).replace(/\D/g, "").length;
      const numberSizeClass =
        digitCount >= 7 ? " stat-number--long" : digitCount >= 6 ? " stat-number--wide" : digitCount <= 3 ? " stat-number--short" : "";
      return `
      <article class="stat-cell" style="--stat-i:${i}" role="listitem">
        <div class="stat-info">
          <h3 class="stat-label">${escapeHtml(item.label)}</h3>
          ${item.disclaimer ? `<p class="stat-disclaimer">${escapeHtml(item.disclaimer)}</p>` : ""}
        </div>
        <div class="stat-figure">
          <span
            class="stat-number${numberSizeClass}"
            data-count-to="${escapeHtml(item.value)}"
            data-count-suffix="${escapeHtml(item.suffix || "")}"
            data-count-locale="${escapeHtml(countLocale)}"
          >0${escapeHtml(item.suffix || "")}</span>
          <p class="stat-unit">${escapeHtml(item.unit || "")}</p>
        </div>
      </article>
    `;
    })
    .join("");

  return `
    <section class="stats-section section-pattern" id="statistics" aria-labelledby="statistics-title">
      <div class="stats-section-bg" aria-hidden="true">
        <span class="stats-glow stats-glow--a"></span>
        <span class="stats-glow stats-glow--b"></span>
      </div>
      <div class="stats-shell">
        <div class="stats-intro">
          ${renderPhraseGradientHeading(section, "statistics-title", activeLang, activeLang === "vi" ? "CON SỐ ẤN TƯỢNG" : "STATISTICS")}
        </div>
        <div class="stats-grid" role="list">${items}</div>
        ${section.note ? `<p class="stats-note">${escapeHtml(section.note)}</p>` : ""}
      </div>
    </section>
  `;
}

function renderVideo(section, assets, activeLang) {
  const labels = unavailableLabels[activeLang] || unavailableLabels.vi;
  const hasVideoUrl = hasSafeUrl(assets.videoUrl, { allowHash: false });
  const videoUrl = safeUrl(assets.videoUrl, "#", { allowHash: false });
  const videoBody = hasVideoUrl
    ? `<iframe src="${videoUrl}" title="${escapeHtml(section.heading)}" allowfullscreen></iframe>`
    : mediaPlaceholder("Video placeholder - awaiting Hino YouTube link", "video-placeholder");
  const cta = hasVideoUrl
    ? `<a class="button primary" href="${videoUrl}">${escapeHtml(section.cta)}</a>`
    : `<p class="asset-status">${escapeHtml(labels.video)}</p>`;

  return `
    <section class="content-band section-pattern" id="video" aria-labelledby="video-title">
      ${renderPhraseGradientHeading(section, "video-title", activeLang, activeLang === "vi" ? "30 NĂM" : "30 YEARS")}
      <div class="video-frame">${videoBody}</div>
      ${cta}
    </section>
  `;
}

function renderMilestones(section, activeLang) {
  const labels = milestoneControlLabels[activeLang] || milestoneControlLabels.vi;
  const headingLines = labels.headingLines
    .map((line, index) => {
      const className = index === labels.gradientLine
        ? "timeline-heading-line heading-gradient-text"
        : "timeline-heading-line";
      return `<span class="${className}">${escapeHtml(line)}</span>`;
    })
    .join("");
  const header = `
    <div class="timeline-header">
      <h2 id="milestones-title" aria-label="${escapeHtml(section.heading)}">${headingLines}</h2>
      <p class="timeline-intro-small">${escapeHtml(section.subtext || "")}</p>
    </div>
  `;
  const markers = section.items
    .map((item) => `
      <button class="timeline-marker" type="button" data-timeline-marker data-year="${escapeHtml(item.year)}" aria-label="${escapeHtml(item.year)}">
        <span class="timeline-dot" aria-hidden="true"></span>
        <span class="timeline-marker-year">${escapeHtml(item.year)}</span>
      </button>
    `)
    .join("");
  const items = section.items
    .map((item) => {
      const hasImage = hasSafeUrl(item.imageUrl, { allowHash: false });
      const eventClass = `milestone-event milestone-year-${escapeHtml(item.year)}`;
      const eventParts = String(item.text || "")
        .split("/")
        .map((part) => part.trim())
        .filter(Boolean);
      const titleHtml = eventParts.length > 1
        ? `<ul class="milestone-title milestone-list">${eventParts.map((part) => `<li>${escapeHtml(part)}</li>`).join("")}</ul>`
        : `<h3 class="milestone-title">${escapeHtml(eventParts[0] || item.text)}</h3>`;
      const image = hasImage
        ? `<img class="milestone-image" src="${safeUrl(item.imageUrl, "", { allowHash: false })}" alt="${escapeHtml(item.imageAlt || `${item.year} milestone image`)}" loading="lazy">`
        : `<div class="milestone-image milestone-image-placeholder" role="img" aria-label="${escapeHtml(item.imageAlt || `${item.year} milestone image`)}"></div>`;

      return `
      <article class="${eventClass}" data-year="${escapeHtml(item.year)}">
        <div class="milestone-copy">
          ${titleHtml}
        </div>
        <figure class="milestone-card">
          ${image}
        </figure>
      </article>
    `;
    })
    .join("");

  return `
    <section class="timeline-section section-pattern" id="milestones" aria-labelledby="milestones-title" data-initial-year="1996">
      ${header}
      <div class="timeline-pin">
        <div class="timeline-viewport" tabindex="0" aria-label="${escapeHtml(section.heading)}">
          <div class="timeline-track">
            <div class="timeline-rail" aria-hidden="true">${markers}</div>
            <div class="timeline-canvas">
              ${items}
            </div>
          </div>
        </div>
        <div class="timeline-progress">
          <div class="timeline-progress-fill" data-timeline-progress role="progressbar" aria-label="Timeline scroll progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
        </div>
      </div>
    </section>
  `;
}

function renderCards(section, type) {
  const items = section.items
    .map((item) => {
      const hasHref = hasSafeUrl(item.href);
      const href = hasHref ? safeUrl(item.href) : `#${escapeHtml(type)}`;
      const hasImage = hasSafeUrl(item.imageUrl, { allowHash: false });
      const image = hasImage
        ? `<img class="card-image" src="${safeUrl(item.imageUrl, "", { allowHash: false })}" alt="${escapeHtml(item.imageAlt || `${type} image`)}" loading="lazy">`
        : mediaPlaceholder(`${type} image placeholder`, "card-image");
      const cta = section.cta
        ? `<a class="text-link" href="${href}">${escapeHtml(section.cta)}</a>`
        : "";

      return `
        <article class="${type}-card">
          <figure class="card-media">${image}</figure>
          <div class="card-copy">
            <h3>${escapeHtml(item.title || item.name)}</h3>
            <p>${escapeHtml(item.excerpt || item.quote)}</p>
            ${cta}
          </div>
        </article>
      `;
    })
    .join("");

  if (type === "news") {
    return `
      <section class="card-section section-pattern" id="news" aria-labelledby="news-title">
        ${sectionHeading(section, "news-title")}
        <div class="news-carousel">
          <button class="timeline-arrow timeline-arrow-prev news-arrow" type="button" aria-label="Bài viết trước"><span class="sr-only">Bài viết trước</span></button>
          <div class="card-grid">${items}</div>
          <button class="timeline-arrow timeline-arrow-next news-arrow" type="button" aria-label="Bài viết tiếp theo"><span class="sr-only">Bài viết tiếp theo</span></button>
        </div>
      </section>
    `;
  }

}

function renderProfile(section, assets) {
  const hasProfileUrl = hasSafeUrl(assets.companyProfileUrl);
  const href = hasProfileUrl ? safeUrl(assets.companyProfileUrl) : "#profile";
  const downloadAttr = hasProfileUrl ? ` download` : "";
  const cta = `<a class="button primary" href="${href}"${downloadAttr}>${escapeHtml(section.cta)}</a>`;

  return `
    <section class="profile-cta section-pattern" id="profile" aria-labelledby="profile-title">
      ${sectionHeading(section, "profile-title")}
      ${cta}
    </section>
  `;
}

function renderFooterLinks(items, hrefs) {
  return items
    .map((item, index) => `<li><a href="${safeUrl(hrefs[index])}">${escapeHtml(item)}</a></li>`)
    .join("");
}

function renderFooter(contact, activeLang = "vi") {
  const labels = footerLabels[activeLang] || footerLabels.vi;
  const offices = (contact.offices || [])
    .map((office) => `
      <div class="footer-office">
        <strong>${escapeHtml(office.label)}:</strong>
        <ul>
          <li><b>Địa chỉ:</b> ${escapeHtml(office.address)}</li>
          <li><b>Hotline:</b> ${escapeHtml(office.phoneFax)}</li>
        </ul>
      </div>
    `)
    .join("");

  return `
    <footer class="site-footer" id="contact" aria-labelledby="footer-contact-title">
      <div class="footer-main">
        <section class="footer-group" aria-labelledby="footer-products-title">
          <h2 id="footer-products-title">${escapeHtml(labels.products)}</h2>
          <ul class="footer-list">
            ${renderFooterLinks(labels.productItems, footerLinks.products)}
          </ul>
        </section>
        <section class="footer-group" aria-labelledby="footer-about-title">
          <h2 id="footer-about-title">${escapeHtml(labels.about)}</h2>
          <ul class="footer-list">
            ${renderFooterLinks(labels.aboutItems, footerLinks.about)}
          </ul>
        </section>
        <section class="footer-group" aria-labelledby="footer-service-title">
          <h2 id="footer-service-title">${escapeHtml(labels.services)}</h2>
          <ul class="footer-list">
            ${renderFooterLinks(labels.serviceItems, footerLinks.services)}
          </ul>
        </section>
        <section class="footer-group footer-follow" aria-labelledby="footer-follow-title">
          <h2 id="footer-follow-title">${escapeHtml(labels.follow)}</h2>
          <div class="footer-social-list">
            <a class="footer-social-item" href="${safeUrl(footerLinks.social.facebook)}"><span class="social-icon social-facebook" aria-hidden="true">f</span>Facebook</a>
            <a class="footer-social-item" href="${safeUrl(footerLinks.social.youtube)}"><span class="social-icon social-youtube" aria-hidden="true"></span>Youtube</a>
          </div>
        </section>
        <section class="footer-contact" aria-labelledby="footer-contact-title">
          <h2 id="footer-contact-title">${escapeHtml(contact.heading)}</h2>
          <address>
            <strong>${escapeHtml(contact.company)}</strong>
            ${offices}
          </address>
        </section>
      </div>
      <div class="footer-bottom">
        <div class="footer-bottom-inner">
          <nav class="footer-policy" aria-label="${escapeHtml(labels.policyAria)}">
            ${labels.policyItems.map((item, index) => `<a href="${safeUrl(footerLinks.policies[index])}">${escapeHtml(item)}</a>`).join("")}
          </nav>
          <p>${escapeHtml(labels.copyright)}</p>
        </div>
      </div>
    </footer>
  `;
}

export function renderPage(data, activeLang) {
  if (!data) {
    return "";
  }

  const sections = data.sections;
  return `
    ${renderNav(data, activeLang)}
    ${renderHero(sections.hero, activeLang, data.assets)}
    ${renderAppreciation(sections.appreciation, activeLang)}
    ${renderVideo(sections.video, data.assets, activeLang)}
    ${renderMilestones(sections.milestones, activeLang)}
    ${renderStatistics(sections.statistics, activeLang)}
    ${renderCards(sections.news, "news")}
    ${renderProfile(sections.profile, data.assets)}
    ${renderFooter(sections.contact, activeLang)}
  `;
}
