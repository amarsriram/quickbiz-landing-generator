/* ════════════════════════════════════════════════════
   QUICKBIZ V5.5 — SCRIPT
   Flow: Input → State → Build → Inject (srcdoc)
   Rules:
   - Single state object
   - collectState() reads DOM once per generate
   - buildPage() reads only from state — NEVER touches DOM
   - container.innerHTML = ... (never +=)
   - Safe parsing: every field has fallback
   - All IDs verified against index.html
   ════════════════════════════════════════════════════ */

'use strict';

/* ════════════════════════════════════
   STATE OBJECT
════════════════════════════════════ */
const STATE = {
  brand:    { name: '', tagline: '', heroImg: '' },
  info:     { timings: '', location: '', mapsUrl: '' }, 
  gallery:  [],        // string[]
  menu:     [],        // {category, item, price}[]
  reviews:  [],        // {name, stars, text}[]
  cta:      { top: '', bottom: '' },
  buttons:  {
    callNum: '', waNum: '',
    callBg: '#1a1a2e', callBd: '#1a1a2e', callTx: '#ffffff',
    waBg:   '#25D366', waBd:   '#25D366', waTx:   '#ffffff',
  },
  colors: {
    primary: '#fdf6ee', secondary: '#fff9f2', surface: '#f5ede0',
    accent: '#c8813a', text: '#1c1410', subtext: '#6b5744', outline: '#e8d5c0',
  },
  font: 'modern',
};

/* ════════════════════════════════════
   HELPERS
════════════════════════════════════ */

/** Safely get element value or fallback — NEVER throws */
function val(id, fallback = '') {
  const el = document.getElementById(id);
  return el ? el.value.trim() : fallback;
}

/** Escape HTML entities for safe injection */
function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Get checked radio value safely */
function checkedRadio(name, fallback) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : fallback;
}

/** Parse stars — clamp 0.5–5, support half */
function parseStars(raw) {
  const n = parseFloat(raw);
  if (isNaN(n)) return 5;
  return Math.min(5, Math.max(0.5, Math.round(n * 2) / 2));
}

/** Render star string with full/half/empty */
function starsHTML(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    '<span class="star-full">' + '★'.repeat(full) + '</span>' +
    (half ? '<span class="star-half">½</span>' : '') +
    '<span class="star-empty">' + '☆'.repeat(empty) + '</span>'
  );
}

/** Group menu items by category */
function groupMenu(items) {
  const map = new Map();
  for (const it of items) {
    if (!map.has(it.category)) map.set(it.category, []);
    map.get(it.category).push(it);
  }
  return Array.from(map.entries()).map(([cat, rows]) => ({ cat, rows }));
}

/** Get Google Fonts import URL */
function fontImportURL(font) {
  if (font === 'elegant') return 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap';
  if (font === 'cute')    return 'https://fonts.googleapis.com/css2?family=Pacifico&family=Poppins:wght@300;400;500;600;700&display=swap';
  return 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap';
}

/** Get heading font-family CSS value */
function headingFont(font) {
  if (font === 'elegant') return "'Playfair Display', Georgia, serif";
  if (font === 'cute')    return "'Pacifico', cursive";
  return "'Poppins', sans-serif";
}

