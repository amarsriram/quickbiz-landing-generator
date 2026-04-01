/* ═══════════════════════════════════════════════════════════════
   QUICKBIZ V5.5 — PREMIUM SCRIPT
   Architecture: Input → State → Build → Inject (srcdoc)
   Rules:
     • Single STATE object — never read DOM after collectState()
     • container.innerHTML = ... (never +=)
     • Every field has fallback
     • All IDs match index.html exactly
     • Generated page: overflow-x:hidden only, full vertical scroll
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ════════════════════════════════════
   1. STATE
════════════════════════════════════ */
const STATE = {
  brand:   { name: '', tagline: '', hero: '' },
  info:    { timings: '', location: '', mapsUrl: '' },
  gallery: [],
  menu:    [],     // [{cat, item, price}]
  reviews: [],     // [{name, stars, text}]
  cta:     { top: '', bottom: '' },
  buttons: {
    callNum: '', waNum: '',
    callBg: '#1a1a2e', callBd: '#1a1a2e', callTx: '#ffffff',
    waBg: '#25D366',   waBd: '#25D366',   waTx: '#ffffff',
  },
  colors: {
    primary: '#fdf6ee', secondary: '#fff9f2', surface: '#f5ede0',
    accent: '#c8813a',  text: '#1c1410',     subtext: '#6b5744',
    outline: '#e8d5c0',
  },
  font: 'modern',
};

/* Last generated HTML for copy/download */
let _lastHTML = '';

/* ════════════════════════════════════
   2. SAFE DOM HELPERS
════════════════════════════════════ */
const $  = id => document.getElementById(id);
const val = (id, fb = '') => { const e = $(id); return e ? e.value.trim() : fb; };
const clr = (id)         => { const e = $(id); return (e && e.value) ? e.value : '#888888'; };
const radioVal = name    => { const e = document.querySelector(`input[name="${name}"]:checked`); return e ? e.value : 'modern'; };
const nowTime  = ()      => { const d = new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`; };

/* ════════════════════════════════════
   3. COLLECT — DOM → STATE (once per generate)
════════════════════════════════════ */
function collectState() {
  STATE.brand = {
    name:    val('inp-name',    ''),
    tagline: val('inp-tagline', ''),
    hero:    val('inp-hero',    ''),
  };

  STATE.info = {
    timings:  val('inp-timings',  ''),
    location: val('inp-location', ''),
    mapsUrl:  val('inp-maps',     ''),
  };

  STATE.gallery = val('inp-gallery')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 8);

  STATE.menu = val('inp-menu')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .map(line => {
      const p = line.split('|').map(x => x.trim());
      return { cat: p[0] || 'Other', item: p[1] || p[0] || '', price: p[2] || '' };
    })
    .filter(m => m.item.length > 0);

  STATE.reviews = val('inp-reviews')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .map(line => {
      const p = line.split('|').map(x => x.trim());
      const n = parseFloat(p[1]);
      return {
        name:  p[0] || 'Guest',
        stars: isNaN(n) ? 5 : Math.min(5, Math.max(0.5, Math.round(n * 2) / 2)),
        text:  p[2] || p[1] || '',
      };
    })
    .filter(r => r.text.length > 0);

  STATE.cta = {
    top:    val('inp-cta1', ''),
    bottom: val('inp-cta2', ''),
  };

  STATE.buttons = {
    callNum: val('inp-call', ''),
    waNum:   val('inp-wa',   ''),
    callBg:  clr('c-cbg'), callBd: clr('c-cbd'), callTx: clr('c-ctx'),
    waBg:    clr('c-wbg'), waBd:   clr('c-wbd'), waTx:   clr('c-wtx'),
  };

  STATE.colors = {
    primary:   clr('c-pr'),  secondary: clr('c-sc'),
    surface:   clr('c-su'),  accent:    clr('c-ac'),
    text:      clr('c-tx'),  subtext:   clr('c-st'),
    outline:   clr('c-ol'),
  };

  STATE.font = radioVal('qb-font');
}

/* ════════════════════════════════════
   4. GENERATED PAGE UTILITIES
════════════════════════════════════ */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    `<span class="s-full">${'★'.repeat(full)}</span>` +
    (half ? '<span class="s-half">½</span>' : '') +
    `<span class="s-empty">${'☆'.repeat(empty)}</span>`
  );
}

function groupMenuByCategory(items) {
  const map = new Map();
  items.forEach(it => {
    if (!map.has(it.cat)) map.set(it.cat, []);
    map.get(it.cat).push(it);
  });
  return [...map.entries()].map(([cat, rows]) => ({ cat, rows }));
}

function getHeadingFont(font) {
  if (font === 'elegant') return "'Playfair Display', Georgia, serif";
  if (font === 'cute')    return "'Pacifico', cursive";
  return "'Poppins', sans-serif";
}

function getFontImportURL(font) {
  if (font === 'elegant') return 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap';
  if (font === 'cute')    return 'https://fonts.googleapis.com/css2?family=Pacifico&family=Poppins:wght@300;400;500;600;700&display=swap';
  return 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap';
}

/* ════════════════════════════════════
   5. GENERATED PAGE CSS
   Premium design system:
   • CSS custom properties from STATE.colors
   • Container system (max-width 480px)
   • Card depth with shadows
   • Smooth transitions everywhere
   • 8/16/24 spacing scale
   • No overflow:hidden on body
════════════════════════════════════ */
function buildPageCSS(s) {
  const c  = s.colors;
  const hf = getHeadingFont(s.font);

  return `
/* ── RESET ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── PAGE VARS ── */
:root {
  --primary:   ${c.primary};
  --secondary: ${c.secondary};
  --surface:   ${c.surface};
  --accent:    ${c.accent};
  --text:      ${c.text};
  --subtext:   ${c.subtext};
  --outline:   ${c.outline};
  --accent-10: ${c.accent}1a;
  --accent-25: ${c.accent}40;
  --shadow-sm: 0 2px 12px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 20px rgba(0,0,0,0.09);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.13);
  --r-sm: 10px;
  --r-md: 14px;
  --r-lg: 18px;
}

