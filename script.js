/* ═══════════════════════════════════════════════════
   QUICKBIZ v5.1 — app.js
   Single source of truth for all builder logic
   ═══════════════════════════════════════════════════ */

"use strict";

/* ────────────────────────────────────────────
   UTILITIES
──────────────────────────────────────────── */

// Safe string — always returns trimmed string, never null/undefined
const safe = (val) => (val == null ? "" : String(val)).trim();

// Normalize line endings (handles Windows \r\n and Mac \r)
const normalizeLines = (str) => safe(str).replace(/\r\n/g, "\n").replace(/\r/g, "\n");

// URL validator
const isValidUrl = (url) => {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

// Clean phone — digits only, then validate length
const cleanPhone = (phone) => safe(phone).replace(/\D/g, "");

/* ────────────────────────────────────────────
   PARSERS
──────────────────────────────────────────── */

function parseGallery(input) {
  return safe(input)
    .split(",")
    .map((u) => u.trim())
    .filter((u) => isValidUrl(u))
    .slice(0, 6);
}

function parseReviews(input) {
  return normalizeLines(input)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.includes(":"))
    .map((l) => {
      const colonIdx = l.indexOf(":");
      const name = l.slice(0, colonIdx).trim();
      const text = l.slice(colonIdx + 1).trim();
      return { name, text };
    })
    .filter((r) => r.name && r.text)
    .slice(0, 5);
}

function parseMenu(input) {
  const normalized = normalizeLines(input);
  // Split by one or more blank lines
  const blocks = normalized.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  return blocks
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return null;

      const category = lines[0];
      const items = lines.slice(1).map((line) => {
        const parts = line.split(" - ");
        const itemName = safe(parts[0]);
        const price = parts.length > 1 ? safe(parts.slice(1).join(" - ")) : "";
        if (!itemName) return null;
        return { name: itemName, price };
      }).filter(Boolean);

      return { category, items };
    })
    .filter((cat) => cat && cat.category);
}