/* ════════════════════════════════════
   COLLECT STATE (reads DOM → STATE)
════════════════════════════════════ */
function collectState() {
  // ── Brand
  STATE.brand.name    = val('inp-name', '');
  STATE.brand.tagline = val('inp-tagline', '');
  STATE.brand.heroImg = val('inp-hero-img', '');

  // ── Info
  STATE.info.timings  = val('inp-timings', '');
  STATE.info.location = val('inp-location', '');
  STATE.info.mapsUrl  = val('inp-maps-url', '');

  // ── Gallery — split lines, filter empty
  STATE.gallery = val('inp-gallery', '')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 6); // filter junk short strings

  // ── Menu — safe parse: Category | Item | Price
  STATE.menu = val('inp-menu', '')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(line => {
      const p = line.split('|').map(x => x.trim());
      // Safe: even if format is imperfect, extract what we can
      return {
        category: p[0] || 'Other',
        item:     p[1] || p[0] || '',
        price:    p[2] || '',
      };
    })
    .filter(m => m.item.length > 0);

  // ── Reviews — safe parse: Name | Stars | Text
  STATE.reviews = val('inp-reviews', '')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(line => {
      const p = line.split('|').map(x => x.trim());
      return {
        name:  p[0] || 'Guest',
        stars: parseStars(p[1]),
        text:  p[2] || p[1] || '',
      };
    })
    .filter(r => r.text.length > 0);

  // ── CTA
  STATE.cta.top    = val('inp-cta-top', '');
  STATE.cta.bottom = val('inp-cta-bottom', '');

  // ── Buttons
  STATE.buttons.callNum = val('inp-call', '');
  STATE.buttons.waNum   = val('inp-wa', '');
  STATE.buttons.callBg  = colorVal('c-call-bg');
  STATE.buttons.callBd  = colorVal('c-call-bd');
  STATE.buttons.callTx  = colorVal('c-call-tx');
  STATE.buttons.waBg    = colorVal('c-wa-bg');
  STATE.buttons.waBd    = colorVal('c-wa-bd');
  STATE.buttons.waTx    = colorVal('c-wa-tx');

  // ── Colors
  STATE.colors.primary   = colorVal('c-primary');
  STATE.colors.secondary = colorVal('c-secondary');
  STATE.colors.surface   = colorVal('c-surface');
  STATE.colors.accent    = colorVal('c-accent');
  STATE.colors.text      = colorVal('c-text');
  STATE.colors.subtext   = colorVal('c-subtext');
  STATE.colors.outline   = colorVal('c-outline');

  // ── Font
  STATE.font = checkedRadio('qb-font', 'modern');
}

/** Safe color value getter */
function colorVal(id) {
  const el = document.getElementById(id);
  return (el && el.value) ? el.value : '#888888';
}

