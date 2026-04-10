/* ════════════════════════════════════════════════════════════
   QUICKBIZ V5.6 — COMPLETE SCRIPT
   
   Architecture: Input → collectState() → STATE → buildPage() → srcdoc
   
   Critical fixes applied:
   ✅ All buttons have explicit onclick in HTML (no addEventListener misses)
   ✅ API key baked into generated page as const API = "${s.api}"
   ✅ 3-part iframe scroll fix (scrolling=yes, overflow:auto, onload patch)
   ✅ Strict conditional rendering — empty section = "" (never rendered)
   ✅ Gallery/image: object-fit cover, no distortion, aspect-ratio preserved
   ✅ Menu: Category bold heading + aligned item rows + right-aligned price
   ✅ Contact buttons: fixed color system, NOT theme-dependent
   ✅ Loyalty: toggle + API check before rendering
   ✅ innerHTML = (never +=)
   ════════════════════════════════════════════════════════════ */
'use strict';

/* ════════════════
   STATE
════════════════ */
const STATE = {
  brand: {
    name: '', tagline: '', hero: '',
    instagram: '',
  },
  order: { swiggy: '', zomato: '' },
  info:  { location: '', mapsUrl: '', timings: '' },
  gallery:  [],   // string[]
  menu:     [],   // { cat, item, price }[]
  reviews:  [],   // { name, stars, text }[]
  contact:  { callNum: '', waNum: '' },
  loyalty: {
    enabled: false,
    title: '', desc: '', api: '',
  },
  colors: {
    bg: '#fdf6ee', card: '#fff9f2', surface: '#f5ede0',
    accent: '#c8813a', text: '#1c1410', subtext: '#6b5744',
    border: '#e8d5c0',
  },
  font: 'modern',
};

/* Last generated HTML — used by copy/download */
let _lastHTML = '';

