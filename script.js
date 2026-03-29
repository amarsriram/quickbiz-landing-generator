/* ══════════════════════════════════════════════════
   QUICKBIZ V5 — GENERATOR LOGIC
   script.js
══════════════════════════════════════════════════ */

'use strict';

// ── State ──────────────────────────────────────────
const state = {
  theme:   'beige',
  font:    'poppins',
  texture: 'plain',
};

// ── DEMO DATA (default preview) ────────────────────
const DEMO = {
  name:    'Bloom & Brew',
  desc:    'A cozy corner for specialty coffee, warm pastries & good vibes. Crafted with love, served with soul.',
  phone:   '+919876543210',
  map:     'https://maps.google.com',
  timing:  'Mon–Sat: 8 AM – 9 PM  |  Sun: 10 AM – 6 PM',
  heroImg: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
  gallery: [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80',
  ],
  menu: `Coffee
Espresso - ₹120
Cappuccino - ₹150
Cold Brew - ₹180
Matcha Latte - ₹200

Food
Croissant - ₹90
Avocado Toast - ₹220
Banana Bread - ₹110
Acai Bowl - ₹280`,
  reviews: `Priya S | 5 | Best cappuccino in town. The ambiance is absolutely dreamy!
Rohan M | 5 | Came for the cold brew, stayed for the vibes. 10/10 would return.
Anya K | 4 | Lovely pastries, great music. Such a peaceful spot to work from.
Dev P | 5 | Honestly one of the best cafes I have been to. The avocado toast is elite.
Meera T | 5 | Hidden gem! Staff is warm and the coffee is perfection.`,
};

// ── THEME CONFIG ───────────────────────────────────
const THEMES = {
  beige: {
    bg:      '#f5f0e8',
    surface: '#ede7d9',
    card:    '#faf6ef',
    text:    '#2c2416',
    muted:   '#7a6a52',
    border:  '#e0d5c0',
    badge:   '#d9c49a',
  },
  peach: {
    bg:      '#fdf0ea',
    surface: '#fae5d8',
    card:    '#fff8f5',
    text:    '#3b1f14',
    muted:   '#9a6654',
    border:  '#f0d5c8',
    badge:   '#f0b49a',
  },
  mint: {
    bg:      '#eaf5f0',
    surface: '#d8eee5',
    card:    '#f5fbf8',
    text:    '#142b22',
    muted:   '#4a7a65',
    border:  '#c5e2d5',
    badge:   '#9ad4ba',
  },
  white: {
    bg:      '#ffffff',
    surface: '#f6f6f6',
    card:    '#ffffff',
    text:    '#1a1a1a',
    muted:   '#6b6b6b',
    border:  '#e5e5e5',
    badge:   '#d4d4d4',
  },
  dark: {
    bg:      '#0f0e0d',
    surface: '#1a1916',
    card:    '#211f1c',
    text:    '#ede8e0',
    muted:   '#9a9085',
    border:  '#2e2b26',
    badge:   '#3a3630',
  },
};

// ── FONT CONFIG ────────────────────────────────────
const FONTS = {
  poppins:  { heading: "'Poppins', sans-serif",       body: "'Poppins', sans-serif",     weight: 600 },
  playfair: { heading: "'Playfair Display', serif",   body: "'Poppins', sans-serif",     weight: 700 },
  nunito:   { heading: "'Nunito', sans-serif",        body: "'Nunito', sans-serif",      weight: 700 },
  inter:    { heading: "'Inter', sans-serif",         body: "'Inter', sans-serif",       weight: 600 },
  dmsans:   { heading: "'DM Sans', sans-serif",       body: "'DM Sans', sans-serif",     weight: 600 },
};

// ── TEXTURE CSS ────────────────────────────────────
const TEXTURES = {
  plain: '',
  grain: `
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9999;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      opacity: 0.045;
    }`,
  soft: `
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background: radial-gradient(ellipse 80% 60% at 20% 10%, rgba(255,255,255,0.04) 0%, transparent 70%),
                  radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,0,0,0.03) 0%, transparent 60%);
    }`,
};

// ── PARSE MENU ─────────────────────────────────────
function parseMenu(raw) {
  if (!raw || !raw.trim()) return null;
  const lines = raw.trim().split('\n');
  const categories = [];
  let current = null;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const dashIdx = trimmed.lastIndexOf(' - ');
    if (dashIdx !== -1) {
      const name  = trimmed.slice(0, dashIdx).trim();
      const price = trimmed.slice(dashIdx + 3).trim();
      if (current) current.items.push({ name, price });
    } else {
      current = { cat: trimmed, items: [] };
      categories.push(current);
    }
  });

  return categories.filter(c => c.items.length > 0);
}