/* ════════════════════════════════════
   PAGE CSS BUILDER
════════════════════════════════════ */
function buildCSS(s) {
  const hFont = headingFont(s.font);
  const c = s.colors;

  return `
/* ── RESET ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ────────────────────────────────────
   GENERATED PAGE BODY
   ✅ overflow-x: hidden ONLY
   ✅ NO overflow: hidden (would block scroll)
──────────────────────────────────── */
html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Poppins', sans-serif;
  background: ${c.primary};
  color: ${c.text};
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden; /* ✅ Only block horizontal, never vertical */
  /* ✅ NO overflow:hidden here — allows full vertical scroll */
}

/* ── FADE IN ── */
@keyframes qbFade {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.qb-reveal {
  opacity: 0;
  animation: qbFade 0.5s ease forwards;
}

.qb-reveal:nth-child(1) { animation-delay: 0.05s; }
.qb-reveal:nth-child(2) { animation-delay: 0.1s; }
.qb-reveal:nth-child(3) { animation-delay: 0.15s; }
.qb-reveal:nth-child(4) { animation-delay: 0.2s; }
.qb-reveal:nth-child(5) { animation-delay: 0.25s; }
.qb-reveal:nth-child(6) { animation-delay: 0.3s; }
.qb-reveal:nth-child(7) { animation-delay: 0.35s; }
.qb-reveal:nth-child(8) { animation-delay: 0.4s; }

/* ════════════════════
   HERO
════════════════════ */
.page-hero {
  width: 100%;
  /* ✅ NO fixed height, NO object-fit cover — adapts naturally */
  position: relative;
  overflow: hidden;
}

/* Hero with background-image uses min-height + overlay */
.page-hero--bg {
  min-height: 280px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: flex-end;
}

/* Hero with <img> tag — image drives height, no cropping */
.page-hero--img {
  background: ${c.surface};
}

/* ✅ CORRECT hero image rule — no fixed height, no crop */
.page-hero__img {
  width: 100%;
  height: auto;   /* ✅ adapts to image ratio */
  display: block;
  max-height: 420px;
  object-fit: cover; /* only used when max-height is a constraint */
}

.page-hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.18) 60%, transparent 100%);
  pointer-events: none;
}

.page-hero__content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 20px 22px;
}

.page-hero--no-img .page-hero__content {
  position: relative;
  padding: 40px 20px 32px;
  background: linear-gradient(135deg, ${c.surface}, ${c.secondary});
}

.hero-name {
  font-family: ${hFont};
  font-size: clamp(24px, 8vw, 34px);
  font-weight: 700;
  color: #fff;
  line-height: 1.15;
  text-shadow: 0 2px 18px rgba(0,0,0,0.45);
  letter-spacing: -0.2px;
}

.hero-name--dark {
  color: ${c.text};
  text-shadow: none;
}

.hero-tagline {
  margin-top: 7px;
  font-size: 13px;
  font-weight: 400;
  color: rgba(255,255,255,0.88);
  line-height: 1.5;
  max-width: 300px;
  text-shadow: 0 1px 6px rgba(0,0,0,0.3);
}

.hero-tagline--dark {
  color: ${c.subtext};
  text-shadow: none;
}

/* ════════════════════
   INFO
════════════════════ */
.page-info {
  background: ${c.surface};
  padding: 18px 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* Glassmorphism card */
.info-card {
  background: ${c.secondary};
  border: 1px solid ${c.outline};
  border-radius: 14px;
  padding: 14px 12px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.info-card--link {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  display: flex;
}

.info-card--link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}

.info-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}

.info-body { flex: 1; min-width: 0; }

.info-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  color: ${c.accent};
  margin-bottom: 3px;
}

.info-value {
  font-size: 12px;
  font-weight: 500;
  color: ${c.text};
  line-height: 1.4;
  word-break: break-word;
}

.info-arrow {
  font-size: 14px;
  color: ${c.accent};
  flex-shrink: 0;
  align-self: center;
}

/* ════════════════════
   SECTION HEADER
════════════════════ */
.sec-hdr {
  padding: 0 16px 12px;
}

.sec-title {
  font-family: ${hFont};
  font-size: 20px;
  font-weight: 700;
  color: ${c.text};
  padding-bottom: 8px;
  border-bottom: 2px solid ${c.outline};
}

/* ════════════════════
   GALLERY
════════════════════ */
.page-gallery {
  padding: 28px 0 24px 16px;
  background: ${c.primary};
  overflow: hidden;
}

/* ✅ Horizontal scroll with snap — ONLY x-scroll, y is page scroll */
.gallery-track {
  display: flex;
  gap: 12px;
  overflow-x: auto;  /* ✅ x scroll only */
  overflow-y: visible;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-right: 16px;
  padding-bottom: 2px;
}

.gallery-track::-webkit-scrollbar { display: none; }

.gallery-item {
  flex-shrink: 0;
  width: 82%;
  border-radius: 14px;
  overflow: hidden;
  scroll-snap-align: start;
  border: 1px solid ${c.outline};
  box-shadow: 0 3px 14px rgba(0,0,0,0.07);
  transition: transform 0.22s ease;
  background: ${c.surface};
}

.gallery-item:hover {
  transform: scale(1.01);
}

/* ✅ gallery image: width 100%, height auto — NO fixed height, NO crop */
.gallery-item img {
  width: 100%;
  height: auto;
  display: block;
  max-height: 220px;
  object-fit: cover;
}

/* ════════════════════
   MENU
════════════════════ */
.page-menu {
  padding: 28px 16px;
  background: ${c.surface};
}

.menu-category { margin-bottom: 20px; }
.menu-category:last-child { margin-bottom: 0; }

.menu-cat-title {
  font-family: ${hFont};
  font-size: 13px;
  font-weight: 700;
  color: ${c.accent};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding-bottom: 7px;
  margin-bottom: 4px;
  border-bottom: 1px solid ${c.outline};
}

.menu-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  padding: 9px 0;
  border-bottom: 1px dashed ${c.outline}88;
  transition: opacity 0.2s ease;
}

.menu-row:last-child { border-bottom: none; }

.menu-row.is-hidden { display: none; }

.menu-item-name {
  font-size: 13px;
  font-weight: 500;
  color: ${c.text};
  line-height: 1.4;
}

.menu-item-price {
  font-size: 13px;
  font-weight: 700;
  color: ${c.accent};
  white-space: nowrap;
  flex-shrink: 0;
}

.menu-more-btn {
  display: block;
  margin: 16px auto 0;
  background: transparent;
  border: 1.5px solid ${c.accent};
  border-radius: 8px;
  color: ${c.accent};
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 22px;
  cursor: pointer;
  transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;
}

.menu-more-btn:hover {
  background: ${c.accent};
  color: #fff;
  transform: translateY(-1px);
}

/* ════════════════════
   REVIEWS
════════════════════ */
.page-reviews {
  padding: 28px 0 24px 16px;
  background: ${c.primary};
  overflow: hidden;
}

/* ✅ Horizontal scroll — x only */
.reviews-track {
  display: flex;
  gap: 12px;
  overflow-x: auto;  /* ✅ x scroll only */
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-right: 16px;
  padding-bottom: 2px;
}

.reviews-track::-webkit-scrollbar { display: none; }

.review-card {
  flex-shrink: 0;
  width: 76%;
  background: ${c.secondary};
  border: 1px solid ${c.outline};
  border-radius: 16px;
  padding: 18px 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5);
  transition: transform 0.2s ease;
}

.review-card:hover { transform: translateY(-2px); }

.review-stars {
  font-size: 15px;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.star-full  { color: ${c.accent}; }
.star-half  { color: ${c.accent}; opacity: 0.7; }
.star-empty { color: ${c.outline}; }

.review-text {
  font-size: 13px;
  color: ${c.subtext};
  line-height: 1.6;
  margin-bottom: 12px;
}

.review-name {
  font-size: 12px;
  font-weight: 700;
  color: ${c.text};
}

/* ════════════════════
   CTA
════════════════════ */
.page-cta-top {
  background: ${c.accent};
  padding: 20px;
  text-align: center;
}

.cta-top-text {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  line-height: 1.5;
}

.page-cta-bottom {
  padding: 32px 20px 10px;
  text-align: center;
  background: ${c.primary};
}

.cta-bottom-text {
  font-family: ${hFont};
  font-size: 20px;
  font-weight: 700;
  color: ${c.text};
  line-height: 1.4;
}

/* ════════════════════
   BUTTONS
════════════════════ */
.page-buttons {
  padding: 18px 16px 40px;
  background: ${c.primary};
}

.buttons-row {
  display: flex;
  gap: 12px;
}

.page-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 10px;
  border-radius: 14px;
  border-width: 2px;
  border-style: solid;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 3px 14px rgba(0,0,0,0.14);
}

.page-btn:hover {
  opacity: 0.92;
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(0,0,0,0.2);
}

.page-btn:active {
  transform: translateY(0);
  opacity: 0.85;
}

/* ════════════════════
   IMAGE FALLBACK
════════════════════ */
img.img-error {
  background: ${c.surface};
  border: 1px dashed ${c.outline};
}

/* ════════════════════
   SCROLLBAR GLOBAL (generated page)
════════════════════ */
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-thumb { background: ${c.outline}; border-radius: 3px; }
`;
}