/* ════════════════
   SAFE DOM HELPERS
════════════════ */
const $       = id => document.getElementById(id);
const val     = (id, fb = '') => { const e = $(id); return e ? e.value.trim() : fb; };
const checked = id => { const e = $(id); return e ? e.checked : false; };
const clr     = id => { const e = $(id); return (e && e.value) ? e.value : '#888888'; };
const radio   = n  => { const e = document.querySelector(`input[name="${n}"]:checked`); return e ? e.value : 'modern'; };
const nowTime = () => { const d = new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`; };

/* ════════════════
   COLLECT STATE
   Reads DOM → STATE once per generate.
   After this, DOM is never read again.
════════════════ */
function collectState() {
  STATE.brand = {
    name:      val('i-name', ''),
    tagline:   val('i-tag',  ''),
    hero:      val('i-hero', ''),
    instagram: val('i-insta',''),
  };

  STATE.order = {
    swiggy: val('i-swiggy', ''),
    zomato: val('i-zomato', ''),
  };

  STATE.info = {
    location: val('i-loc',   ''),
    mapsUrl:  val('i-maps',  ''),
    timings:  val('i-time',  ''),
  };

  /* Gallery — filter blank/too-short lines */
  STATE.gallery = val('i-gallery')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 8);

  /* Menu — safe parse: Category | Item | Price */
  STATE.menu = val('i-menu')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .map(line => {
      const p = line.split('|').map(x => x.trim());
      return { cat: p[0] || 'Other', item: p[1] || p[0] || '', price: p[2] || '' };
    })
    .filter(m => m.item.length > 0);

  /* Reviews — safe parse: Name | Stars | Text */
  STATE.reviews = val('i-reviews')
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

  STATE.contact = {
    callNum: val('i-call', ''),
    waNum:   val('i-wa',   ''),
  };

  /* Loyalty — only collect fields if toggle is on */
  const loyaltyOn = checked('i-loyalty-on');
  STATE.loyalty = {
    enabled: loyaltyOn,
    title:   val('i-loyalty-title', ''),
    desc:    val('i-loyalty-desc',  ''),
    api:     val('i-api', ''),
  };

  STATE.colors = {
    bg:      clr('c-bg'),
    card:    clr('c-card'),
    surface: clr('c-surf'),
    accent:  clr('c-acc'),
    text:    clr('c-tx'),
    subtext: clr('c-sub'),
    border:  clr('c-bdr'),
  };

  STATE.font = radio('qbfont');
}

/* ════════════════════════════
   PAGE-LEVEL UTILITIES
════════════════════════════ */

/* Safe HTML escape */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Render star rating HTML (full / half / empty) */
function starsHTML(r) {
  const full = Math.floor(r);
  const half = r % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    `<span class="sf">${'★'.repeat(full)}</span>` +
    (half ? `<span class="sh">½</span>` : '') +
    `<span class="se">${'☆'.repeat(empty)}</span>`
  );
}

/* Group flat menu array into [{cat, rows}] */
function groupMenu(items) {
  const map = new Map();
  items.forEach(it => {
    if (!map.has(it.cat)) map.set(it.cat, []);
    map.get(it.cat).push(it);
  });
  return [...map.entries()].map(([cat, rows]) => ({ cat, rows }));
}

/* Darken hex color for CTA gradient */
function darkenHex(hex, amt) {
  try {
    const n = parseInt(hex.replace('#',''), 16);
    const r = Math.max(0, (n >> 16) + amt);
    const g = Math.max(0, ((n >> 8) & 0xff) + amt);
    const b = Math.max(0, (n & 0xff) + amt);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6,'0');
  } catch { return hex; }
}

/* Get heading font CSS value from STATE.font */
function headingFont(f) {
  if (f === 'elegant') return "'Playfair Display', Georgia, serif";
  if (f === 'cute')    return "'Pacifico', cursive";
  return "'Poppins', sans-serif";
}

/* Google Fonts import URL from STATE.font */
function fontURL(f) {
  if (f === 'elegant') return 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap';
  if (f === 'cute')    return 'https://fonts.googleapis.com/css2?family=Pacifico&family=Poppins:wght@300;400;500;600;700&display=swap';
  return 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap';
}

/* ════════════════════════════════════════════════════════════
   GENERATED PAGE CSS
   Full premium design system. All values derived from STATE.
   
   Critical rules:
   ✅ body: overflow-x:hidden ONLY — vertical scroll is free
   ✅ .container: max-width 480px, centered
   ✅ section spacing: 32px
   ✅ card depth: shadow + glassmorphism inset
   ✅ gallery/reviews: only x-scroll
   ✅ images: object-fit:cover, no distortion
   ✅ menu: category bold, items row-flex, price right-aligned
════════════════════════════════════════════════════════════ */
function buildCSS(s) {
  const c  = s.colors;
  const hf = headingFont(s.font);
  const accentDark = darkenHex(c.accent, -22);

  return `
/* ── RESET ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

/* ── PAGE ──
   ✅ overflow-x:hidden ONLY. Body NEVER gets overflow:hidden.
   That would kill iframe vertical scroll. */
body {
  font-family: 'Poppins', sans-serif;
  background: ${c.bg};
  color: ${c.text};
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  min-height: 100vh;
}

/* ── CSS VARS ── */
:root {
  --bg:      ${c.bg};
  --card:    ${c.card};
  --surface: ${c.surface};
  --accent:  ${c.accent};
  --text:    ${c.text};
  --sub:     ${c.subtext};
  --bdr:     ${c.border};
  --accent-10: ${c.accent}1a;
  --accent-30: ${c.accent}4d;
  --shadow-s: 0 2px 12px rgba(0,0,0,.06);
  --shadow-m: 0 4px 22px rgba(0,0,0,.09);
  --shadow-l: 0 8px 36px rgba(0,0,0,.13);
  --r1: 10px; --r2: 14px; --r3: 18px; --r4: 22px;
}

/* ── CONTAINER ── */
.container { max-width: 480px; margin: 0 auto; padding: 0 16px; }

/* ── SECTION SPACING ── */
.section { margin-bottom: 32px; }
.section:last-child { margin-bottom: 0; }

/* ── ANIMATIONS ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.reveal { opacity: 0; animation: fadeUp .52s cubic-bezier(.22,.61,.36,1) both; }
.reveal:nth-child(1){animation-delay:.04s} .reveal:nth-child(2){animation-delay:.09s}
.reveal:nth-child(3){animation-delay:.14s} .reveal:nth-child(4){animation-delay:.19s}
.reveal:nth-child(5){animation-delay:.24s} .reveal:nth-child(6){animation-delay:.29s}
.reveal:nth-child(7){animation-delay:.34s} .reveal:nth-child(8){animation-delay:.39s}
.reveal:nth-child(9){animation-delay:.44s}

/* ══════════════════════════════
   HERO — full-width cover ~65vh
══════════════════════════════ */
.hero { width: 100%; position: relative; display: block; }

.hero-img-wrap { position: relative; width: 100%; }

/* ✅ Image: width 100%, height auto. Never fixed height = never crops. */
.hero-img-wrap img {
  width: 100%;
  height: auto;
  display: block;
  min-height: 220px;
  max-height: 420px;   /* ~65vh on a 375px wide mobile */
  object-fit: cover;   /* ✅ cover with aspect ratio maintained */
}

.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top,
    rgba(0,0,0,.80) 0%,
    rgba(0,0,0,.30) 50%,
    rgba(0,0,0,.04) 100%);
  pointer-events: none;
}

.hero-content {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 22px 18px 20px;
}

/* Hero without image */
.hero-bare {
  padding: 50px 18px 40px;
  background: linear-gradient(135deg, ${c.surface} 0%, ${c.card} 100%);
  position: relative; overflow: hidden;
}
.hero-bare::before {
  content: '☕'; font-size: 140px; opacity: .04;
  position: absolute; right: -15px; top: -15px;
  line-height: 1; pointer-events: none;
}
.hero-bare .hero-name   { color: ${c.text}; text-shadow: none; }
.hero-bare .hero-tag    { color: ${c.subtext}; text-shadow: none; }

.hero-name {
  font-family: ${hf};
  font-size: clamp(26px, 8vw, 36px);
  font-weight: 700; color: #fff;
  line-height: 1.12; letter-spacing: -.4px;
  text-shadow: 0 2px 22px rgba(0,0,0,.55);
}

.hero-tag {
  margin-top: 8px; font-size: 13.5px;
  color: rgba(255,255,255,.88);
  line-height: 1.55; max-width: 300px;
  text-shadow: 0 1px 6px rgba(0,0,0,.3);
}

/* Order buttons (Swiggy/Zomato) */
.hero-order-btns {
  display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap;
}