html { scroll-behavior: smooth; }

/* ✅ Body: overflow-x hidden ONLY. Vertical scroll is FREE. */
body {
  font-family: 'Poppins', sans-serif;
  background: var(--primary);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  min-height: 100vh;
}

/* ── CONTAINER ── */
.container {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 16px;
}

/* ── SECTION SPACING ── */
.section { margin-bottom: 24px; }

/* ── ANIMATIONS ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0);    }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1);    }
}
.reveal {
  opacity: 0;
  animation: fadeUp 0.52s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}
.reveal:nth-child(1) { animation-delay: 0.04s; }
.reveal:nth-child(2) { animation-delay: 0.10s; }
.reveal:nth-child(3) { animation-delay: 0.16s; }
.reveal:nth-child(4) { animation-delay: 0.22s; }
.reveal:nth-child(5) { animation-delay: 0.28s; }
.reveal:nth-child(6) { animation-delay: 0.34s; }
.reveal:nth-child(7) { animation-delay: 0.40s; }
.reveal:nth-child(8) { animation-delay: 0.46s; }

/* ══════════════════════════════════
   HERO
══════════════════════════════════ */
.hero { width: 100%; position: relative; display: block; }

/* Hero WITH image */
.hero-media { position: relative; width: 100%; }

/* ✅ Image: width 100%, height auto. Never a fixed height crop. */
.hero-media img {
  width: 100%;
  height: auto;
  display: block;
  min-height: 200px;
  max-height: 380px;
  object-fit: cover;
}

.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    to top,
    rgba(0,0,0,0.76) 0%,
    rgba(0,0,0,0.26) 50%,
    rgba(0,0,0,0.02) 100%
  );
  pointer-events: none;
}

.hero-content {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 20px 20px 20px;
}

/* Hero WITHOUT image */
.hero-noimg {
  padding: 48px 20px 38px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--surface) 0%, var(--secondary) 100%);
}

