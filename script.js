/* ═══════════════════════════════════════════════════════
   QUICKBIZ V5.5 — SCRIPT SYSTEM
   Architecture: Input → State → Generate → Output (iframe)
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ════════════════════════════════════
   1. STATE — Single source of truth
════════════════════════════════════ */
const state = {
  brand: {
    name: '',
    tagline: '',
    heroImage: '',
  },
  info: {
    timings: '',
    locationText: '',
    mapsUrl: '',
  },
  gallery: [],
  menu: [],           // [{ category, item, price }]
  reviews: [],        // [{ name, stars, text }]
  cta: {
    top: '',
    bottom: '',
  },
  buttons: {
    callNumber: '',
    waNumber: '',
    callBg: '#1a1a2e',
    callOutline: '#1a1a2e',
    callText: '#ffffff',
    waBg: '#25D366',
    waOutline: '#25D366',
    waText: '#ffffff',
  },
  colors: {
    primary: '#fdf6ee',
    secondary: '#fff9f2',
    surface: '#f5ede0',
    accent: '#c8813a',
    text: '#1c1410',
    subtext: '#6b5744',
    outline: '#e8d5c0',
  },
  typography: 'modern',
};

/* ════════════════════════════════════
   2. DOM REFERENCES
════════════════════════════════════ */
const DOM = {
  cafeName:         () => document.getElementById('cafe-name'),
  cafeTagline:      () => document.getElementById('cafe-tagline'),
  heroImage:        () => document.getElementById('hero-image'),
  timings:          () => document.getElementById('timings'),
  locationText:     () => document.getElementById('location-text'),
  mapsUrl:          () => document.getElementById('maps-url'),
  galleryImages:    () => document.getElementById('gallery-images'),
  menuItems:        () => document.getElementById('menu-items'),
  reviewsList:      () => document.getElementById('reviews-list'),
  ctaTop:           () => document.getElementById('cta-top'),
  ctaBottom:        () => document.getElementById('cta-bottom'),
  callNumber:       () => document.getElementById('call-number'),
  waNumber:         () => document.getElementById('wa-number'),

  // Color pickers (returns [colorInput, textInput])
  colorPrimary:     () => [document.getElementById('color-primary'), document.getElementById('color-primary-text')],
  colorSecondary:   () => [document.getElementById('color-secondary'), document.getElementById('color-secondary-text')],
  colorSurface:     () => [document.getElementById('color-surface'), document.getElementById('color-surface-text')],
  colorAccent:      () => [document.getElementById('color-accent'), document.getElementById('color-accent-text')],
  colorText:        () => [document.getElementById('color-text'), document.getElementById('color-text-text')],
  colorSubtext:     () => [document.getElementById('color-subtext'), document.getElementById('color-subtext-text')],
  colorOutline:     () => [document.getElementById('color-outline'), document.getElementById('color-outline-text')],

  // Button colors
  callBg:           () => [document.getElementById('call-bg'), document.getElementById('call-bg-text')],
  callOutline:      () => [document.getElementById('call-outline'), document.getElementById('call-outline-text')],
  callTextColor:    () => [document.getElementById('call-text'), document.getElementById('call-text-text')],
  waBg:             () => [document.getElementById('wa-bg'), document.getElementById('wa-bg-text')],
  waOutline:        () => [document.getElementById('wa-outline'), document.getElementById('wa-outline-text')],
  waTextColor:      () => [document.getElementById('wa-text'), document.getElementById('wa-text-text')],

  fontRadios:       () => document.querySelectorAll('input[name="font-style"]'),
  btnGenerate:      () => document.getElementById('btn-generate'),
  btnGenerateBot:   () => document.getElementById('btn-generate-bottom'),
  previewFrame:     () => document.getElementById('preview-frame'),
  previewEmpty:     () => document.getElementById('preview-empty'),
  deviceFrame:      () => document.getElementById('device-frame'),
  btnMobile:        () => document.getElementById('btn-mobile'),
  btnTablet:        () => document.getElementById('btn-tablet'),
};