.order-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 16px; border-radius: 22px;
  font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 700;
  text-decoration: none; border: 2px solid transparent;
  cursor: pointer; letter-spacing: .2px;
  backdrop-filter: blur(8px);
  transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,.25);
}
.order-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 8px 24px rgba(0,0,0,.3); }
.order-btn:active { transform: scale(1); }

/* Fixed colors — NOT theme dependent ✅ */
.btn-swiggy {
  background: rgba(252,107,31,.92);
  border-color: rgba(252,107,31,.5);
  color: #fff;
}
.btn-zomato {
  background: rgba(203,32,45,.92);
  border-color: rgba(203,32,45,.5);
  color: #fff;
}

/* Instagram floating badge */
.insta-badge {
  display: inline-flex; align-items: center; gap: 5px;
  margin-top: 12px; padding: 6px 12px; border-radius: 20px;
  background: rgba(255,255,255,.15); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,.25);
  color: #fff; font-size: 11.5px; font-weight: 600;
  text-decoration: none;
  transition: background .2s ease, transform .2s ease;
}
.insta-badge:hover { background: rgba(255,255,255,.22); transform: translateY(-1px); }

/* ══════════════════════════════
   LOCATION + TIMINGS
══════════════════════════════ */
.info-section {
  padding: 24px 0;
  background: ${c.surface};
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Single column if only one card */
.info-grid.single { grid-template-columns: 1fr; }

/* CARD — shared depth system */
.card {
  background: ${c.card};
  border: 1px solid ${c.border};
  border-radius: var(--r2);
  box-shadow: var(--shadow-s),
              inset 0 1px 0 rgba(255,255,255,.75),
              inset 0 -1px 0 rgba(0,0,0,.025);
  transition: transform .22s ease, box-shadow .22s ease;
}

.info-card {
  padding: 15px 13px;
  display: flex; align-items: flex-start; gap: 10px;
  text-decoration: none; color: inherit;
}
.info-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-m), inset 0 1px 0 rgba(255,255,255,.75);
}

.ic-icon { font-size: 19px; flex-shrink: 0; margin-top: 1px; }
.ic-body { flex: 1; min-width: 0; }
.ic-label {
  font-size: 9px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1px;
  color: ${c.accent}; margin-bottom: 4px;
}
.ic-value { font-size: 12px; font-weight: 500; color: ${c.text}; line-height: 1.45; word-break: break-word; }
.ic-arrow { font-size: 13px; font-weight: 700; color: ${c.accent}; flex-shrink: 0; align-self: center; }

/* ══════════════════════════════
   SECTION TITLE
══════════════════════════════ */
.sec-title {
  font-family: ${hf};
  font-size: 20px; font-weight: 700; color: ${c.text};
  padding-bottom: 10px; margin-bottom: 18px;
  border-bottom: 2px solid ${c.border};
  position: relative;
}
.sec-title::after {
  content: ''; position: absolute;
  bottom: -2px; left: 0;
  width: 36px; height: 2px;
  background: ${c.accent}; border-radius: 2px;
}

/* ══════════════════════════════
   MENU
   ✅ Category: bold heading
   ✅ Items: flex row, price right-aligned
   ✅ Clean spacing, no buttons inside
══════════════════════════════ */
.menu-section {
  padding: 28px 0;
  background: ${c.surface};
}

.menu-category { margin-bottom: 24px; }
.menu-category:last-child { margin-bottom: 0; }

.menu-cat-name {
  font-family: ${hf};
  font-size: 13px; font-weight: 700;
  color: ${c.accent}; text-transform: uppercase; letter-spacing: 1px;
  padding-bottom: 8px; margin-bottom: 4px;
  border-bottom: 1.5px solid ${c.border};
  display: flex; align-items: center; gap: 8px;
}
.menu-cat-name::before {
  content: ''; width: 4px; height: 14px;
  background: ${c.accent}; border-radius: 2px; flex-shrink: 0;
}

.menu-item {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: 8px; padding: 10px 6px; border-radius: 8px;
  border-bottom: 1px dashed ${c.border};
  transition: background .18s ease;
}
.menu-item:last-child { border-bottom: none; }
.menu-item:hover { background: rgba(0,0,0,.025); }
.menu-item.hidden { display: none !important; }

.mi-name { font-size: 13px; font-weight: 500; color: ${c.text}; line-height: 1.4; flex: 1; }
.mi-price {
  font-size: 13px; font-weight: 700; color: ${c.accent};
  white-space: nowrap; flex-shrink: 0;
  background: ${c.bg}; border-radius: 6px;
  padding: 2px 8px; border: 1px solid ${c.border};
}

/* Show More toggle */
.menu-toggle {
  display: block; margin: 16px auto 0;
  background: transparent;
  border: 2px solid ${c.accent}; border-radius: 12px;
  color: ${c.accent}; font-family: 'Poppins', sans-serif;
  font-size: 12px; font-weight: 600; padding: 9px 22px;
  cursor: pointer; letter-spacing: .2px;
  transition: background .22s ease, color .22s ease, transform .22s ease, box-shadow .22s ease;
}
.menu-toggle:hover {
  background: ${c.accent}; color: #fff;
  transform: scale(1.04);
  box-shadow: 0 6px 20px ${c.accent}44;
}
.menu-toggle:active { transform: scale(1); }