.hero-noimg::before {
  content: '☕';
  font-size: 130px;
  position: absolute;
  right: -20px; top: -20px;
  opacity: 0.04;
  line-height: 1;
  pointer-events: none;
}

.hero-noimg .hero-name   { color: var(--text); text-shadow: none; }
.hero-noimg .hero-tagline { color: var(--subtext); text-shadow: none; }

.hero-name {
  font-family: ${hf};
  font-size: clamp(24px, 8.5vw, 36px);
  font-weight: 700;
  color: #ffffff;
  line-height: 1.12;
  letter-spacing: -0.4px;
  text-shadow: 0 2px 22px rgba(0,0,0,0.55);
}

.hero-tagline {
  margin-top: 9px;
  font-size: 13px;
  font-weight: 400;
  color: rgba(255,255,255,0.88);
  line-height: 1.6;
  max-width: 290px;
  text-shadow: 0 1px 6px rgba(0,0,0,0.3);
}

/* ══════════════════════════════════
   INFO
══════════════════════════════════ */
.info-section {
  background: var(--surface);
  padding: 16px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* CARD — base depth style used across all cards */
.card {
  background: var(--secondary);
  border: 1px solid var(--outline);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-sm);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.info-card {
  padding: 14px 12px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  /* glassmorphism depth */
  box-shadow:
    var(--shadow-sm),
    inset 0 1px 0 rgba(255,255,255,0.75),
    inset 0 -1px 0 rgba(0,0,0,0.03);
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.75);
}

.info-icon { font-size: 19px; flex-shrink: 0; margin-top: 1px; }

.info-body { flex: 1; min-width: 0; }

.info-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--accent);
  margin-bottom: 3px;
}

.info-value {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  line-height: 1.45;
  word-break: break-word;
}

.info-arrow {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  flex-shrink: 0;
  align-self: center;
}

/* ══════════════════════════════════
   SECTION TITLE
══════════════════════════════════ */
.section-title {
  font-family: ${hf};
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  padding-bottom: 10px;
  margin-bottom: 16px;
  border-bottom: 2px solid var(--outline);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0;
  width: 36px; height: 2px;
  background: var(--accent);
  border-radius: 2px;
}

/* ══════════════════════════════════
   GALLERY
══════════════════════════════════ */
.gallery-section {
  padding: 24px 0 20px;
  background: var(--primary);
}

.gallery-section .container-pad { padding-left: 16px; }

/* ✅ Horizontal scroll: x ONLY. Page handles y scroll. */
.gallery-track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  overflow-y: visible;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 4px 16px 8px 16px;
  cursor: grab;
}
.gallery-track:active { cursor: grabbing; }
.gallery-track::-webkit-scrollbar { display: none; }

.gallery-item {
  flex-shrink: 0;
  width: 82%;
  border-radius: var(--r-lg);
  overflow: hidden;
  scroll-snap-align: start;
  background: var(--surface);
  border: 1px solid var(--outline);
  box-shadow: var(--shadow-md);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* ✅ Gallery images: no fixed height, height auto */
.gallery-item img {
  width: 100%;
  height: auto;
  display: block;
  min-height: 140px;
  max-height: 220px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: var(--shadow-lg);
}
.gallery-item:hover img { transform: scale(1.05); }

/* ══════════════════════════════════
   MENU
══════════════════════════════════ */
.menu-section {
  padding: 24px 0 20px;
  background: var(--surface);
}

.menu-category { margin-bottom: 20px; }
.menu-category:last-child { margin-bottom: 0; }
.menu-category[data-category] { /* data attr hook for JS */ }

.menu-cat-title {
  font-family: ${hf};
  font-size: 12.5px;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding-bottom: 8px;
  margin-bottom: 4px;
  border-bottom: 1.5px solid var(--outline);
  display: flex;
  align-items: center;
  gap: 8px;
}
.menu-cat-title::before {
  content: '';
  width: 4px; height: 14px;
  background: var(--accent);
  border-radius: 2px;
  flex-shrink: 0;
}

/* MENU ITEM — card depth */
.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  padding: 10px 8px;
  border-radius: var(--r-sm);
  border-bottom: 1px dashed var(--outline);
  transition: background 0.2s ease;
  cursor: default;
}
.menu-item:last-child { border-bottom: none; }
.menu-item:hover { background: rgba(0,0,0,0.03); }
.menu-item.hidden { display: none; }