// ── PARSE REVIEWS ──────────────────────────────────
function parseReviews(raw) {
  if (!raw || !raw.trim()) return [];
  return raw.trim().split('\n').map(line => {
    const parts = line.split('|').map(p => p.trim());
    return {
      name:  parts[0] || 'Guest',
      stars: Math.min(5, Math.max(1, parseInt(parts[1]) || 5)),
      text:  parts[2] || '',
    };
  }).filter(r => r.text).slice(0, 5);
}

// ── PARSE GALLERY ──────────────────────────────────
function parseGallery(raw) {
  if (!raw || !raw.trim()) return [];
  return raw.trim().split('\n').map(l => l.trim()).filter(Boolean).slice(0, 6);
}

// ── STAR SVG ───────────────────────────────────────
function stars(n) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span style="color:${i < n ? '#f5a623' : '#d0c8b8'}">★</span>`
  ).join('');
}

// ── BUTTON STYLES (fixed, theme-independent) ───────
const BTN = {
  primary:  'display:block;width:100%;padding:14px 20px;border-radius:10px;border:none;background:linear-gradient(135deg,#2c2c2c,#1a1a1a);color:#fff;font-size:15px;font-weight:600;letter-spacing:0.2px;cursor:pointer;text-align:center;text-decoration:none;',
  call:     'flex:1;padding:13px 10px;border-radius:10px;border:none;background:#2c2c2c;color:#fff;font-size:14px;font-weight:600;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;',
  whatsapp: 'flex:1;padding:13px 10px;border-radius:10px;border:none;background:#25d366;color:#fff;font-size:14px;font-weight:600;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;',
};

// ── GENERATE HTML ──────────────────────────────────
function buildHTML(data, theme, font, texture) {
  const T = THEMES[theme]  || THEMES.beige;
  const F = FONTS[font]    || FONTS.poppins;
  const TX = TEXTURES[texture] || '';

  const cleanPhone = (data.phone || '').replace(/\D/g, '');
  const hasPhone   = cleanPhone.length >= 7;
  const hasMap     = !!(data.map || '').trim();
  const hasTiming  = !!(data.timing || '').trim();
  const menuParsed = parseMenu(data.menu);
  const reviews    = parseReviews(data.reviews);
  const gallery    = parseGallery(data.gallery);
  const hasGallery = gallery.length > 0;
  const hasReviews = reviews.length > 0;
  const hasMenu    = menuParsed && menuParsed.length > 0;

  /* ── Gallery HTML ── */
  const galleryHTML = !hasGallery ? '' : `
  <!-- Gallery -->
  <section style="padding:0 0 4px;">
    <h2 style="font-family:${F.heading};font-size:17px;font-weight:${F.weight};color:${T.text};padding:0 18px;margin-bottom:12px;">Our Space</h2>
    <div style="display:flex;gap:10px;overflow-x:auto;padding:0 18px 10px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;">
      ${gallery.map(url => `
      <div style="flex:0 0 220px;height:160px;border-radius:12px;overflow:hidden;scroll-snap-align:start;flex-shrink:0;">
        <img src="${url}" alt="Gallery" onerror="this.parentElement.remove()"
             style="width:100%;height:100%;object-fit:cover;display:block;" />
      </div>`).join('')}
    </div>
  </section>`;

  /* ── Reviews HTML ── */
  const reviewsHTML = !hasReviews ? '' : `
  <!-- Reviews -->
  <section style="padding:0 0 4px;">
    <h2 style="font-family:${F.heading};font-size:17px;font-weight:${F.weight};color:${T.text};padding:0 18px;margin-bottom:12px;">What Guests Say</h2>
    <div style="display:flex;gap:12px;overflow-x:auto;padding:0 18px 10px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;">
      ${reviews.map(r => `
      <div style="flex:0 0 85%;background:${T.card};border-radius:14px;padding:14px;border:1px solid ${T.border};scroll-snap-align:start;flex-shrink:0;">
        <div style="margin-bottom:6px;font-size:15px;">${stars(r.stars)}</div>
        <p style="font-family:${F.body};font-size:13.5px;color:${T.text};line-height:1.55;margin-bottom:8px;">"${r.text}"</p>
        <p style="font-family:${F.body};font-size:12px;color:${T.muted};font-weight:600;">— ${r.name}</p>
      </div>`).join('')}
    </div>
  </section>`;

  /* ── Menu HTML ── */
  const menuHTML = !hasMenu
    ? `<section style="padding:0 18px;">
        <h2 style="font-family:${F.heading};font-size:17px;font-weight:${F.weight};color:${T.text};margin-bottom:12px;">Menu</h2>
        <p style="font-family:${F.body};font-size:14px;color:${T.muted};">Menu coming soon. Visit us to explore!</p>
       </section>`
    : `<section style="padding:0 18px;">
        <h2 style="font-family:${F.heading};font-size:17px;font-weight:${F.weight};color:${T.text};margin-bottom:16px;">Menu</h2>
        ${menuParsed.map(cat => `
        <div style="margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <span style="font-family:${F.heading};font-size:13px;font-weight:700;color:${T.text};text-transform:uppercase;letter-spacing:1px;">${cat.cat}</span>
            <div style="flex:1;height:1px;background:${T.border};"></div>
          </div>
          <div style="background:${T.card};border-radius:14px;padding:4px 0;border:1px solid ${T.border};">
            ${cat.items.map((item, idx) => `
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:11px 14px;${idx < cat.items.length - 1 ? `border-bottom:1px solid ${T.border};` : ''}">
              <span style="font-family:${F.body};font-size:14px;color:${T.text};flex:1;line-height:1.4;">${item.name}</span>
              <span style="font-family:${F.body};font-size:14px;font-weight:600;color:${T.text};white-space:nowrap;flex-shrink:0;">${item.price}</span>
            </div>`).join('')}
          </div>
        </div>`).join('')}
       </section>`;

  /* ── Timings HTML ── */
  const timingsHTML = !hasTiming ? '' : `
  <section style="padding:0 18px;">
    <h2 style="font-family:${F.heading};font-size:17px;font-weight:${F.weight};color:${T.text};margin-bottom:12px;">Opening Hours</h2>
    <div style="background:${T.card};border-radius:14px;padding:14px 16px;border:1px solid ${T.border};display:flex;align-items:flex-start;gap:12px;">
      <span style="font-size:20px;flex-shrink:0;margin-top:1px;">🕐</span>
      <p style="font-family:${F.body};font-size:14px;color:${T.text};line-height:1.6;word-break:break-word;">${data.timing}</p>
    </div>
  </section>`;

  /* ── Map HTML ── */
  const mapHTML = !hasMap ? '' : `
  <section style="padding:0 18px;">
    <h2 style="font-family:${F.heading};font-size:17px;font-weight:${F.weight};color:${T.text};margin-bottom:12px;">Find Us</h2>
    <a href="${data.map}" target="_blank" rel="noopener"
       style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;background:${T.card};border:1px solid ${T.border};border-radius:14px;text-decoration:none;">
      <span style="font-size:20px;">📍</span>
      <span style="font-family:${F.body};font-size:14px;font-weight:600;color:${T.text};">Open in Google Maps</span>
      <span style="font-size:13px;color:${T.muted};">↗</span>
    </a>
  </section>`;

  /* ── CTA Card ── */
  const ctaCard = (label) => `
  <section style="padding:0 18px;">
    <div style="background:${T.card};border-radius:14px;padding:18px;border:1px solid ${T.border};text-align:center;">
      <p style="font-family:${F.body};font-size:13px;color:${T.muted};margin-bottom:12px;">${label}</p>
      ${hasPhone ? `<a href="tel:+${cleanPhone}" style="${BTN.primary}">Reserve a Table ☕</a>` : `<p style="font-family:${F.body};font-size:14px;color:${T.muted};">Visit us today!</p>`}
    </div>
  </section>`;

  /* ── Contact Buttons ── */
  const contactHTML = !hasPhone ? '' : `
  <div style="padding:0 18px 8px;display:flex;gap:10px;">
    <a href="tel:+${cleanPhone}" style="${BTN.call}">📞 Call Us</a>
    <a href="https://wa.me/${cleanPhone}" target="_blank" rel="noopener" style="${BTN.whatsapp}">💬 WhatsApp</a>
  </div>`;

  /* ── Full Page HTML ── */
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${data.name || 'Cafe'}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Nunito:wght@300;400;600;700&family=Inter:wght@300;400;500;600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{font-size:16px;-webkit-font-smoothing:antialiased;}
body{
  background:${T.bg};
  color:${T.text};
  font-family:${F.body};
  min-height:100vh;
  overflow-x:hidden;
  transition:background 0.3s ease,color 0.3s ease;
}
::-webkit-scrollbar{display:none;}
img{max-width:100%;height:auto;}
${TX}
</style>
</head>
<body>

<!-- HERO -->
<section style="position:relative;background:#000;margin-bottom:20px;">
  ${data.heroImg
    ? `<img src="${data.heroImg}" alt="${data.name}" onerror="this.style.display='none'"
           style="width:100%;height:auto;display:block;object-fit:cover;max-height:420px;min-height:240px;" />`
    : `<div style="height:280px;background:linear-gradient(135deg,${T.surface},${T.bg});display:flex;align-items:center;justify-content:center;font-size:48px;">☕</div>`}
  <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.08) 0%,rgba(0,0,0,0.55) 100%);pointer-events:none;"></div>
  <div style="position:absolute;bottom:0;left:0;right:0;padding:24px 20px 22px;">
    <h1 style="font-family:${F.heading};font-size:28px;font-weight:${F.weight};color:#fff;line-height:1.2;text-shadow:0 2px 12px rgba(0,0,0,0.4);">${data.name || 'Your Cafe'}</h1>
    ${data.desc ? `<p style="font-family:${F.body};font-size:13.5px;color:rgba(255,255,255,0.88);margin-top:6px;line-height:1.5;text-shadow:0 1px 6px rgba(0,0,0,0.3);">${data.desc}</p>` : ''}
  </div>
</section>

<!-- CTA TOP -->
${ctaCard('Perfect for work dates, weekend hangouts & everything in between.')}

<!-- SPACER -->
<div style="height:20px;"></div>

<!-- GALLERY -->
${galleryHTML}
${hasGallery ? '<div style="height:20px;"></div>' : ''}

<!-- REVIEWS -->
${reviewsHTML}
${hasReviews ? '<div style="height:20px;"></div>' : ''}

<!-- MENU -->
${menuHTML}

<div style="height:20px;"></div>

<!-- TIMINGS -->
${timingsHTML}
${hasTiming ? '<div style="height:20px;"></div>' : ''}

<!-- MAP -->
${mapHTML}
${hasMap ? '<div style="height:20px;"></div>' : ''}

<!-- CTA BOTTOM -->
${ctaCard('Come in, sit down, and let us take care of the rest.')}

<div style="height:16px;"></div>

<!-- CONTACT BUTTONS -->
${contactHTML}

<div style="height:32px;"></div>

<!-- FOOTER -->
<footer style="padding:16px 18px 20px;text-align:center;border-top:1px solid ${T.border};">
  <p style="font-family:${F.body};font-size:12px;color:${T.muted};">Made with ☕ · ${data.name || 'Cafe'}</p>
</footer>

</body>
</html>`;
}