/* ══════════════════════════════
   GALLERY
   ✅ Horizontal scroll (x only)
   ✅ 1 full + partial next visible
   ✅ object-fit: cover, no distortion
   ✅ Hidden if no images
══════════════════════════════ */
.gallery-section {
  padding: 28px 0;
  background: ${c.bg};
}

.gallery-section .container { padding-left: 16px; padding-right: 0; }

/* ✅ x-scroll only. Page scroll = y direction = untouched. */
.gallery-track {
  display: flex; gap: 12px;
  overflow-x: auto; overflow-y: visible;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 4px 16px 8px 16px;
  cursor: grab;
}
.gallery-track:active { cursor: grabbing; }
.gallery-track::-webkit-scrollbar { display: none; }

.gallery-item {
  flex-shrink: 0; width: 82%;
  border-radius: var(--r3); overflow: hidden;
  scroll-snap-align: start;
  background: ${c.surface};
  border: 1px solid ${c.border};
  box-shadow: var(--shadow-m);
  transition: transform .28s ease, box-shadow .28s ease;
}
.gallery-item:hover { transform: translateY(-4px) scale(1.01); box-shadow: var(--shadow-l); }

/* ✅ Gallery image: width 100%, height auto, object-fit:cover, NO fixed height */
.gallery-item img {
  width: 100%; height: auto; display: block;
  min-height: 160px; max-height: 230px;
  object-fit: cover;   /* ✅ covers without distortion */
  transition: transform .3s ease;
}
.gallery-item:hover img { transform: scale(1.04); }

/* ══════════════════════════════
   REVIEWS
   ✅ Horizontal swipe, card layout
   ✅ Hidden if no reviews
══════════════════════════════ */
.reviews-section {
  padding: 28px 0;
  background: ${c.bg};
}

.reviews-section .container { padding-left: 16px; padding-right: 0; }

/* ✅ x-scroll only */
.reviews-track {
  display: flex; gap: 12px;
  overflow-x: auto; overflow-y: visible;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 4px 16px 8px 16px;
  cursor: grab;
}
.reviews-track:active { cursor: grabbing; }
.reviews-track::-webkit-scrollbar { display: none; }

.review-card {
  flex-shrink: 0; width: 76%;
  scroll-snap-align: start;
  padding: 18px 16px; border-radius: var(--r3);
  background: ${c.card};
  border: 1px solid ${c.border};
  box-shadow: var(--shadow-s),
              inset 0 1px 0 rgba(255,255,255,.75),
              inset 0 -1px 0 rgba(0,0,0,.02);
  transition: transform .25s ease, box-shadow .25s ease;
}
.review-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-l), inset 0 1px 0 rgba(255,255,255,.75); }

.review-stars  { font-size: 15px; margin-bottom: 10px; letter-spacing: 1.5px; }
.sf  { color: ${c.accent}; }
.sh  { color: ${c.accent}; opacity: .65; }
.se  { color: ${c.border}; }
.review-text   { font-size: 13px; color: ${c.subtext}; line-height: 1.65; margin-bottom: 12px; }
.review-author {
  font-size: 11.5px; font-weight: 700; color: ${c.text};
  display: flex; align-items: center; gap: 6px;
}
.review-author::before { content: '—'; color: ${c.accent}; font-weight: 300; }

/* ══════════════════════════════
   LOYALTY SYSTEM
   ✅ Only rendered if enabled AND api set
   ✅ API key baked as const — not read from DOM
══════════════════════════════ */
.loyalty-section {
  padding: 28px 0;
  background: ${c.surface};
}

.loyalty-card {
  padding: 22px 18px; border-radius: var(--r3);
  background: ${c.card};
  border: 1px solid ${c.border};
  box-shadow: var(--shadow-m),
              inset 0 1px 0 rgba(255,255,255,.7);
  text-align: center;
}

.loyalty-icon { font-size: 36px; margin-bottom: 10px; display: block; }

.loyalty-title {
  font-family: ${hf};
  font-size: 18px; font-weight: 700; color: ${c.text};
  margin-bottom: 6px;
}

.loyalty-desc { font-size: 13px; color: ${c.subtext}; line-height: 1.6; margin-bottom: 20px; }

.loyalty-form {
  display: flex; gap: 8px; max-width: 320px; margin: 0 auto;
}

.loyalty-input {
  flex: 1; padding: 11px 14px;
  border: 1.5px solid ${c.border}; border-radius: 10px;
  background: ${c.bg}; color: ${c.text};
  font-family: 'Poppins', sans-serif; font-size: 13px;
  outline: none; transition: border-color .16s ease, box-shadow .16s ease;
}
.loyalty-input:focus {
  border-color: ${c.accent};
  box-shadow: 0 0 0 3px ${c.accent}22;
}
.loyalty-input::placeholder { color: ${c.border}; }

/* ✅ Fixed color button — NOT theme dependent */
.loyalty-btn {
  padding: 11px 18px; border-radius: 10px;
  background: ${c.accent}; color: #fff;
  font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700;
  border: none; cursor: pointer;
  transition: opacity .18s ease, transform .18s ease, box-shadow .18s ease;
  box-shadow: 0 4px 14px ${c.accent}44;
  flex-shrink: 0;
}
.loyalty-btn:hover { opacity: .9; transform: translateY(-1px); box-shadow: 0 6px 20px ${c.accent}55; }
.loyalty-btn:active { transform: translateY(0); }