.menu-item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  line-height: 1.4;
}

.menu-item-price {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  white-space: nowrap;
  flex-shrink: 0;
  background: var(--primary);
  border-radius: 6px;
  padding: 2px 8px;
  border: 1px solid var(--outline);
}

/* MENU TOGGLE BUTTON — btn outline style */
.btn-menu-toggle {
  display: block;
  margin: 16px auto 0;
  background: transparent;
  border: 2px solid var(--accent);
  border-radius: 12px;
  color: var(--accent);
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 9px 22px;
  cursor: pointer;
  letter-spacing: 0.2px;
  transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}
.btn-menu-toggle:hover {
  background: var(--accent);
  color: #ffffff;
  transform: scale(1.04);
  box-shadow: 0 6px 20px var(--accent-25);
}
.btn-menu-toggle:active { transform: scale(1); }

/* ══════════════════════════════════
   REVIEWS
══════════════════════════════════ */
.reviews-section {
  padding: 24px 0 20px;
  background: var(--primary);
}

/* ✅ Reviews: x-scroll ONLY */
.reviews-track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  overflow-y: visible;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 4px 16px 8px 16px;
  cursor: grab;
}
.reviews-track:active { cursor: grabbing; }
.reviews-track::-webkit-scrollbar { display: none; }

.review-card {
  flex-shrink: 0;
  width: 76%;
  scroll-snap-align: start;
  padding: 18px 16px;
  /* card depth */
  background: var(--secondary);
  border: 1px solid var(--outline);
  border-radius: var(--r-lg);
  box-shadow:
    var(--shadow-sm),
    inset 0 1px 0 rgba(255,255,255,0.7),
    inset 0 -1px 0 rgba(0,0,0,0.02);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.7);
}

.review-stars {
  font-size: 15px;
  margin-bottom: 10px;
  letter-spacing: 1.5px;
}
.s-full  { color: var(--accent); }
.s-half  { color: var(--accent); opacity: 0.6; }
.s-empty { color: var(--outline); }

.review-text {
  font-size: 13px;
  color: var(--subtext);
  line-height: 1.65;
  margin-bottom: 12px;
}

.review-name {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 6px;
}
.review-name::before {
  content: '—';
  color: var(--accent);
  font-weight: 300;
}

/* ══════════════════════════════════
   CTA
══════════════════════════════════ */
.cta-top-section {
  /* ✅ Premium gradient as specified */
  background: linear-gradient(135deg, ${c.accent}, ${adjustColor(c.accent, -20)});
  padding: 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.cta-top-section::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 55%);
  pointer-events: none;
}

.cta-top-text {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.55;
  position: relative;
}

.cta-bottom-section {
  padding: 32px 20px 10px;
  text-align: center;
  background: var(--primary);
}

.cta-bottom-text {
  font-family: ${hf};
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.4;
}
.cta-bottom-text::after {
  content: '';
  display: block;
  width: 38px; height: 3px;
  background: var(--accent);
  border-radius: 2px;
  margin: 12px auto 0;
}

/* ══════════════════════════════════
   CONTACT BUTTONS
══════════════════════════════════ */
.buttons-section {
  padding: 16px 16px 44px;
  background: var(--primary);
}

.buttons-row { display: flex; gap: 12px; }