/* ════════════════════════════════════
   PAGE JS (inline in generated page)
════════════════════════════════════ */
function buildPageJS() {
  return `
(function() {
  'use strict';

  /* ── MENU TOGGLE ── */
  window.menuToggle = function(btn) {
    var hidden = document.querySelectorAll('.menu-row.is-hidden');
    var expanded = btn.getAttribute('data-exp') === '1';

    if (!expanded) {
      /* Show all */
      document.querySelectorAll('.menu-row').forEach(function(row) {
        row.classList.remove('is-hidden');
      });
      btn.textContent = 'Show less ↑';
      btn.setAttribute('data-exp', '1');
    } else {
      /* Hide items beyond limit */
      var idx = 0;
      document.querySelectorAll('.menu-row').forEach(function(row) {
        idx++;
        if (idx > 6) row.classList.add('is-hidden');
      });
      btn.textContent = 'Show more →';
      btn.setAttribute('data-exp', '0');
      var sec = document.querySelector('.page-menu');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* ── IMAGE ERROR FALLBACK ── */
  document.querySelectorAll('img[data-fallback]').forEach(function(img) {
    img.onerror = function() {
      this.src = 'data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'220\\' viewBox=\\'0 0 400 220\\'%3E%3Crect width=\\'400\\' height=\\'220\\' fill=\\'%23f0e8dc\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'0.3em\\' font-size=\\'40\\' fill=\\'%23c8813a\\' font-family=\\'sans-serif\\'%3E🖼%3C/text%3E%3C/svg%3E';
      this.classList.add('img-error');
    };
  });

  /* ── SCROLL REVEAL ── */
  var reveals = document.querySelectorAll('.qb-reveal');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.style.animationPlayState = 'running';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.06 });
    reveals.forEach(function(el) {
      el.style.animationPlayState = 'paused';
      obs.observe(el);
    });
  } else {
    reveals.forEach(function(el) { el.style.opacity = 1; });
  }

})();
`;
}