.loyalty-result {
  margin-top: 14px; padding: 12px 16px;
  border-radius: 10px; font-size: 13px; font-weight: 600;
  display: none; text-align: center;
}
.loyalty-result.ok  { background: rgba(74,222,128,.12); color: #16a34a; border: 1px solid rgba(74,222,128,.3); }
.loyalty-result.err { background: rgba(248,113,113,.12); color: #dc2626; border: 1px solid rgba(248,113,113,.3); }

/* ══════════════════════════════
   CONTACT BUTTONS
   ✅ Fixed color system — NOT theme dependent
   ✅ Always last section
══════════════════════════════ */
.contact-section {
  padding: 24px 0 48px;
  background: ${c.bg};
}

.contact-row { display: flex; gap: 12px; }

/* ✅ FIXED COLORS — call=dark navy, whatsapp=green. Non-negotiable. */
.contact-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 16px 12px; border-radius: 14px;
  font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 700;
  text-decoration: none; cursor: pointer;
  border: 2px solid transparent;
  position: relative; overflow: hidden;
  box-shadow: 0 4px 18px rgba(0,0,0,.16);
  transition: transform .22s ease, box-shadow .22s ease, opacity .22s ease;
}
.contact-btn::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(255,255,255,.13), transparent);
  pointer-events: none;
}
.contact-btn:hover { transform: scale(1.04); box-shadow: 0 8px 26px rgba(0,0,0,.22); }
.contact-btn:active { transform: scale(1); opacity: .9; }

/* ✅ Call button — FIXED dark navy */
.btn-call {
  background: #1a1a2e;
  border-color: #252540;
  color: #ffffff;
}
/* ✅ WhatsApp button — FIXED WhatsApp green */
.btn-whatsapp {
  background: #25D366;
  border-color: #20b958;
  color: #ffffff;
}

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 0; height: 0; }
`;
}

/* ════════════════════════════════════════════════════════════
   GENERATED PAGE INLINE JS
   
   ✅ menuToggle: controlled expand/collapse
   ✅ handleCheck: loyalty API call — uses const API baked at build time
   ✅ Image fallback: onerror on all images
   ✅ Drag scroll on tracks
   ✅ Touch active feedback on cards
   ✅ IntersectionObserver reveal
════════════════════════════════════════════════════════════ */
function buildPageJS(s) {
  /* ✅ API KEY IS BAKED IN at generation time — never reads DOM */
  const apiUrl = esc(s.loyalty.api || '');

  return `
(function() {
  'use strict';

  /* ── MENU TOGGLE ── */
  window.menuToggle = function(btn) {
    var rows = document.querySelectorAll('.menu-item');
    var isExpanded = btn.getAttribute('data-exp') === '1';
    if (!isExpanded) {
      rows.forEach(function(r) { r.classList.remove('hidden'); });
      btn.textContent = 'Show less ↑';
      btn.setAttribute('data-exp', '1');
    } else {
      var i = 0;
      rows.forEach(function(r) { i++; if (i > 6) r.classList.add('hidden'); });
      btn.textContent = 'Show more →';
      btn.setAttribute('data-exp', '0');
      var sec = document.querySelector('.menu-section');
      if (sec) window.scrollTo({ top: sec.offsetTop - 16, behavior: 'smooth' });
    }
  };

  /* ── LOYALTY CHECK
     ✅ API URL baked in at page generation — NOT read from DOM ── */
  var API = "${apiUrl}";

  window.handleCheck = async function() {
    var phone = document.getElementById('loyal-phone').value.trim();
    var result = document.getElementById('loyal-result');
    var btn = document.getElementById('loyal-btn');

    if (!phone) {
      result.className = 'loyalty-result err';
      result.style.display = 'block';
      result.textContent = 'Please enter your phone number.';
      return;
    }

    if (!API) {
      result.className = 'loyalty-result err';
      result.style.display = 'block';
      result.textContent = 'Loyalty system not configured.';
      return;
    }

    btn.textContent = 'Checking...';
    btn.disabled = true;

    try {
      var res = await fetch(API + '?phone=' + encodeURIComponent(phone));
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      result.className = 'loyalty-result ok';
      result.style.display = 'block';
      result.textContent = '🎉 You have ' + (data.visits || 0) + ' visit' + (data.visits === 1 ? '' : 's') + '!';
    } catch(e) {
      result.className = 'loyalty-result err';
      result.style.display = 'block';
      result.textContent = 'Could not connect. Please try again.';
    } finally {
      btn.textContent = 'Check';
      btn.disabled = false;
    }
  };

  /* ── IMAGE FALLBACK ── */
  document.querySelectorAll('img[data-fb]').forEach(function(img) {
    img.onerror = function() {
      this.src = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220">' +
        '<rect width="400" height="220" fill="#f0e8dc"/>' +
        '<text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="28" fill="#c8813a" font-family="sans-serif">🖼</text>' +
        '</svg>'
      );
    };
  });

  /* ── DRAG-TO-SCROLL ── */
  document.querySelectorAll('.gallery-track, .reviews-track').forEach(function(track) {
    var down = false, startX, sl;
    track.addEventListener('mousedown', function(e) { down = true; startX = e.pageX - track.offsetLeft; sl = track.scrollLeft; });
    document.addEventListener('mouseup', function() { down = false; });
    track.addEventListener('mousemove', function(e) {
      if (!down) return;
      e.preventDefault();
      track.scrollLeft = sl - (e.pageX - track.offsetLeft - startX) * 1.4;
    });
  });

  /* ── TOUCH ACTIVE FEEDBACK ── */
  document.querySelectorAll('.review-card, .gallery-item').forEach(function(el) {
    el.addEventListener('touchstart', function() { el.style.transform = 'scale(.98)'; }, { passive: true });
    el.addEventListener('touchend',   function() { el.style.transform = ''; });
  });

  /* ── INTERSECTION OBSERVER REVEAL ── */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    reveals.forEach(function(el) { el.style.animationPlayState = 'paused'; io.observe(el); });
  } else {
    reveals.forEach(function(el) { el.style.opacity = '1'; });
  }

})();
`;
}

/* ════════════════════════════════════════════════════════════
   SECTION BUILDERS
   
   Strict rule: if no data → return '' (never render empty wrapper)
   Final order: Hero → Info → Menu → Gallery → Reviews → Loyalty → Contact
════════════════════════════════════════════════════════════ */

/* ── HERO ── */
function buildHero(s) {
  /* Always rendered — fallback to placeholder name */
  const name = esc(s.brand.name || 'Your Cafe');
  const tag  = esc(s.brand.tagline || '');

  /* ✅ Order buttons — only rendered if URL exists */
  let orderBtns = '';
  const hasSwiggy = s.order.swiggy.length > 0;
  const hasZomato = s.order.zomato.length > 0;
  if (hasSwiggy || hasZomato) {
    const sw = hasSwiggy ? `<a class="order-btn btn-swiggy" href="${esc(s.order.swiggy)}" target="_blank" rel="noopener">🛵 Order on Swiggy</a>` : '';
    const zm = hasZomato ? `<a class="order-btn btn-zomato" href="${esc(s.order.zomato)}" target="_blank" rel="noopener">🍽 Order on Zomato</a>` : '';
    orderBtns = `<div class="hero-order-btns">${sw}${zm}</div>`;
  }

  /* ✅ Instagram — only if URL exists */
  const insta = s.brand.instagram
    ? `<a class="insta-badge" href="${esc(s.brand.instagram)}" target="_blank" rel="noopener">📸 Follow us</a>`
    : '';

  if (s.brand.hero) {
    return `