/* btn base — matches design doc */
.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 12px;
  border-radius: 14px;
  border-width: 2px;
  border-style: solid;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  letter-spacing: 0.1px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.14);
  position: relative;
  overflow: hidden;
  transition: transform 0.25s ease, opacity 0.25s ease, box-shadow 0.25s ease;
}
.btn::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(255,255,255,0.14), transparent);
  pointer-events: none;
}
.btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0,0,0,0.22);
  opacity: 0.94;
}
.btn:active { transform: scale(1); }

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 0; height: 0; }
`;
}

/* Darken a hex color by `amount` (0-255) — for CTA gradient end stop */
function adjustColor(hex, amount) {
  try {
    const h = hex.replace('#', '');
    const num = parseInt(h, 16);
    const r = Math.max(0, (num >> 16) + amount);
    const g = Math.max(0, ((num >> 8) & 0xff) + amount);
    const b = Math.max(0, (num & 0xff) + amount);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  } catch { return hex; }
}

/* ════════════════════════════════════
   6. GENERATED PAGE INLINE JS
   Touch/drag scroll, menu toggle,
   image fallback, reveal animations,
   active card effect.
════════════════════════════════════ */
function buildPageJS() {
  return `
(function () {
  'use strict';

  /* ── MENU TOGGLE ── */
  window.menuToggle = function (btn) {
    var rows = document.querySelectorAll('.menu-item');
    var expanded = btn.getAttribute('data-expanded') === '1';
    if (!expanded) {
      rows.forEach(function (r) { r.classList.remove('hidden'); });
      btn.textContent = 'Show less ↑';
      btn.setAttribute('data-expanded', '1');
    } else {
      var idx = 0;
      rows.forEach(function (r) {
        idx++;
        if (idx > 6) r.classList.add('hidden');
      });
      btn.textContent = 'Show more →';
      btn.setAttribute('data-expanded', '0');
      var s = document.querySelector('.menu-section');
      if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* ── IMAGE FALLBACK ── */
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    img.onerror = function () {
      this.src = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">' +
        '<rect width="400" height="200" fill="#f0e8dc"/>' +
        '<text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="28" fill="#c8813a" font-family="sans-serif">🖼 Image</text>' +
        '</svg>'
      );
    };
  });

  /* ── DRAG-TO-SCROLL ON TRACKS ── */
  document.querySelectorAll('.gallery-track, .reviews-track').forEach(function (track) {
    var isDown = false, startX, scrollLeft;
    track.addEventListener('mousedown', function (e) {
      isDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });
    document.addEventListener('mouseup', function () { isDown = false; });
    track.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - track.offsetLeft;
      track.scrollLeft = scrollLeft - (x - startX) * 1.4;
    });
  });

  /* ── TOUCH ACTIVE EFFECT ON CARDS ── */
  document.querySelectorAll('.review-card, .gallery-item').forEach(function (el) {
    el.addEventListener('touchstart', function () {
      el.style.transform = 'scale(0.98)';
    }, { passive: true });
    el.addEventListener('touchend', function () {
      el.style.transform = '';
    });
  });

  /* ── INTERSECTION OBSERVER REVEAL ── */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    reveals.forEach(function (el) {
      el.style.animationPlayState = 'paused';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.style.opacity = '1'; });
  }

  /* ── SMOOTH SCROLL HELPER ── */
  window.scrollToSection = function (el) {
    if (!el) return;
    window.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' });
  };

})();
`;
}

/* ════════════════════════════════════
   7. SECTION BUILDERS
   Each builder reads only from STATE.
   Never touches DOM.
════════════════════════════════════ */

function buildHero(s) {
  const name    = esc(s.brand.name    || 'Your Cafe');
  const tagline = esc(s.brand.tagline || '');

  if (s.brand.hero) {
    return `
<section class="hero section reveal" data-section="hero">
  <div class="hero-media">
    <img
      src="${esc(s.brand.hero)}"
      alt="${name}"
      data-fallback="1"
      onerror="this.src='data:image/svg+xml,'+encodeURIComponent('<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'280\\'><rect width=\\'400\\' height=\\'280\\' fill=\\'#f0e8dc\\'/><text x=\\'50%\\' y=\\'50%\\' text-anchor=\\'middle\\' dy=\\'.35em\\' font-size=\\'28\\' fill=\\'#c8813a\\' font-family=\\'sans-serif\\'>☕ ${name}</text></svg>')"
    />
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1 class="hero-name">${name}</h1>
      ${tagline ? `<p class="hero-tagline">${tagline}</p>` : ''}
    </div>
  </div>