/* ════════════════════════════════════
   3. STATE COLLECTION — reads inputs → state
════════════════════════════════════ */
function collectState() {
  // Brand
  state.brand.name       = DOM.cafeName().value.trim();
  state.brand.tagline    = DOM.cafeTagline().value.trim();
  state.brand.heroImage  = DOM.heroImage().value.trim();

  // Info
  state.info.timings      = DOM.timings().value.trim();
  state.info.locationText = DOM.locationText().value.trim();
  state.info.mapsUrl      = DOM.mapsUrl().value.trim();

  // Gallery
  state.gallery = DOM.galleryImages().value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Menu
  state.menu = DOM.menuItems().value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(line => {
      const parts = line.split('|').map(p => p.trim());
      return {
        category: parts[0] || '',
        item:     parts[1] || '',
        price:    parts[2] || '',
      };
    })
    .filter(m => m.category && m.item);

  // Reviews
  state.reviews = DOM.reviewsList().value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(line => {
      const parts = line.split('|').map(p => p.trim());
      return {
        name:  parts[0] || '',
        stars: parseFloat(parts[1]) || 5,
        text:  parts[2] || '',
      };
    })
    .filter(r => r.name && r.text);

  // CTA
  state.cta.top    = DOM.ctaTop().value.trim();
  state.cta.bottom = DOM.ctaBottom().value.trim();

  // Buttons
  state.buttons.callNumber  = DOM.callNumber().value.trim();
  state.buttons.waNumber    = DOM.waNumber().value.trim();
  state.buttons.callBg      = DOM.callBg()[0].value;
  state.buttons.callOutline = DOM.callOutline()[0].value;
  state.buttons.callText    = DOM.callTextColor()[0].value;
  state.buttons.waBg        = DOM.waBg()[0].value;
  state.buttons.waOutline   = DOM.waOutline()[0].value;
  state.buttons.waText      = DOM.waTextColor()[0].value;

  // Colors
  state.colors.primary   = DOM.colorPrimary()[0].value;
  state.colors.secondary = DOM.colorSecondary()[0].value;
  state.colors.surface   = DOM.colorSurface()[0].value;
  state.colors.accent    = DOM.colorAccent()[0].value;
  state.colors.text      = DOM.colorText()[0].value;
  state.colors.subtext   = DOM.colorSubtext()[0].value;
  state.colors.outline   = DOM.colorOutline()[0].value;

  // Typography
  const selectedFont = document.querySelector('input[name="font-style"]:checked');
  state.typography = selectedFont ? selectedFont.value : 'modern';
}

/* ════════════════════════════════════
   4. HELPERS
════════════════════════════════════ */

/**
 * Render star rating HTML (supports half stars)
 */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    '★'.repeat(full) +
    (half ? '½' : '') +
    '☆'.repeat(empty)
  );
}

/**
 * Get Google Fonts import URL from typography state
 */
function getFontImport(typography) {
  if (typography === 'elegant') {
    return 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap';
  }
  if (typography === 'cute') {
    return 'https://fonts.googleapis.com/css2?family=Pacifico&family=Poppins:wght@300;400;500;600;700&display=swap';
  }
  // modern
  return 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap';
}

/**
 * Get heading font stack from typography state
 */
function getHeadingFont(typography) {
  if (typography === 'elegant') return "'Playfair Display', Georgia, serif";
  if (typography === 'cute')    return "'Pacifico', cursive";
  return "'Poppins', sans-serif";
}

/**
 * Group menu items by category
 * Returns: [{ category, items: [{item, price}] }]
 */