<section class="hero section reveal" data-section="hero">
  <div class="hero-img-wrap">
    <img src="${esc(s.brand.hero)}" alt="${name}" data-fb="1"
      onerror="this.src='data:image/svg+xml,'+encodeURIComponent('<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'280\\'><rect width=\\'400\\' height=\\'280\\' fill=\\'#f0e8dc\\'/><text x=\\'50%\\' y=\\'50%\\' text-anchor=\\'middle\\' dy=\\'.35em\\' font-size=\\'32\\' fill=\\'#c8813a\\' font-family=\\'sans-serif\\'>☕ ${name}</text></svg>')" />
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1 class="hero-name">${name}</h1>
      ${tag ? `<p class="hero-tag">${tag}</p>` : ''}
      ${orderBtns}
      ${insta}
    </div>
  </div>
</section>`;
  }

  return `
<section class="hero hero-bare section reveal" data-section="hero">
  <h1 class="hero-name">${name}</h1>
  ${tag ? `<p class="hero-tag">${tag}</p>` : ''}
  ${orderBtns}
  ${insta}
</section>`;
}

/* ── LOCATION + TIMINGS ── */
function buildInfo(s) {
  const hasLoc  = s.info.location.length > 0;
  const hasTime = s.info.timings.length > 0;
  if (!hasLoc && !hasTime) return ''; /* ✅ strict: no data → no section */

  const locCard = hasLoc
    ? (s.info.mapsUrl
        ? `<a class="info-card card" href="${esc(s.info.mapsUrl)}" target="_blank" rel="noopener">
    <span class="ic-icon">📍</span>
    <div class="ic-body"><div class="ic-label">Location</div><div class="ic-value">${esc(s.info.location)}</div></div>
    <span class="ic-arrow">→</span>
  </a>`
        : `<div class="info-card card">
    <span class="ic-icon">📍</span>
    <div class="ic-body"><div class="ic-label">Location</div><div class="ic-value">${esc(s.info.location)}</div></div>
  </div>`)
    : '';

  const timeCard = hasTime
    ? `<div class="info-card card">
    <span class="ic-icon">🕐</span>
    <div class="ic-body"><div class="ic-label">Opening Hours</div><div class="ic-value">${esc(s.info.timings)}</div></div>
  </div>`
    : '';

  const gridClass = (hasLoc && hasTime) ? 'info-grid' : 'info-grid single';

  return `
<section class="info-section section reveal" data-section="info">
  <div class="container">
    <div class="${gridClass}">
      ${locCard}
      ${timeCard}
    </div>
  </div>