</section>`;
  }

  return `
<section class="hero hero-noimg section reveal" data-section="hero">
  <h1 class="hero-name">${name}</h1>
  ${tagline ? `<p class="hero-tagline">${tagline}</p>` : ''}
</section>`;
}

function buildInfo(s) {
  if (!s.info.timings && !s.info.location) return '';

  const timingsCard = s.info.timings ? `
  <div class="info-card card">
    <span class="info-icon">🕐</span>
    <div class="info-body">
      <div class="info-label">Opening Hours</div>
      <div class="info-value">${esc(s.info.timings)}</div>
    </div>
  </div>` : '';

  const locationCard = s.info.location
    ? (s.info.mapsUrl
        ? `<a class="info-card card" href="${esc(s.info.mapsUrl)}" target="_blank" rel="noopener noreferrer">
    <span class="info-icon">📍</span>
    <div class="info-body">
      <div class="info-label">Location</div>
      <div class="info-value">${esc(s.info.location)}</div>
    </div>
    <span class="info-arrow">→</span>
  </a>`
        : `<div class="info-card card">
    <span class="info-icon">📍</span>
    <div class="info-body">
      <div class="info-label">Location</div>
      <div class="info-value">${esc(s.info.location)}</div>
    </div>
  </div>`)
    : '';

  return `
<section class="info-section section reveal" data-section="info">
  <div class="container">
    <div class="info-grid">
      ${timingsCard}
      ${locationCard}
    </div>
  </div>
</section>`;
}

function buildGallery(s) {
  if (!s.gallery.length) return '';

  const items = s.gallery.map(url => `
  <div class="gallery-item">
    <img src="${esc(url)}" alt="Cafe photo" loading="lazy" data-fallback="1" />
  </div>`).join('');

  return `
<section class="gallery-section section reveal" data-section="gallery">
  <div class="container-pad">
    <h2 class="section-title">Gallery</h2>
  </div>
  <div class="gallery-track">${items}</div>
</section>`;
}

function buildMenu(s) {
  if (!s.menu.length) return '';

  const LIMIT     = 6;
  const needToggle = s.menu.length > LIMIT;
  const grouped   = groupMenuByCategory(s.menu);

  let rowIndex = 0;
  let categoriesHTML = '';

  for (const group of grouped) {
    const rowsHTML = group.rows.map(row => {
      rowIndex++;
      const hiddenClass = (needToggle && rowIndex > LIMIT) ? ' hidden' : '';
      return `
    <div class="menu-item${hiddenClass}" data-index="${rowIndex}">
      <span class="menu-item-name">${esc(row.item)}</span>
      <span class="menu-item-price">${esc(row.price)}</span>
    </div>`;
    }).join('');

    categoriesHTML += `
  <div class="menu-category" data-category="${esc(group.cat.toLowerCase().replace(/\s+/g, '-'))}">
    <div class="menu-cat-title">${esc(group.cat)}</div>
    ${rowsHTML}
  </div>`;
  }

  const toggleBtn = needToggle
    ? `<button class="btn-menu-toggle" data-expanded="0" onclick="menuToggle(this)" type="button">Show more →</button>`
    : '';

  return `
<section class="menu-section section reveal" data-section="menu">
  <div class="container">
    <h2 class="section-title">Menu</h2>
    ${categoriesHTML}
    ${toggleBtn}
  </div>
</section>`;
}

function buildReviews(s) {
  if (!s.reviews.length) return '';

  const cards = s.reviews.map(r => `
  <article class="review-card card">
    <div class="review-stars">${renderStars(r.stars)}</div>
    <p class="review-text">${esc(r.text)}</p>
    <div class="review-name">${esc(r.name)}</div>
  </article>`).join('');

  return `
<section class="reviews-section section reveal" data-section="reviews">
  <div class="container-pad">
    <h2 class="section-title">Reviews</h2>
  </div>
  <div class="reviews-track">${cards}</div>