// ── RENDER PREVIEW ─────────────────────────────────
function getFormData() {
  const val = id => document.getElementById(id)?.value || '';
  return {
    name:    val('cafeName'),
    desc:    val('cafeDesc'),
    phone:   val('cafePhone'),
    map:     val('cafeMap'),
    timing:  val('cafeTiming'),
    heroImg: val('heroImg'),
    gallery: val('galleryImgs'),
    menu:    val('cafeMenu'),
    reviews: val('cafeReviews'),
  };
}

function isFormEmpty(data) {
  return !data.name && !data.desc && !data.phone && !data.heroImg && !data.menu && !data.reviews;
}

function renderPreview(useDemo = false) {
  const raw  = getFormData();
  const data = useDemo || isFormEmpty(raw) ? DEMO : raw;

  const html = buildHTML(data, state.theme, state.font, state.texture);
  const frame = document.getElementById('previewFrame');

  frame.srcdoc = html;
}

// ── CHIP SELECTION ─────────────────────────────────
function bindChips(groupId, stateKey, callback) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state[stateKey] = chip.dataset.val;
      callback && callback();
    });
  });
}

// ── DEVICE PILLS ───────────────────────────────────
function bindDevicePills() {
  document.querySelectorAll('.device-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.device-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const w = parseInt(pill.dataset.width);
      const frame = document.getElementById('phoneFrame');
      if (frame) {
        frame.style.width = w + 'px';
        frame.style.borderRadius = w <= 420 ? '40px' : '24px';
      }
    });
  });
}