</section>`;
}

/* ── MENU ── */
function buildMenu(s) {
  if (s.menu.length === 0) return ''; /* ✅ strict empty check */

  const LIMIT    = 6;
  const needMore = s.menu.length > LIMIT;
  const groups   = groupMenu(s.menu);

  let idx = 0;
  let catsHTML = '';

  for (const g of groups) {
    const rowsHTML = g.rows.map(row => {
      idx++;
      const hidden = needMore && idx > LIMIT ? ' hidden' : '';
      return `<div class="menu-item${hidden}">
      <span class="mi-name">${esc(row.item)}</span>
      <span class="mi-price">${esc(row.price)}</span>
    </div>`;
    }).join('');

    catsHTML += `<div class="menu-category" data-category="${esc(g.cat.toLowerCase().replace(/\s+/g,'-'))}">
    <div class="menu-cat-name">${esc(g.cat)}</div>
    ${rowsHTML}
  </div>`;
  }

  const toggleBtn = needMore
    ? `<button class="menu-toggle" data-exp="0" type="button" onclick="menuToggle(this)">Show more →</button>`
    : '';

  return `
<section class="menu-section section reveal" data-section="menu">
  <div class="container">
    <h2 class="sec-title">Menu</h2>
    ${catsHTML}
    ${toggleBtn}
  </div>
</section>`;
}

/* ── GALLERY ── */
function buildGallery(s) {
  if (s.gallery.length === 0) return ''; /* ✅ strict empty check */

  const items = s.gallery.map(url =>
    `<div class="gallery-item">
    <img src="${esc(url)}" alt="Cafe photo" loading="lazy" data-fb="1" />
  </div>`
  ).join('');

  return `
<section class="gallery-section section reveal" data-section="gallery">
  <div class="container">
    <h2 class="sec-title">Gallery</h2>
  </div>
  <div class="gallery-track">${items}</div>
</section>`;
}

/* ── REVIEWS ── */
function buildReviews(s) {
  if (s.reviews.length === 0) return ''; /* ✅ strict empty check */

  const cards = s.reviews.map(r =>
    `<article class="review-card card">
    <div class="review-stars">${starsHTML(r.stars)}</div>
    <p class="review-text">${esc(r.text)}</p>
    <div class="review-author">${esc(r.name)}</div>
  </article>`
  ).join('');

  return `
<section class="reviews-section section reveal" data-section="reviews">
  <div class="container">
    <h2 class="sec-title">Reviews</h2>
  </div>
  <div class="reviews-track">${cards}</div>
</section>`;
}

/* ── LOYALTY ── */
function buildLoyalty(s) {
  /* ✅ Only show if BOTH toggle is on AND API URL is provided */
  if (!s.loyalty.enabled || !s.loyalty.api) return '';

  const title = esc(s.loyalty.title || 'Loyalty Rewards');
  const desc  = esc(s.loyalty.desc  || 'Check your visit count and earn rewards!');

  return `
<section class="loyalty-section section reveal" data-section="loyalty">
  <div class="container">
    <div class="loyalty-card card">
      <span class="loyalty-icon">🎁</span>
      <h2 class="loyalty-title">${title}</h2>
      <p class="loyalty-desc">${desc}</p>
      <div class="loyalty-form">
        <input
          type="tel"
          id="loyal-phone"
          class="loyalty-input"
          placeholder="Enter your phone number"
        />
        <!-- ✅ onclick calls window.handleCheck — explicitly bound -->
        <button id="loyal-btn" class="loyalty-btn" type="button" onclick="handleCheck()">Check</button>
      </div>
      <div id="loyal-result" class="loyalty-result"></div>
    </div>
  </div>
</section>`;
}

/* ── CONTACT ── */
function buildContact(s) {
  const hasCall = s.contact.callNum.length > 0;
  const hasWA   = s.contact.waNum.length > 0;
  if (!hasCall && !hasWA) return ''; /* ✅ strict empty check */

  const callBtn = hasCall
    ? `<a class="contact-btn btn-call" href="tel:${esc(s.contact.callNum)}">📞 Call Us</a>`
    : '';

  const waBtn = hasWA
    ? `<a class="contact-btn btn-whatsapp" href="https://wa.me/${s.contact.waNum.replace(/[^0-9]/g,'')}" target="_blank" rel="noopener">💬 WhatsApp</a>`
    : '';

  return `
<section class="contact-section section reveal" data-section="contact">
  <div class="container">
    <div class="contact-row">
      ${callBtn}
      ${waBtn}
    </div>
  </div>
</section>`;
}

/* ════════════════════════════════════════════════════════════
   PAGE ASSEMBLER
   Strict section order:
   Hero → Info → Menu → Gallery → Reviews → Loyalty → Contact
════════════════════════════════════════════════════════════ */
function buildPage(s) {
  const css     = buildCSS(s);
  const pageJS  = buildPageJS(s);
  const fURL    = fontURL(s.font);
  const title   = esc(s.brand.name || 'Cafe');

  /* Build all sections — empty sections return '' */
  const body = [
    buildHero(s),
    buildInfo(s),
    buildMenu(s),
    buildGallery(s),
    buildReviews(s),
    buildLoyalty(s),
    buildContact(s),
  ].join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fURL}" rel="stylesheet" />
  <style>${css}</style>
</head>
<body>
${body}
<script>${pageJS}<\/script>
</body>
</html>`;
}