</section>`;
}

function buildCTA(s) {
  /* Top CTA — only if not empty */
  const topCTA = s.cta.top
    ? `<section class="cta-top-section section reveal" data-section="cta-top">
  <p class="cta-top-text">${esc(s.cta.top)}</p>
</section>`
    : '';

  const bottomText = s.cta.bottom || 'Come visit us today.';
  const bottomCTA = `
<section class="cta-bottom-section section reveal" data-section="cta-bottom">
  <div class="container">
    <p class="cta-bottom-text">${esc(bottomText)}</p>
  </div>
</section>`;

  return topCTA + bottomCTA;
}

function buildButtons(s) {
  const hasCall = !!s.buttons.callNum;
  const hasWA   = !!s.buttons.waNum;
  if (!hasCall && !hasWA) return '';

  const callBtn = hasCall
    ? `<a
    class="btn"
    href="tel:${esc(s.buttons.callNum)}"
    style="background:${s.buttons.callBg};border-color:${s.buttons.callBd};color:${s.buttons.callTx};"
  >📞 Call Us</a>`
    : '';

  const waBtn = hasWA
    ? `<a
    class="btn"
    href="https://wa.me/${s.buttons.waNum.replace(/[^0-9]/g, '')}"
    target="_blank"
    rel="noopener noreferrer"
    style="background:${s.buttons.waBg};border-color:${s.buttons.waBd};color:${s.buttons.waTx};"
  >💬 WhatsApp</a>`
    : '';

  return `
<section class="buttons-section section reveal" data-section="buttons">
  <div class="container">
    <div class="buttons-row">
      ${callBtn}
      ${waBtn}
    </div>
  </div>