/* ════════════════════════════════════
   SECTION BUILDERS (read only from STATE)
════════════════════════════════════ */

function buildHero(s) {
  const name    = esc(s.brand.name    || 'Your Cafe');
  const tagline = esc(s.brand.tagline || '');
  const img     = s.brand.heroImg;

  if (img) {
    // Has image URL: use <img> tag so height is natural (no cropping)
    return `
<section class="page-hero page-hero--img qb-reveal">
  <img
    class="page-hero__img"
    src="${esc(img)}"
    alt="${name}"
    data-fallback="1"
  />
  <div class="page-hero__overlay"></div>
  <div class="page-hero__content">
    <h1 class="hero-name">${name}</h1>
    ${tagline ? `<p class="hero-tagline">${tagline}</p>` : ''}
  </div>
</section>`;
  }

  // No image: styled section with dark-text variant
  return `
<section class="page-hero page-hero--no-img qb-reveal">
  <div class="page-hero__content">
    <h1 class="hero-name hero-name--dark">${name}</h1>
    ${tagline ? `<p class="hero-tagline hero-tagline--dark">${tagline}</p>` : ''}
  </div>
</section>`;
}

function buildInfo(s) {
  if (!s.info.timings && !s.info.location) return '';

  const timingsCard = s.info.timings ? `
  <div class="info-card">
    <span class="info-icon">🕐</span>
    <div class="info-body">
      <div class="info-label">Hours</div>
      <div class="info-value">${esc(s.info.timings)}</div>
    </div>
  </div>` : '';

  const locationCard = s.info.location
    ? (s.info.mapsUrl
      ? `<a class="info-card info-card--link" href="${esc(s.info.mapsUrl)}" target="_blank" rel="noopener">
          <span class="info-icon">📍</span>
          <div class="info-body">
            <div class="info-label">Location</div>
            <div class="info-value">${esc(s.info.location)}</div>
          </div>
          <span class="info-arrow">→</span>
        </a>`
      : `<div class="info-card">
          <span class="info-icon">📍</span>
          <div class="info-body">
            <div class="info-label">Location</div>
            <div class="info-value">${esc(s.info.location)}</div>
          </div>
        </div>`)
    : '';

  return `
<section class="page-info qb-reveal">
  <div class="info-grid">
    ${timingsCard}
    ${locationCard}
  </div>
</section>`;
}