function groupMenuByCategory(menuItems) {
  const map = new Map();
  for (const m of menuItems) {
    if (!map.has(m.category)) map.set(m.category, []);
    map.get(m.category).push({ item: m.item, price: m.price });
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
}

/**
 * Escape HTML entities
 */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ════════════════════════════════════
   5. SECTION BUILDERS
════════════════════════════════════ */

/** HERO SECTION */
function buildHero(s) {
  const heroStyle = s.brand.heroImage
    ? `background-image: linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.55) 100%), url('${esc(s.brand.heroImage)}');`
    : `background: linear-gradient(135deg, ${s.colors.surface}, ${s.colors.secondary});`;

  return `
    <section class="qb-hero" style="${heroStyle}">
      <div class="qb-hero-inner fade-in">
        <h1 class="qb-hero-name">${esc(s.brand.name || 'Your Cafe Name')}</h1>
        ${s.brand.tagline ? `<p class="qb-hero-tagline">${esc(s.brand.tagline)}</p>` : ''}
      </div>
    </section>`;
}

/** INFO SECTION */
function buildInfo(s) {
  if (!s.info.timings && !s.info.locationText) return '';

  const timingsBlock = s.info.timings ? `
    <div class="qb-info-card">
      <div class="qb-info-icon">🕐</div>
      <div class="qb-info-content">
        <div class="qb-info-label">Hours</div>
        <div class="qb-info-value">${esc(s.info.timings)}</div>
      </div>
    </div>` : '';

  const locationBlock = s.info.locationText ? `
    <div class="qb-info-card ${s.info.mapsUrl ? 'qb-info-link' : ''}"
      ${s.info.mapsUrl ? `onclick="window.open('${esc(s.info.mapsUrl)}','_blank')" role="button" tabindex="0"` : ''}>
      <div class="qb-info-icon">📍</div>
      <div class="qb-info-content">
        <div class="qb-info-label">Location</div>
        <div class="qb-info-value">${esc(s.info.locationText)}</div>
      </div>
      ${s.info.mapsUrl ? `<div class="qb-info-arrow">→</div>` : ''}
    </div>` : '';

  return `
    <section class="qb-info fade-in">
      <div class="qb-info-grid">
        ${timingsBlock}
        ${locationBlock}
      </div>
    </section>`;
}

/** GALLERY SECTION */
function buildGallery(s) {
  if (!s.gallery.length) return '';

  const imgs = s.gallery.map(url => `
    <div class="qb-gallery-item">
      <img src="${esc(url)}" alt="Cafe photo" loading="lazy" />
    </div>`).join('');

  return `
    <section class="qb-gallery-section fade-in">
      <h2 class="qb-section-title">Gallery</h2>
      <div class="qb-gallery-track">
        ${imgs}
      </div>
    </section>`;
}

/** MENU SECTION */
function buildMenu(s) {
  if (!s.menu.length) return '';

  const grouped = groupMenuByCategory(s.menu);
  const SHOW_LIMIT = 7;
  const totalItems = s.menu.length;

  let categoriesHtml = '';
  let renderedCount = 0;
  let needsExpand = totalItems > SHOW_LIMIT;

  for (const group of grouped) {
    const itemsHtml = group.items.map(it => {
      renderedCount++;
      const hiddenClass = needsExpand && renderedCount > SHOW_LIMIT ? ' qb-menu-item--hidden' : '';
      return `
      <div class="qb-menu-item${hiddenClass}">
        <span class="qb-menu-item-name">${esc(it.item)}</span>
        <span class="qb-menu-item-price">${esc(it.price)}</span>
      </div>`;
    }).join('');

    categoriesHtml += `
    <div class="qb-menu-category">
      <div class="qb-menu-cat-header">${esc(group.category)}</div>
      <div class="qb-menu-items">
        ${itemsHtml}
      </div>
    </div>`;
  }

  const toggleBtn = needsExpand ? `
    <button class="qb-menu-toggle" id="menu-toggle" onclick="toggleMenu(this)" type="button">
      Show more →
    </button>` : '';

  return `
    <section class="qb-menu-section fade-in">
      <h2 class="qb-section-title">Menu</h2>
      <div class="qb-menu-list" id="menu-list">
        ${categoriesHtml}
      </div>
      ${toggleBtn}
    </section>`;
}

/** REVIEWS SECTION */
function buildReviews(s) {
  if (!s.reviews.length) return '';

  const cards = s.reviews.map(r => `
    <div class="qb-review-card">
      <div class="qb-review-stars">${renderStars(r.stars)}</div>
      <p class="qb-review-text">${esc(r.text)}</p>
      <div class="qb-review-name">${esc(r.name)}</div>
    </div>`).join('');

  return `
    <section class="qb-reviews-section fade-in">
      <h2 class="qb-section-title">Reviews</h2>
      <div class="qb-reviews-track">
        ${cards}
      </div>
    </section>`;
}

/** CTA SECTION */
function buildCTA(s) {
  // Top CTA — only if not empty
  const topCTA = s.cta.top ? `
    <section class="qb-cta-top fade-in">
      <p class="qb-cta-top-text">${esc(s.cta.top)}</p>
    </section>` : '';

  // Bottom CTA — always present
  const bottomCTA = `
    <section class="qb-cta-bottom fade-in">
      <p class="qb-cta-bottom-text">${esc(s.cta.bottom || 'Come visit us today.')}</p>
    </section>`;

  return topCTA + bottomCTA;
}

/** BUTTONS SECTION */
function buildButtons(s) {
  const hasCall = !!s.buttons.callNumber;
  const hasWA   = !!s.buttons.waNumber;

  if (!hasCall && !hasWA) return '';

  const callBtn = hasCall ? `
    <a class="qb-btn qb-btn-call"
      href="tel:${esc(s.buttons.callNumber)}"
      style="
        background:${s.buttons.callBg};
        border-color:${s.buttons.callOutline};
        color:${s.buttons.callText};
      ">
      📞 Call Us
    </a>` : '';

  const waBtn = hasWA ? `
    <a class="qb-btn qb-btn-wa"
      href="https://wa.me/${s.buttons.waNumber.replace(/[^0-9]/g, '')}"
      target="_blank"
      style="
        background:${s.buttons.waBg};
        border-color:${s.buttons.waOutline};
        color:${s.buttons.waText};
      ">
      💬 WhatsApp
    </a>` : '';

  return `
    <section class="qb-buttons-section fade-in">
      <div class="qb-buttons-row">
        ${callBtn}
        ${waBtn}
      </div>
    </section>`;
}

/* ════════════════════════════════════
   6. CSS BUILDER — generates all page CSS from state
════════════════════════════════════ */
function buildPageCSS(s) {
  const headingFont = getHeadingFont(s.typography);

  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'Poppins', sans-serif;
      background: ${s.colors.primary};
      color: ${s.colors.text};
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* ── FADE-IN ── */
    @keyframes qb-fadein {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .fade-in {
      opacity: 0;
      animation: qb-fadein 0.55s ease forwards;
    }

    /* stagger */
    .qb-hero        { animation-delay: 0.05s; }
    .qb-info        { animation-delay: 0.1s; }
    .qb-gallery-section { animation-delay: 0.15s; }
    .qb-menu-section    { animation-delay: 0.2s; }
    .qb-reviews-section { animation-delay: 0.25s; }
    .qb-cta-top         { animation-delay: 0.3s; }
    .qb-cta-bottom      { animation-delay: 0.32s; }
    .qb-buttons-section { animation-delay: 0.35s; }

    /* ── HERO ── */
    .qb-hero {
      width: 100%;
      min-height: 280px;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: flex-end;
      padding: 0;
    }

    .qb-hero-inner {
      padding: 32px 24px 28px;
      width: 100%;
    }

    .qb-hero-name {
      font-family: ${headingFont};
      font-size: clamp(26px, 7vw, 36px);
      font-weight: 700;
      color: #ffffff;
      line-height: 1.15;
      text-shadow: 0 2px 16px rgba(0,0,0,0.4);
      letter-spacing: -0.3px;
    }

    .qb-hero-tagline {
      margin-top: 8px;
      font-size: 13px;
      font-weight: 400;
      color: rgba(255,255,255,0.85);
      line-height: 1.5;
      max-width: 320px;
      text-shadow: 0 1px 6px rgba(0,0,0,0.3);
    }

    /* ── INFO ── */
    .qb-info {
      background: ${s.colors.surface};
      padding: 20px 16px;
    }

    .qb-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .qb-info-card {
      background: ${s.colors.secondary};
      border: 1px solid ${s.colors.outline};
      border-radius: 12px;
      padding: 14px 12px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .qb-info-link {
      cursor: pointer;
    }

    .qb-info-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    }

    .qb-info-icon {
      font-size: 18px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .qb-info-content {
      flex: 1;
      min-width: 0;
    }

    .qb-info-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: ${s.colors.accent};
      margin-bottom: 3px;
    }

    .qb-info-value {
      font-size: 12px;
      font-weight: 500;
      color: ${s.colors.text};
      line-height: 1.4;
      word-break: break-word;
    }

    .qb-info-arrow {
      font-size: 14px;
      color: ${s.colors.accent};
      flex-shrink: 0;
      align-self: center;
    }

    /* ── SECTION TITLE ── */
    .qb-section-title {
      font-family: ${headingFont};
      font-size: 20px;
      font-weight: 700;
      color: ${s.colors.text};
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid ${s.colors.outline};
    }

    /* ── GALLERY ── */
    .qb-gallery-section {
      padding: 28px 0 28px 16px;
      background: ${s.colors.primary};
    }

    .qb-gallery-section .qb-section-title {
      margin-right: 16px;
    }

    .qb-gallery-track {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding-right: 16px;
      padding-bottom: 4px;
    }

    .qb-gallery-track::-webkit-scrollbar { display: none; }

    .qb-gallery-item {
      flex-shrink: 0;
      width: calc(85%);
      height: 200px;
      border-radius: 14px;
      overflow: hidden;
      scroll-snap-align: start;
      border: 1px solid ${s.colors.outline};
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }

    .qb-gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.3s ease;
    }

    .qb-gallery-item:hover img {
      transform: scale(1.03);
    }

    /* ── MENU ── */
    .qb-menu-section {
      padding: 28px 16px;
      background: ${s.colors.surface};
    }

    .qb-menu-category {
      margin-bottom: 20px;
    }

    .qb-menu-category:last-child {
      margin-bottom: 0;
    }

    .qb-menu-cat-header {
      font-family: ${headingFont};
      font-size: 14px;
      font-weight: 700;
      color: ${s.colors.accent};
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid ${s.colors.outline};
    }

    .qb-menu-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
      padding: 9px 0;
      border-bottom: 1px dashed ${s.colors.outline}80;
      transition: opacity 0.25s ease, max-height 0.35s ease;
    }

    .qb-menu-item:last-child {
      border-bottom: none;
    }

    .qb-menu-item--hidden {
      display: none;
    }

    .qb-menu-item-name {
      font-size: 13px;
      font-weight: 500;
      color: ${s.colors.text};
      line-height: 1.4;
    }

    .qb-menu-item-price {
      font-size: 13px;
      font-weight: 700;
      color: ${s.colors.accent};
      white-space: nowrap;
      flex-shrink: 0;
    }

    .qb-menu-toggle {
      display: block;
      margin: 16px auto 0;
      background: transparent;
      border: 1px solid ${s.colors.accent};
      border-radius: 8px;
      color: ${s.colors.accent};
      font-size: 12px;
      font-weight: 600;
      font-family: 'Poppins', sans-serif;
      padding: 8px 20px;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .qb-menu-toggle:hover {
      background: ${s.colors.accent};
      color: #fff;
    }

    /* ── REVIEWS ── */
    .qb-reviews-section {
      padding: 28px 0 28px 16px;
      background: ${s.colors.primary};
    }

    .qb-reviews-section .qb-section-title {
      margin-right: 16px;
    }

    .qb-reviews-track {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding-right: 16px;
      padding-bottom: 4px;
    }

    .qb-reviews-track::-webkit-scrollbar { display: none; }

    .qb-review-card {
      flex-shrink: 0;
      width: 78%;
      background: ${s.colors.secondary};
      border: 1px solid ${s.colors.outline};
      border-radius: 14px;
      padding: 18px 16px;
      scroll-snap-align: start;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .qb-review-stars {
      font-size: 15px;
      color: ${s.colors.accent};
      margin-bottom: 8px;
      letter-spacing: 1px;
    }

    .qb-review-text {
      font-size: 13px;
      color: ${s.colors.subtext};
      line-height: 1.55;
      margin-bottom: 12px;
    }

    .qb-review-name {
      font-size: 12px;
      font-weight: 700;
      color: ${s.colors.text};
    }

    /* ── CTA TOP ── */
    .qb-cta-top {
      background: ${s.colors.accent};
      padding: 20px 20px;
      text-align: center;
    }

    .qb-cta-top-text {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      line-height: 1.5;
    }

    /* ── CTA BOTTOM ── */
    .qb-cta-bottom {
      padding: 28px 20px 8px;
      text-align: center;
      background: ${s.colors.primary};
    }

    .qb-cta-bottom-text {
      font-family: ${headingFont};
      font-size: 18px;
      font-weight: 700;
      color: ${s.colors.text};
      line-height: 1.4;
    }

    /* ── BUTTONS ── */
    .qb-buttons-section {
      padding: 20px 16px 36px;
      background: ${s.colors.primary};
    }

    .qb-buttons-row {
      display: flex;
      gap: 12px;
    }

    .qb-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 15px 12px;
      border-radius: 12px;
      border-width: 2px;
      border-style: solid;
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      text-align: center;
      cursor: pointer;
      transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
      box-shadow: 0 2px 10px rgba(0,0,0,0.12);
    }

    .qb-btn:hover {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(0,0,0,0.2);
    }

    .qb-btn:active {
      transform: translateY(0);
    }

    /* ── SCROLLBAR GLOBAL ── */
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-thumb { background: ${s.colors.outline}; border-radius: 3px; }
  `;
}

/* ════════════════════════════════════
   7. PAGE JS BUILDER — inline JS for generated page
════════════════════════════════════ */
function buildPageJS() {
  return `
    // Menu expand/collapse
    function toggleMenu(btn) {
      var hidden = document.querySelectorAll('.qb-menu-item--hidden');
      var allItems = document.querySelectorAll('.qb-menu-item');
      var isExpanded = btn.dataset.expanded === '1';

      if (!isExpanded) {
        allItems.forEach(function(item) {
          item.classList.remove('qb-menu-item--hidden');
        });
        btn.textContent = 'Show less ↑';
        btn.dataset.expanded = '1';
      } else {
        var count = 0;
        allItems.forEach(function(item) {
          count++;
          if (count > 7) {
            item.classList.add('qb-menu-item--hidden');
          }
        });
        btn.textContent = 'Show more →';
        btn.dataset.expanded = '0';
        // scroll back to menu
        var menu = document.querySelector('.qb-menu-section');
        if (menu) menu.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Intersection Observer for fade-in
    (function() {
      var els = document.querySelectorAll('.fade-in');
      if (!('IntersectionObserver' in window)) {
        els.forEach(function(el) { el.style.opacity = '1'; });
        return;
      }
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      els.forEach(function(el) {
        el.style.animationPlayState = 'paused';
        obs.observe(el);
      });
    })();
  `;
}

/* ════════════════════════════════════
   8. PAGE BUILDER — assembles full HTML document
════════════════════════════════════ */
function buildPage(s) {
  const fontImport = getFontImport(s.typography);
  const css        = buildPageCSS(s);
  const js         = buildPageJS();

  // Build sections in strict order:
  // Hero → Info → Gallery → Menu → Reviews → Top CTA → Bottom CTA → Buttons
  const heroHtml    = buildHero(s);
  const infoHtml    = buildInfo(s);
  const galleryHtml = buildGallery(s);
  const menuHtml    = buildMenu(s);
  const reviewsHtml = buildReviews(s);
  const ctaHtml     = buildCTA(s);
  const btnHtml     = buildButtons(s);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(s.brand.name || 'Cafe')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fontImport}" rel="stylesheet" />
  <style>${css}</style>
</head>
<body>
  ${heroHtml}
  ${infoHtml}
  ${galleryHtml}
  ${menuHtml}
  ${reviewsHtml}
  ${ctaHtml}
  ${btnHtml}
  <script>${js}<\/script>
</body>
</html>`;
}

/* ════════════════════════════════════
   9. RENDER — injects into iframe
════════════════════════════════════ */
function renderPreview() {
  // 1. Collect all inputs into state
  collectState();

  // 2. Build full HTML from state (never read inputs again)
  const html = buildPage(state);

  // 3. Inject into iframe
  const frame = DOM.previewFrame();
  frame.srcdoc = html;

  // 4. Hide empty state
  const empty = DOM.previewEmpty();
  empty.classList.add('hidden');
}

/* ════════════════════════════════════
   10. COLOR INPUT SYNC — keeps picker ↔ text in sync
════════════════════════════════════ */
function syncColorPair(picker, textInput) {
  picker.addEventListener('input', () => {
    textInput.value = picker.value;
  });

  textInput.addEventListener('input', () => {
    const val = textInput.value.trim();
    // Accept hex colors
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
      picker.value = val;
    }
  });
}

/* ════════════════════════════════════
   11. DEVICE SWITCHER
════════════════════════════════════ */
function setupDeviceSwitcher() {
  const btnMobile = DOM.btnMobile();
  const btnTablet = DOM.btnTablet();
  const deviceFrame = DOM.deviceFrame();

  btnMobile.addEventListener('click', () => {
    deviceFrame.classList.remove('tablet-mode');
    btnMobile.classList.add('active');
    btnTablet.classList.remove('active');
  });

  btnTablet.addEventListener('click', () => {
    deviceFrame.classList.add('tablet-mode');
    btnTablet.classList.add('active');
    btnMobile.classList.remove('active');
  });
}

/* ════════════════════════════════════
   12. INIT — wire everything up
════════════════════════════════════ */
function init() {
  // ── Generate buttons
  DOM.btnGenerate().addEventListener('click', renderPreview);
  DOM.btnGenerateBot().addEventListener('click', renderPreview);

  // ── Color sync — page colors
  const colorPairs = [
    DOM.colorPrimary(),
    DOM.colorSecondary(),
    DOM.colorSurface(),
    DOM.colorAccent(),
    DOM.colorText(),
    DOM.colorSubtext(),
    DOM.colorOutline(),
    DOM.callBg(),
    DOM.callOutline(),
    DOM.callTextColor(),
    DOM.waBg(),
    DOM.waOutline(),
    DOM.waTextColor(),
  ];

  for (const [picker, textInp] of colorPairs) {
    if (picker && textInp) syncColorPair(picker, textInp);
  }

  // ── Device switcher
  setupDeviceSwitcher();

  // ── Also allow Enter on inputs to trigger generate
  const allInputs = document.querySelectorAll('input[type="text"], input[type="url"], input[type="tel"]');
  allInputs.forEach(inp => {
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') renderPreview();
    });
  });
}

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', init);