</section>`;
}

/* ════════════════════════════════════
   8. FULL PAGE ASSEMBLER
   Strict section order:
   Hero → Info → Gallery → Menu →
   Reviews → CTA Top → CTA Bottom → Buttons
════════════════════════════════════ */
function buildPage(s) {
  const css    = buildPageCSS(s);
  const js     = buildPageJS();
  const fontURL = getFontImportURL(s.font);
  const title   = esc(s.brand.name || 'Cafe');

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
  <title>${title}</title>
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
   9. RENDER — collect → build → inject
════════════════════════════════════ */
function renderPage() {
  /* 1. Collect all inputs into STATE */
  collectState();

  /* 2. Build full HTML from STATE only */
  _lastHTML = buildPage(STATE);

  /* 3. Inject via srcdoc — full replace, never append */
  const frame = $('qb-frame');
  if (!frame) return;
  frame.srcdoc = _lastHTML;

  /* 4. On load: patch inner doc to guarantee scroll works */
  frame.onload = function () {
    try {
      const doc = frame.contentDocument || (frame.contentWindow && frame.contentWindow.document);
      if (doc) {
        doc.documentElement.style.cssText = 'overflow-y: auto !important; height: auto !important;';
        doc.body.style.cssText = 'overflow-y: visible !important; overflow-x: hidden !important; height: auto !important; min-height: 100% !important;';
      }
    } catch (e) { /* sandboxed — safe to ignore */ }
    /* Update clock */
    const clock = $('qb-clock');
    if (clock) clock.textContent = nowTime();
  };

  /* 5. Hide empty state */
  const empty = $('qb-empty-state');
  if (empty) empty.classList.add('hidden');

  /* 6. Gold pulse on device frame */
  const device = $('qb-device');
  if (device) {
    device.style.transition = 'box-shadow 0.3s ease';
    const origShadow = device.style.boxShadow;
    device.style.boxShadow += ', 0 0 0 3px rgba(212,168,75,0.5)';
    setTimeout(() => {
      device.style.boxShadow = origShadow;
      setTimeout(() => { device.style.transition = ''; }, 350);
    }, 420);
  }
}

/* ════════════════════════════════════
   10. COPY + DOWNLOAD
════════════════════════════════════ */
function showToast(msg, type = 'ok') {
  const t = $('qb-toast');
  if (!t) return;
  t.textContent  = msg;
  t.className    = `show toast-${type}`;
  clearTimeout(t._tid);
  t._tid = setTimeout(() => { t.className = ''; }, 2700);
}

function copyHTML() {
  if (!_lastHTML) { showToast('Generate a page first', 'err'); return; }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(_lastHTML)
      .then(() => showToast('✅ HTML copied to clipboard!'))
      .catch(fallbackCopy);
  } else {
    fallbackCopy();
  }
}

function fallbackCopy() {
  const ta = document.createElement('textarea');
  ta.value = _lastHTML;
  ta.style.cssText = 'position:fixed;opacity:0;left:-9999px;top:-9999px;';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast('✅ HTML copied!');
  } catch {
    showToast('Copy failed — use Download instead', 'err');
  }
  document.body.removeChild(ta);
}

function downloadHTML() {
  if (!_lastHTML) { showToast('Generate a page first', 'err'); return; }
  const slug = (STATE.brand.name || 'cafe')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'cafe';
  const blob = new Blob([_lastHTML], { type: 'text/html;charset=utf-8' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `${slug}-landing.html`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); document.body.removeChild(a); }, 400);
  showToast(`⬇ Saved as ${slug}-landing.html`);
}

/* ════════════════════════════════════
   11. COLOR SYNC — picker ↔ hex text
════════════════════════════════════ */
function syncColorPair(pickerId, textId) {
  const picker = $(pickerId);
  const text   = $(textId);
  if (!picker || !text) return;

  picker.addEventListener('input', () => { text.value = picker.value; });

  text.addEventListener('input', () => {
    const v = text.value.trim();
    if (/^#[0-9a-fA-F]{3,6}$/.test(v)) picker.value = v;
  });
}

/* ════════════════════════════════════
   12. DEVICE SWITCHER
════════════════════════════════════ */
function initDeviceSwitcher() {
  const device = $('qb-device');
  const btnM   = $('dev-mobile');
  const btnT   = $('dev-tablet');
  if (!device || !btnM || !btnT) return;

  btnM.addEventListener('click', () => {
    device.className = 'mode-mobile';
    btnM.classList.add('active');
    btnT.classList.remove('active');
  });

  btnT.addEventListener('click', () => {
    device.className = 'mode-tablet';
    btnT.classList.add('active');
    btnM.classList.remove('active');
  });
}

/* ════════════════════════════════════
   13. INIT
════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {

  /* Generate buttons */
  ['btn-gen-top', 'btn-gen-bottom'].forEach(id => {
    const b = $(id);
    if (b) b.addEventListener('click', renderPage);
  });

  /* Copy HTML buttons */
  ['btn-copy-top', 'btn-copy-bar'].forEach(id => {
    const b = $(id);
    if (b) b.addEventListener('click', copyHTML);
  });

  /* Download buttons */
  ['btn-dl-top', 'btn-dl-bar'].forEach(id => {
    const b = $(id);
    if (b) b.addEventListener('click', downloadHTML);
  });

  /* Color pair syncs — all pairs declared here */
  [
    ['c-cbg',  'c-cbg-t'],  ['c-cbd',  'c-cbd-t'],  ['c-ctx',  'c-ctx-t'],
    ['c-wbg',  'c-wbg-t'],  ['c-wbd',  'c-wbd-t'],  ['c-wtx',  'c-wtx-t'],
    ['c-pr',   'c-pr-t'],   ['c-sc',   'c-sc-t'],
    ['c-su',   'c-su-t'],   ['c-ac',   'c-ac-t'],
    ['c-tx',   'c-tx-t'],   ['c-st',   'c-st-t'],
    ['c-ol',   'c-ol-t'],
  ].forEach(([p, t]) => syncColorPair(p, t));

  /* Device switcher */
  initDeviceSwitcher();

  /* Enter on any text input → generate */
  document.querySelectorAll('input[type="text"], input[type="url"], input[type="tel"]')
    .forEach(inp => inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') renderPage();
    }));

  /* Live clock update */
  const clock = $('qb-clock');
  if (clock) {
    clock.textContent = nowTime();
    setInterval(() => { clock.textContent = nowTime(); }, 30000);
  }
});