// ── COPY HTML ──────────────────────────────────────
function copyHTML() {
  const raw  = getFormData();
  const data = isFormEmpty(raw) ? DEMO : raw;
  const html = buildHTML(data, state.theme, state.font, state.texture);

  const feedback = document.getElementById('copyFeedback');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(html).then(() => {
      feedback.textContent = '✓ HTML copied to clipboard!';
      setTimeout(() => feedback.textContent = '', 3000);
    }).catch(() => fallbackCopy(html, feedback));
  } else {
    fallbackCopy(html, feedback);
  }
}

function fallbackCopy(text, feedback) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    feedback.textContent = '✓ HTML copied!';
  } catch (e) {
    feedback.textContent = '⚠ Copy failed — please copy manually.';
  }
  document.body.removeChild(ta);
  setTimeout(() => feedback.textContent = '', 3000);
}

// ── INIT ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Chip groups
  bindChips('themeChips',   'theme',   renderPreview);
  bindChips('fontChips',    'font',    renderPreview);
  bindChips('textureChips', 'texture', renderPreview);

  // Device pills
  bindDevicePills();

  // Generate button
  document.getElementById('generateBtn')?.addEventListener('click', () => renderPreview());

  // Copy button
  document.getElementById('copyBtn')?.addEventListener('click', copyHTML);

  // Live update on typing (debounced)
  let debounceTimer;
  const inputs = document.querySelectorAll('.field-input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => renderPreview(), 450);
    });
  });

  // Initial render with demo
  renderPreview(true);
});