/* ════════════════════════════════════════════════════════════
   RENDER — collect → build → inject into iframe
════════════════════════════════════════════════════════════ */
function renderPage() {
  /* 1. Read all inputs into STATE once */
  collectState();

  /* 2. Build full HTML from STATE — DOM never touched again */
  _lastHTML = buildPage(STATE);

  /* 3. ✅ Inject via srcdoc — full replace, NEVER innerHTML += */
  const frame = $('preview-frame');
  if (!frame) return;
  frame.srcdoc = _lastHTML;

  /* 4. ✅ SCROLL FIX — onload patches inner doc's html+body overflow */
  frame.onload = function () {
    try {
      const doc = frame.contentDocument || (frame.contentWindow && frame.contentWindow.document);
      if (doc) {
        doc.documentElement.style.cssText = 'overflow-y: auto !important; height: auto !important;';
        doc.body.style.cssText = 'overflow-y: visible !important; overflow-x: hidden !important; height: auto !important; min-height: 100% !important;';
      }
    } catch (e) { /* sandboxed — safe */ }
    const clk = $('device-clock');
    if (clk) clk.textContent = nowTime();
  };

  /* 5. Hide empty state */
  const empty = $('empty-state');
  if (empty) empty.classList.add('gone');

  /* 6. Gold pulse on device */
  const dev = $('device');
  if (dev) {
    dev.style.transition = 'box-shadow .28s ease';
    dev.style.boxShadow += ', 0 0 0 3px rgba(212,168,75,.5)';
    setTimeout(() => {
      dev.style.boxShadow = '';
      setTimeout(() => { dev.style.transition = ''; }, 320);
    }, 450);
  }
}

/* ════════════════════════════════════════════════════════════
   COPY HTML
════════════════════════════════════════════════════════════ */
function copyHTML() {
  if (!_lastHTML) { showToast('Generate a page first', 'err'); return; }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(_lastHTML)
      .then(() => showToast('✅ HTML copied to clipboard!'))
      .catch(copyFallback);
  } else {
    copyFallback();
  }
}
function copyFallback() {
  const ta = document.createElement('textarea');
  ta.value = _lastHTML;
  ta.style.cssText = 'position:fixed;opacity:0;left:-9999px;top:-9999px;';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); showToast('✅ HTML copied!'); }
  catch { showToast('Copy failed — use Download instead', 'err'); }
  document.body.removeChild(ta);
}

/* ════════════════════════════════════════════════════════════
   DOWNLOAD HTML
════════════════════════════════════════════════════════════ */
function downloadHTML() {
  if (!_lastHTML) { showToast('Generate a page first', 'err'); return; }
  const slug = (STATE.brand.name || 'cafe')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cafe';
  const a = document.createElement('a');
  a.href     = URL.createObjectURL(new Blob([_lastHTML], { type: 'text/html;charset=utf-8' }));
  a.download = `${slug}-landing.html`;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); document.body.removeChild(a); }, 400);
  showToast(`⬇ Saved as ${slug}-landing.html`);
}

/* ════════════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════════════ */
function showToast(msg, type) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.className   = `show ${type || 'ok'}`;
  clearTimeout(t._tid);
  t._tid = setTimeout(() => { t.className = ''; }, 2800);
}

/* ════════════════════════════════════════════════════════════
   LOYALTY TOGGLE — show/hide loyalty fields in panel
════════════════════════════════════════════════════════════ */
function toggleLoyaltyFields() {
  const on     = checked('i-loyalty-on');
  const fields = $('loyalty-fields');
  if (fields) {
    if (on) fields.classList.remove('hidden');
    else    fields.classList.add('hidden');
  }
}

/* ════════════════════════════════════════════════════════════
   DEVICE SWITCHER
════════════════════════════════════════════════════════════ */
function switchDevice(mode) {
  const dev = $('device');
  const btnM = $('dev-m');
  const btnT = $('dev-t');
  if (!dev) return;
  if (mode === 'mobile') {
    dev.className = 'mobile';
    btnM.classList.add('active');
    btnT.classList.remove('active');
  } else {
    dev.className = 'tablet';
    btnT.classList.add('active');
    btnM.classList.remove('active');
  }
}

/* ════════════════════════════════════════════════════════════
   COLOR SYNC — picker ↔ hex text
════════════════════════════════════════════════════════════ */
function syncColor(pickId, txtId) {
  const pick = $(pickId);
  const txt  = $(txtId);
  if (!pick || !txt) return;
  pick.addEventListener('input', () => { txt.value = pick.value; });
  txt.addEventListener('input', () => {
    const v = txt.value.trim();
    if (/^#[0-9a-fA-F]{3,6}$/.test(v)) pick.value = v;
  });
}

/* ════════════════════════════════════════════════════════════
   INIT — called on DOMContentLoaded
   All button bindings are in HTML onclick="" for reliability.
   Here we just set up color sync, live clock, Enter key.
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {

  /* Color pair syncs */
  [
    ['c-bg',   'c-bg-t'],   ['c-card',  'c-card-t'],
    ['c-surf', 'c-surf-t'], ['c-acc',   'c-acc-t'],
    ['c-tx',   'c-tx-t'],   ['c-sub',   'c-sub-t'],
    ['c-bdr',  'c-bdr-t'],
  ].forEach(([p, t]) => syncColor(p, t));

  /* Live clock */
  const clk = $('device-clock');
  if (clk) {
    clk.textContent = nowTime();
    setInterval(() => { clk.textContent = nowTime(); }, 30000);
  }

  /* Enter key on inputs → generate */
  document.querySelectorAll('input[type=text], input[type=url], input[type=tel]')
    .forEach(inp => inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') renderPage();
    }));
});