function parseTimings(input) {
  return normalizeLines(input)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/* ────────────────────────────────────────────
   HTML GENERATORS (section builders)
──────────────────────────────────────────── */

function buildHeroSection(heroUrl, cafeName) {
  const name = safe(cafeName) || "Cafe Name";
  const hasImage = isValidUrl(safe(heroUrl));

  if (hasImage) {
    return `
    <section class="pg-hero">
      <div class="pg-hero-img-wrap">
        <img src="${escHtml(safe(heroUrl))}"
             alt="${escHtml(name)} cover"
             onerror="this.closest('.pg-hero-img-wrap').classList.add('pg-hero-fallback')"
             loading="eager" />
        <div class="pg-hero-overlay"></div>
      </div>
      <div class="pg-hero-content">
        <h1 class="pg-cafe-name">${escHtml(name)}</h1>
      </div>
    </section>`;
  } else {
    return `
    <section class="pg-hero pg-hero-no-image">
      <div class="pg-hero-fallback-icon">☕</div>
      <div class="pg-hero-content">
        <h1 class="pg-cafe-name">${escHtml(name)}</h1>
      </div>
    </section>`;
  }
}

function buildDescriptionSection(desc) {
  const d = safe(desc);
  if (!d) return "";
  return `
  <section class="pg-section pg-description">
    <p class="pg-desc-text">${escHtml(d)}</p>
  </section>`;
}

function buildCtaSection(ctaText, fallback, id) {
  const text = safe(ctaText) || fallback;
  return `
  <section class="pg-section pg-cta-section" id="${id}">
    <div class="pg-cta-card">
      <p class="pg-cta-text">${escHtml(text)}</p>
    </div>
  </section>`;
}

function buildGallerySection(images) {
  if (images.length === 0) return "";
  const imgs = images
    .map((url) => `<img src="${escHtml(url)}" alt="Gallery photo" onerror="this.remove()" loading="lazy" />`)
    .join("\n      ");
  return `
  <section class="pg-section pg-gallery">
    <h2 class="pg-section-title">Gallery</h2>
    <div class="pg-gallery-scroll">
      ${imgs}
    </div>
  </section>`;
}

function buildReviewsSection(reviews) {
  if (reviews.length === 0) return "";
  const cards = reviews
    .map((r) => `
      <div class="pg-review-card">
        <div class="pg-review-stars">★★★★★</div>
        <p class="pg-review-text">${escHtml(r.text)}</p>
        <p class="pg-review-name">— ${escHtml(r.name)}</p>
      </div>`)
    .join("");
  return `
  <section class="pg-section pg-reviews">
    <h2 class="pg-section-title">What Our Guests Say</h2>
    <div class="pg-reviews-scroll">
      ${cards}
    </div>
  </section>`;
}

function buildMenuSection(menuData) {
  // Menu ALWAYS renders — even if empty, show a placeholder
  if (!menuData || menuData.length === 0) {
    return `
  <section class="pg-section pg-menu">
    <h2 class="pg-section-title">Menu</h2>
    <p class="pg-menu-empty">Menu coming soon…</p>
  </section>`;
  }

  const categories = menuData
    .map((cat) => {
      const items = (cat.items || [])
        .map((item) => `
          <div class="pg-menu-item">
            <span class="pg-menu-item-name">${escHtml(item.name)}</span>
            ${item.price ? `<span class="pg-menu-item-price">${escHtml(item.price)}</span>` : ""}
          </div>`)
        .join("");
      return `
      <div class="pg-menu-category">
        <h3 class="pg-menu-cat-title">${escHtml(cat.category)}</h3>
        <div class="pg-menu-items">
          ${items || '<p class="pg-menu-empty">No items listed</p>'}
        </div>
      </div>`;
    })
    .join("");

  return `
  <section class="pg-section pg-menu">
    <h2 class="pg-section-title">Our Menu</h2>
    ${categories}
  </section>`;
}

function buildTimingsSection(timingLines) {
  if (!timingLines || timingLines.length === 0) return "";
  const rows = timingLines
    .map((line) => {
      const parts = line.split(":");
      if (parts.length >= 2) {
        const day = safe(parts[0]);
        const hours = safe(parts.slice(1).join(":"));
        return `<div class="pg-timing-row"><span class="pg-timing-day">${escHtml(day)}</span><span class="pg-timing-hrs">${escHtml(hours)}</span></div>`;
      }
      return `<div class="pg-timing-row"><span class="pg-timing-full">${escHtml(line)}</span></div>`;
    })
    .join("");
  return `
  <section class="pg-section pg-timings">
    <h2 class="pg-section-title">Opening Hours</h2>
    <div class="pg-timings-card">
      ${rows}
    </div>
  </section>`;
}

function buildMapSection(mapUrl) {
  const u = safe(mapUrl);
  if (!isValidUrl(u)) return "";
  return `
  <section class="pg-section pg-map">
    <h2 class="pg-section-title">Find Us</h2>
    <a href="${escHtml(u)}" target="_blank" rel="noopener noreferrer" class="pg-map-link">
      <span class="pg-map-icon">📍</span> View Location on Maps
    </a>
  </section>`;
}

function buildContactSection(phone) {
  const digits = cleanPhone(phone);
  if (digits.length < 10) return "";
  return `
  <section class="pg-section pg-contact">
    <div class="pg-contact-btns">
      <a href="tel:${escHtml(digits)}" class="pg-btn pg-btn-call">
        📞 Call Us
      </a>
      <a href="https://wa.me/${escHtml(digits)}" target="_blank" rel="noopener noreferrer" class="pg-btn pg-btn-whatsapp">
        💬 WhatsApp
      </a>
    </div>
  </section>`;
}

/* ────────────────────────────────────────────
   SECURITY: HTML ESCAPING
──────────────────────────────────────────── */
function escHtml(str) {
  return safe(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/* ────────────────────────────────────────────
   PAGE CSS (injected into iframe)
──────────────────────────────────────────── */
function getPageCss() {
  return `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&family=Lato:wght@300;400;700&family=Josefin+Sans:wght@300;400;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── THEME DEFAULTS (Warm Latte) ── */
  body {
    --pg-bg: #f5f0ea;
    --pg-bg2: #ede6db;
    --pg-card: #ffffff;
    --pg-card-border: #e0d5c5;
    --pg-text: #2c2215;
    --pg-text-muted: #7a6a55;
    --pg-heading: #1a1208;
    --pg-divider: #e0d5c5;
    --pg-accent: #b8873a;
    --pg-btn-primary: #2c2215;
    --pg-btn-primary-text: #f5f0ea;
    --pg-btn-wa: #25d366;
    --pg-btn-wa-text: #fff;
    --pg-font-heading: 'Cormorant Garamond', Georgia, serif;
    --pg-font-body: 'DM Sans', 'Lato', sans-serif;

    background-color: var(--pg-bg);
    color: var(--pg-text);
    font-family: var(--pg-font-body);
    font-size: 15px;
    line-height: 1.6;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* THEME OVERRIDES */
  body.theme-dark {
    --pg-bg: #0d0d0d; --pg-bg2: #141414; --pg-card: #1c1c1c;
    --pg-card-border: #2a2a2a; --pg-text: #e0dbd2;
    --pg-text-muted: #888880; --pg-heading: #f5f0ea; --pg-divider: #2a2a2a;
    --pg-accent: #c9a96e;
    --pg-btn-primary: #e0dbd2; --pg-btn-primary-text: #0d0d0d;
  }
  body.theme-sage {
    --pg-bg: #f2f5f0; --pg-bg2: #e8ede4; --pg-card: #ffffff;
    --pg-card-border: #d2dece; --pg-text: #1e2b1a;
    --pg-text-muted: #6a7d65; --pg-heading: #0f1a0c; --pg-divider: #d2dece;
    --pg-accent: #4a7c59;
    --pg-btn-primary: #1e2b1a; --pg-btn-primary-text: #f2f5f0;
  }
  body.theme-cream {
    --pg-bg: #fffdf7; --pg-bg2: #f9f4e8; --pg-card: #ffffff;
    --pg-card-border: #ede8d8; --pg-text: #2a2318;
    --pg-text-muted: #8a7d6a; --pg-heading: #1a1408; --pg-divider: #ede8d8;
    --pg-accent: #c07d2a;
    --pg-btn-primary: #2a2318; --pg-btn-primary-text: #fffdf7;
  }

  /* FONT OVERRIDES */
  body.font-playfair  { --pg-font-heading: 'Playfair Display', Georgia, serif; }
  body.font-josefin   { --pg-font-heading: 'Josefin Sans', sans-serif; }

  /* TEXTURE (body only, pointer-events none, z-index 0) */
  body.texture-noise::after,
  body.texture-linen::after,
  body.texture-dots::after {
    content: ''; position: fixed; inset: 0;
    pointer-events: none; z-index: 0; opacity: 0.04;
  }
  body.texture-noise::after {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 200px;
  }
  body.texture-linen::after {
    background-image:
      repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px),
      repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
  }
  body.texture-dots::after {
    background-image: radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px);
    background-size: 18px 18px;
  }

  /* ── SECTIONS ── */
  .pg-section {
    padding: 28px 20px;
    border-bottom: 1px solid var(--pg-divider);
    position: relative;
    z-index: 1;
  }
  .pg-section:last-child { border-bottom: none; }

  .pg-section-title {
    font-family: var(--pg-font-heading);
    font-size: 22px;
    font-weight: 700;
    color: var(--pg-heading);
    margin-bottom: 18px;
    letter-spacing: -0.2px;
  }

  /* ── HERO ── */
  .pg-hero {
    position: relative;
    min-height: 260px;
    background: var(--pg-bg2);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .pg-hero-img-wrap {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .pg-hero-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Hero fallback — when image fails to load */
  .pg-hero-img-wrap.pg-hero-fallback {
    background: var(--pg-bg2);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pg-hero-img-wrap.pg-hero-fallback::before {
    content: '☕';
    font-size: 48px;
    opacity: 0.3;
  }
  .pg-hero-img-wrap.pg-hero-fallback img { display: none; }

  .pg-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 60%, transparent 100%);
    z-index: 1;
  }

  .pg-hero-no-image {
    align-items: center;
    justify-content: center;
    background: var(--pg-bg2);
    flex-direction: column;
    gap: 12px;
    min-height: 200px;
  }

  .pg-hero-fallback-icon {
    font-size: 52px;
    opacity: 0.4;
  }

  .pg-hero-content {
    position: relative;
    z-index: 2;
    padding: 24px 20px 20px;
  }

  .pg-hero-no-image .pg-hero-content {
    padding: 0;
  }

  .pg-cafe-name {
    font-family: var(--pg-font-heading);
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 2px 12px rgba(0,0,0,0.4);
    letter-spacing: -0.3px;
    line-height: 1.2;
    word-wrap: break-word;
  }

  .pg-hero-no-image .pg-cafe-name {
    color: var(--pg-heading);
    text-shadow: none;
    text-align: center;
  }

  /* ── DESCRIPTION ── */
  .pg-description { background: var(--pg-bg2); }
  .pg-desc-text {
    font-size: 15px;
    color: var(--pg-text);
    line-height: 1.7;
    word-wrap: break-word;
  }

  /* ── CTA CARD ── */
  .pg-cta-section { background: var(--pg-bg); }
  .pg-cta-card {
    background: var(--pg-card);
    border: 1px solid var(--pg-card-border);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }
  .pg-cta-text {
    font-family: var(--pg-font-heading);
    font-size: 18px;
    font-weight: 600;
    color: var(--pg-heading);
    text-align: center;
    line-height: 1.4;
    word-wrap: break-word;
  }

  /* ── GALLERY ── */
  .pg-gallery-scroll {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 8px;
    scrollbar-width: none;
  }
  .pg-gallery-scroll::-webkit-scrollbar { display: none; }
  .pg-gallery-scroll img {
    height: 200px;
    width: auto;
    min-width: 70%;
    max-width: 85%;
    object-fit: cover;
    border-radius: 10px;
    scroll-snap-align: start;
    flex-shrink: 0;
    display: block;
  }

  /* ── REVIEWS ── */
  .pg-reviews-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 8px;
    scrollbar-width: none;
  }
  .pg-reviews-scroll::-webkit-scrollbar { display: none; }
  .pg-review-card {
    background: var(--pg-card);
    border: 1px solid var(--pg-card-border);
    border-radius: 12px;
    padding: 18px;
    min-width: 85%;
    max-width: 85%;
    scroll-snap-align: start;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .pg-review-stars {
    color: #f0a500;
    font-size: 14px;
    margin-bottom: 10px;
    letter-spacing: 2px;
  }
  .pg-review-text {
    font-size: 14px;
    color: var(--pg-text);
    line-height: 1.6;
    margin-bottom: 12px;
    word-wrap: break-word;
  }
  .pg-review-name {
    font-size: 13px;
    color: var(--pg-text-muted);
    font-style: italic;
  }

  /* ── MENU ── */
  .pg-menu { background: var(--pg-bg2); }
  .pg-menu-category {
    margin-bottom: 24px;
  }
  .pg-menu-category:last-child { margin-bottom: 0; }
  .pg-menu-cat-title {
    font-family: var(--pg-font-heading);
    font-size: 17px;
    font-weight: 700;
    color: var(--pg-accent);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--pg-divider);
  }
  .pg-menu-items { display: flex; flex-direction: column; gap: 1px; }
  .pg-menu-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    padding: 9px 0;
    border-bottom: 1px dotted var(--pg-divider);
  }
  .pg-menu-item:last-child { border-bottom: none; }
  .pg-menu-item-name {
    font-size: 14px;
    color: var(--pg-text);
    flex: 1;
    word-wrap: break-word;
    line-height: 1.4;
  }
  .pg-menu-item-price {
    font-size: 14px;
    font-weight: 600;
    color: var(--pg-heading);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .pg-menu-empty {
    font-size: 14px;
    color: var(--pg-text-muted);
    font-style: italic;
    padding: 8px 0;
  }

  /* ── TIMINGS ── */
  .pg-timings-card {
    background: var(--pg-card);
    border: 1px solid var(--pg-card-border);
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .pg-timing-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid var(--pg-divider);
  }
  .pg-timing-row:last-child { border-bottom: none; }
  .pg-timing-day {
    font-size: 14px;
    color: var(--pg-text-muted);
    font-weight: 500;
  }
  .pg-timing-hrs {
    font-size: 14px;
    color: var(--pg-heading);
    font-weight: 600;
  }
  .pg-timing-full {
    font-size: 14px;
    color: var(--pg-text);
    word-wrap: break-word;
  }

  /* ── MAP ── */
  .pg-map-link {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--pg-card);
    border: 1px solid var(--pg-card-border);
    border-radius: 12px;
    padding: 16px 20px;
    font-size: 15px;
    font-weight: 500;
    color: var(--pg-heading);
    text-decoration: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    transition: box-shadow 0.15s;
  }
  .pg-map-link:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
  .pg-map-icon { font-size: 20px; }

  /* ── CONTACT BUTTONS ── */
  /* NOTE: Buttons are fully isolated — themes do NOT affect these classes */
  .pg-contact { background: var(--pg-bg2); }
  .pg-contact-btns {
    display: flex;
    gap: 12px;
  }
  .pg-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 12px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.15s, transform 0.1s;
    text-align: center;
  }
  .pg-btn:active { transform: scale(0.97); }

  /* Call button — hardcoded, theme-immune */
  .pg-btn-call {
    background: #1a1208 !important;
    color: #f5f0ea !important;
    border: none !important;
  }

  /* WhatsApp button — hardcoded, theme-immune */
  .pg-btn-whatsapp {
    background: #25d366 !important;
    color: #ffffff !important;
    border: none !important;
  }

  /* ── FOOTER SPACING ── */
  .pg-footer-space { height: 32px; }
  `;
}

/* ────────────────────────────────────────────
   FULL PAGE BUILDER
──────────────────────────────────────────── */
function buildPage(data) {
  const {
    cafeName, cafeDesc, heroImage,
    ctaTop, ctaBottom,
    galleryImages, reviews, menuData,
    timingLines, mapUrl, phone,
    theme, font, texture
  } = data;

  // Build body classes (reset then add new — spec rule)
  // Start from empty string, add only valid classes
  const bodyClasses = [
    safe(theme) || "theme-warm",
    safe(font) || "font-cormorant",
    safe(texture)
  ].filter(Boolean).join(" ");

  // Build section HTML in strict spec order
  const sections = [
    buildHeroSection(heroImage, cafeName),                            // 1. Hero
    buildDescriptionSection(cafeDesc),                                 // 3. Description (conditional)
    buildCtaSection(ctaTop, "🍽 Order your favorites online", "cta-top"), // 4. CTA Top
    buildGallerySection(galleryImages),                               // 5. Gallery (conditional)
    buildReviewsSection(reviews),                                     // 6. Reviews (conditional)
    buildMenuSection(menuData),                                       // 7. Menu (always)
    buildTimingsSection(timingLines),                                 // 8. Timings (conditional)
    buildMapSection(mapUrl),                                          // 9. Map (conditional)
    buildCtaSection(ctaBottom, "🎉 Book your celebrations", "cta-bottom"), // 10. CTA Bottom
    buildContactSection(phone),                                       // 11. Contact (conditional)
    `<div class="pg-footer-space"></div>`
  ].join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(safe(cafeName) || "Cafe")}</title>
  <style>${getPageCss()}</style>
</head>
<body class="${escHtml(bodyClasses)}">
  ${sections}
</body>
</html>`;
}

/* ────────────────────────────────────────────
   COLLECT INPUTS
──────────────────────────────────────────── */
function collectData() {
  const get = (id) => safe(document.getElementById(id)?.value);

  return {
    cafeName:     get("cafeName"),
    cafeDesc:     get("cafeDesc"),
    heroImage:    get("heroImage"),
    phone:        get("phoneNumber"),
    ctaTop:       get("ctaTop"),
    ctaBottom:    get("ctaBottom"),
    galleryImages: parseGallery(get("galleryUrls")),
    reviews:       parseReviews(get("reviewsInput")),
    menuData:      parseMenu(get("menuInput")),
    timingLines:   parseTimings(get("timingsInput")),
    mapUrl:        get("mapUrl"),
    theme:         get("themeSelect"),
    font:          get("fontSelect"),
    texture:       get("textureSelect"),
  };
}

/* ────────────────────────────────────────────
   PREVIEW — LIVE UPDATE
──────────────────────────────────────────── */
let _lastHtml = "";

function updatePreview() {
  const data = collectData();
  const html = buildPage(data);
  _lastHtml = html;

  const iframe = document.getElementById("previewIframe");
  if (!iframe) return;

  // Write directly to iframe for exact match with final output
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
}

/* ────────────────────────────────────────────
   COPY FULL HTML
──────────────────────────────────────────── */
function copyOutput() {
  const html = _lastHtml || buildPage(collectData());
  const statusEl = document.getElementById("copyStatus");

  const showStatus = (msg, ok) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = ok ? "#6dbf7a" : "#e07a7a";
    setTimeout(() => { if (statusEl) statusEl.textContent = ""; }, 3000);
  };

  // Modern clipboard API with fallback
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(html)
      .then(() => showStatus("✓ Copied to clipboard!", true))
      .catch(() => fallbackCopy(html, showStatus));
  } else {
    fallbackCopy(html, showStatus);
  }
}

function fallbackCopy(text, callback) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    callback(ok ? "✓ Copied!" : "Copy failed — please copy manually.", ok);
  } catch (e) {
    callback("Copy failed — please copy manually.", false);
  }
}

/* ────────────────────────────────────────────
   PREVIEW DEVICE WIDTH
──────────────────────────────────────────── */
function setPreviewWidth(btn, width) {
  // Update active button state
  document.querySelectorAll(".dev-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  const frame = document.getElementById("previewFrame");
  if (!frame) return;
  frame.style.width = width + "px";
  // Clamp to stage width
  const stage = document.getElementById("previewStage");
  if (stage && frame.offsetWidth > stage.offsetWidth - 48) {
    frame.style.width = (stage.offsetWidth - 48) + "px";
  }
}

/* ────────────────────────────────────────────
   INIT — WIRE UP EVENT LISTENERS
──────────────────────────────────────────── */
function init() {
  const inputIds = [
    "cafeName", "cafeDesc", "heroImage", "phoneNumber",
    "ctaTop", "ctaBottom", "galleryUrls", "reviewsInput",
    "menuInput", "timingsInput", "mapUrl",
    "themeSelect", "fontSelect", "textureSelect"
  ];

  // Live update on any input change
  inputIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", updatePreview);
      el.addEventListener("change", updatePreview);
    }
  });

  // Seed with demo content
  seedDemo();

  // Initial render
  updatePreview();
}

/* ────────────────────────────────────────────
   DEMO SEED DATA
──────────────────────────────────────────── */
function seedDemo() {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  set("cafeName", "The Roasted Bean");
  set("cafeDesc", "A cozy corner for coffee lovers and pastry enthusiasts. Artisan brews, house-baked goods, and warm vibes since 2018.");
  set("heroImage", "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80");
  set("phoneNumber", "+91 98765 43210");
  set("ctaTop", "🍽 Order your favorites online");
  set("ctaBottom", "🎉 Book your celebrations with us");
  set("galleryUrls", [
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80",
    "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&q=80",
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80"
  ].join(", "));
  set("reviewsInput", [
    "Priya S: Best cappuccino I've ever had. The ambience is just perfect for a Sunday morning.",
    "Rohan M: Love the avocado toast here. Becomes a ritual every weekend!",
    "Ananya K: The staff is super friendly and the coffee is always consistent.",
    "Vikram T: Great place to work from. Fast Wi-Fi and excellent filter coffee.",
    "Sneha R: The chocolate croissant is absolutely divine. Highly recommend!"
  ].join("\n"));
  set("menuInput", [
    "Hot Drinks",
    "Espresso - ₹110",
    "Cappuccino - ₹150",
    "Filter Coffee - ₹90",
    "Masala Chai - ₹80",
    "",
    "Cold Drinks",
    "Cold Brew - ₹180",
    "Iced Latte - ₹170",
    "Lemonade - ₹120",
    "",
    "Snacks & Bites",
    "Croissant - ₹100",
    "Avocado Toast - ₹190",
    "Banana Bread - ₹130",
    "Cheese Sandwich - ₹160"
  ].join("\n"));
  set("timingsInput", "Mon–Fri: 7:30am – 9:00pm\nSat–Sun: 8:00am – 10:00pm");
  set("mapUrl", "https://maps.google.com/?q=cafe");
}

// Boot
document.addEventListener("DOMContentLoaded", init);