function buildGallery(s) {
  if (!s.gallery.length) return '';

  const imgs = s.gallery.map(url => `
    <div class="gallery-item">
      <img src="${esc(url)}" alt="Cafe photo" loading="lazy" data-fallback="1" />
    </div>`).join('');

  return `
<section class="page-gallery qb-reveal">
  <div class="sec-hdr"><h2 class="sec-title">Gallery</h2></div>
  <div class="gallery-track">${imgs}</div>
</section>`;
}

function buildMenu(s) {
  if (!s.menu.length) return '';

  const LIMIT = 6;
  const total = s.menu.length;
  const needsToggle = total > LIMIT;
  const grouped = groupMenu(s.menu);

  let rowIndex = 0;
  let categoriesHTML = '';

  for (const g of grouped) {
    const rowsHTML = g.rows.map(row => {
      rowIndex++;
      const hiddenClass = (needsToggle && rowIndex > LIMIT) ? ' is-hidden' : '';
      return `
      <div class="menu-row${hiddenClass}">
        <span class="menu-item-name">${esc(row.item)}</span>
        <span class="menu-item-price">${esc(row.price)}</span>
      </div>`;
    }).join('');

    categoriesHTML += `
    <div class="menu-category">
      <div class="menu-cat-title">${esc(g.cat)}</div>
      ${rowsHTML}
    </div>`;
  }

  const toggleBtn = needsToggle
    ? `<button class="menu-more-btn" data-exp="0" onclick="menuToggle(this)" type="button">Show more →</button>`
    : '';

  return `
<section class="page-menu qb-reveal">
  <div class="sec-hdr"><h2 class="sec-title">Menu</h2></div>
  ${categoriesHTML}
  ${toggleBtn}
</section>`;
}

function buildReviews(s) {
  if (!s.reviews.length) return '';

  const cards = s.reviews.map(r => `
    <div class="review-card">
      <div class="review-stars">${starsHTML(r.stars)}</div>
      <p class="review-text">${esc(r.text)}</p>
      <div class="review-name">${esc(r.name)}</div>
    </div>`).join('');

  return `
<section class="page-reviews qb-reveal">
  <div class="sec-hdr"><h2 class="sec-title">Reviews</h2></div>
  <div class="reviews-track">${cards}</div>
</section>`;
}

function buildCTA(s) {
  // ✅ Top CTA: ONLY render if not empty
  const topCTA = s.cta.top
    ? `<section class="page-cta-top qb-reveal"><p class="cta-top-text">${esc(s.cta.top)}</p></section>`
    : '';

  // Bottom CTA: always render (with fallback)
  const bottomText = s.cta.bottom || 'Come visit us today.';
  const bottomCTA = `
<section class="page-cta-bottom qb-reveal">
  <p class="cta-bottom-text">${esc(bottomText)}</p>
</section>`;

  return topCTA + bottomCTA;
}

function buildButtons(s) {
  const hasCall = !!s.buttons.callNum;
  const hasWA   = !!s.buttons.waNum;
  if (!hasCall && !hasWA) return '';

  const callBtn = hasCall ? `
    <a class="page-btn"
       href="tel:${esc(s.buttons.callNum)}"
       style="background:${s.buttons.callBg};border-color:${s.buttons.callBd};color:${s.buttons.callTx};">
      📞 Call Us
    </a>` : '';

  const waBtn = hasWA ? `
    <a class="page-btn"
       href="https://wa.me/${s.buttons.waNum.replace(/[^0-9]/g, '')}"
       target="_blank"
       rel="noopener"
       style="background:${s.buttons.waBg};border-color:${s.buttons.waBd};color:${s.buttons.waTx};">
      💬 WhatsApp
    </a>` : '';

  return `
<section class="page-buttons qb-reveal">
  <div class="buttons-row">
    ${callBtn}
    ${waBtn}
  </div>
</section>`;
}

/* ════════════════════════════════════
   PAGE ASSEMBLER
════════════════════════════════════ */
function buildPage(s) {
  const css    = buildCSS(s);
  const js     = buildPageJS();
  const fontURL = fontImportURL(s.font);

  // ✅ Strict section order
  const sections = [
    buildHero(s),
    buildInfo(s),
    buildGallery(s),
    buildMenu(s),
    buildReviews(s),
    buildCTA(s),
    buildButtons(s),
  ].join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(s.brand.name || 'Cafe')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fontURL}" rel="stylesheet" />
  <style>${css}</style>
</head>
<body>
${sections}
<script>${js}<\/script>
</body>
</html>`;
}

/* ════════════════════════════════════
   RENDER — State → iframe
════════════════════════════════════ */
function renderPage() {
  // 1. Read all inputs into STATE once
  collectState();

  // 2. Build full HTML from STATE (never touches DOM again)
  const html = buildPage(STATE);

  // 3. ✅ Inject with srcdoc (no reload, no external URL)
  const frame = document.getElementById('qb-preview-frame');
  if (!frame) return;
  frame.srcdoc = html; // ✅ NOT += , always full replace

  // 4. Hide empty state
  const empty = document.getElementById('qb-empty-state');
  if (empty) empty.classList.add('is-hidden');
}

/* ════════════════════════════════════
   COLOR SYNC — picker ↔ text input
════════════════════════════════════ */
function syncColors() {
  // Array of [colorInputId, textInputId] pairs — MUST match index.html IDs exactly
  const pairs = [
    ['c-call-bg', 'c-call-bg-t'], ['c-call-bd', 'c-call-bd-t'], ['c-call-tx', 'c-call-tx-t'],
    ['c-wa-bg',   'c-wa-bg-t'],   ['c-wa-bd',   'c-wa-bd-t'],   ['c-wa-tx',   'c-wa-tx-t'],
    ['c-primary',   'c-primary-t'],   ['c-secondary', 'c-secondary-t'],
    ['c-surface',   'c-surface-t'],   ['c-accent',    'c-accent-t'],
    ['c-text',      'c-text-t'],      ['c-subtext',   'c-subtext-t'],
    ['c-outline',   'c-outline-t'],
  ];

  for (const [picId, txtId] of pairs) {
    const picker = document.getElementById(picId);
    const text   = document.getElementById(txtId);
    if (!picker || !text) continue;

    picker.addEventListener('input', () => { text.value = picker.value; });

    text.addEventListener('input', () => {
      const v = text.value.trim();
      if (/^#([0-9a-fA-F]{3}){1,2}$/.test(v)) picker.value = v;
    });
  }
}

/* ════════════════════════════════════
   DEVICE SWITCHER
════════════════════════════════════ */
function initDeviceSwitcher() {
  const shell     = document.getElementById('qb-device-shell');
  const btnMobile = document.getElementById('dev-mobile');
  const btnTablet = document.getElementById('dev-tablet');
  if (!shell || !btnMobile || !btnTablet) return;

  btnMobile.addEventListener('click', () => {
    shell.className = 'mode-mobile';
    btnMobile.classList.add('active');
    btnTablet.classList.remove('active');
  });

  btnTablet.addEventListener('click', () => {
    shell.className = 'mode-tablet';
    btnTablet.classList.add('active');
    btnMobile.classList.remove('active');
  });
}

/* ════════════════════════════════════
   INIT
════════════════════════════════════ */
function init() {
  // ✅ Wire generate buttons — IDs verified against HTML
  const btnTop = document.getElementById('btn-gen-top');
  const btnBot = document.getElementById('btn-gen-bottom');
  if (btnTop) btnTop.addEventListener('click', renderPage);
  if (btnBot) btnBot.addEventListener('click', renderPage);

  // ✅ Color sync
  syncColors();

  // ✅ Device switcher
  initDeviceSwitcher();

  // ✅ Enter key on any text input triggers generate
  document.querySelectorAll('input[type="text"], input[type="url"], input[type="tel"]')
    .forEach(inp => inp.addEventListener('keydown', e => { if (e.key === 'Enter') renderPage(); }));
}

document.addEventListener('DOMContentLoaded', init);
