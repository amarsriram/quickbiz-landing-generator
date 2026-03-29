/* ══════════════════════════════
   QUICKBIZ V3 — script.js
══════════════════════════════ */

// ── THEME CONFIG ──────────────────────────────────────────
const THEMES = {
  beige: { bg: '#f8f1e9', text: '#222', accent: '#c76b3a', card: 'rgba(0,0,0,0.04)' },
  peach: { bg: '#fff1eb', text: '#222', accent: '#d97a5a', card: 'rgba(0,0,0,0.04)' },
  mint:  { bg: '#edf6f3', text: '#222', accent: '#3a9b7e', card: 'rgba(0,0,0,0.04)' },
  white: { bg: '#ffffff', text: '#222', accent: '#444',    card: 'rgba(0,0,0,0.04)' },
  black: { bg: '#1c1c1c', text: '#f5f5f5', accent: '#e8a87c', card: 'rgba(255,255,255,0.07)' },
};

// ── FONT CONFIG ───────────────────────────────────────────
const FONTS = {
  modern:  { family: "'Poppins', sans-serif",      url: 'Poppins:wght@400;600;700' },
  elegant: { family: "'Playfair Display', serif",  url: 'Playfair+Display:wght@400;600;700' },
  cute:    { family: "'Pacifico', cursive",         url: 'Pacifico' },
};

// ── STATE ─────────────────────────────────────────────────
let generatedHTML = '';

// ── HELPERS ───────────────────────────────────────────────

/** Show a brief toast notification */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

/** Get trimmed value from input by id */
function val(id) {
  return (document.getElementById(id)?.value || '').trim();
}

/** Escape text content for safe HTML insertion */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Get rgba channel string based on text color */
function rgbChannels(textColor) {
  return textColor === '#f5f5f5' ? '255,255,255' : '0,0,0';
}

// ── MENU PARSER ───────────────────────────────────────────

/**
 * Parses menu string into structured sections.
 * Input format: "Category: Item - Price, Item - Price; Category: ..."
 * Returns: [{ category, items: [{ name, price }] }]
 */
function parseMenu(raw) {
  if (!raw || !raw.trim()) return [];

  const sections = raw.split(';').map(s => s.trim()).filter(Boolean);

  return sections.map(sec => {
    const colonIdx = sec.indexOf(':');
    if (colonIdx === -1) return null;

    const category = sec.slice(0, colonIdx).trim();
    const itemsRaw = sec.slice(colonIdx + 1).trim();

    const items = itemsRaw
      .split(',')
      .map(i => i.trim())
      .filter(Boolean)
      .map(item => {
        const dashIdx = item.lastIndexOf('-');
        if (dashIdx === -1) return { name: item, price: '' };
        return {
          name:  item.slice(0, dashIdx).trim(),
          price: item.slice(dashIdx + 1).trim(),
        };
      });

    return { category, items };
  }).filter(Boolean);
}

// ── HTML BUILDERS ─────────────────────────────────────────

function buildCoverHTML(coverImg) {
  if (!coverImg) return '';
  return `<img class="gen-cover" src="${coverImg}" alt="Cover" onerror="this.style.display='none'" />`;
}

function buildGalleryHTML(galleryUrls) {
  if (!galleryUrls.length) return '';
  const imgs = galleryUrls
    .map(u => `<img class="gen-gallery-img" src="${u}" alt="" onerror="this.style.display='none'" />`)
    .join('');
  return `<div class="gen-gallery-wrap">${imgs}</div>`;
}

function buildTimingsHTML(timingLines, T) {
  if (!timingLines.length) return '';
  const ch = rgbChannels(T.text);
  const rows = timingLines
    .map(t => `<div class="gen-timing-line" style="border-bottom:1px solid rgba(${ch},.06)">${esc(t)}</div>`)
    .join('');
  return `
    <div class="gen-section" style="background:${T.card}">
      <div class="gen-section-title">⏰ Timings</div>
      ${rows}
    </div>`;
}

function buildMenuHTML(menuSections, T) {
  if (!menuSections.length) return '';
  const ch = rgbChannels(T.text);
  return menuSections.map(sec => {
    const items = sec.items.map(item => `
      <div class="gen-menu-item" style="border-bottom:1px solid rgba(${ch},.05)">
        <span>${esc(item.name)}</span>
        ${item.price ? `<span class="gen-menu-price" style="color:${T.accent}">${esc(item.price)}</span>` : ''}
      </div>`).join('');
    return `
      <div class="gen-menu-card" style="border:1.5px solid rgba(${ch},.1)">
        <div class="gen-menu-cat" style="background:${T.card}">${esc(sec.category)}</div>
        ${items}
      </div>`;
  }).join('');
}

function buildButtonsHTML(mapsLink, instaLink, T) {
  const ch = rgbChannels(T.text);
  const locationBtn = mapsLink
    ? `<a class="gen-btn gen-btn-location" href="${mapsLink}" target="_blank" style="background:${T.card};color:${T.text};border:1.5px solid rgba(${ch},.12)">📍 Get Directions</a>`
    : '';
  const instaBtn = instaLink
    ? `<a class="gen-btn gen-btn-insta" href="${instaLink}" target="_blank">📸 Follow on Instagram</a>`
    : '';
  const combined = [locationBtn, instaBtn].filter(Boolean).join('');
  return combined ? `<div class="gen-btns">${combined}</div>` : '';
}

function buildPageCSS(T, F) {
  const ch = rgbChannels(T.text);
  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${F.family}; background: ${T.bg}; color: ${T.text}; max-width: 420px; margin: 0 auto; min-height: 100vh; }
    .gen-cover { width: 100%; height: 220px; object-fit: cover; display: block; }
    .gen-gallery-wrap { display: flex; gap: 10px; overflow-x: auto; padding: 12px 16px; scrollbar-width: none; }
    .gen-gallery-wrap::-webkit-scrollbar { display: none; }
    .gen-gallery-img { width: 100px; height: 90px; object-fit: cover; border-radius: 10px; flex-shrink: 0; }
    .gen-info { padding: 20px 20px 0; }
    .gen-name { font-size: 26px; font-weight: 700; line-height: 1.2; margin-bottom: 8px; }
    .gen-desc { font-size: 13.5px; line-height: 1.65; opacity: .75; margin-bottom: 20px; }
    .gen-section { margin: 0 20px 20px; border-radius: 14px; padding: 16px; }
    .gen-section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; opacity: .6; }
    .gen-timing-line { font-size: 13px; padding: 4px 0; opacity: .85; }
    .gen-timing-line:last-child { border-bottom: none !important; }
    .gen-menu-card { margin: 0 20px 14px; border-radius: 14px; overflow: hidden; }
    .gen-menu-cat { padding: 10px 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .gen-menu-item { display: flex; justify-content: space-between; align-items: center; padding: 9px 14px; font-size: 13px; }
    .gen-menu-item:last-child { border-bottom: none !important; }
    .gen-menu-price { font-weight: 600; font-size: 12px; white-space: nowrap; margin-left: 8px; }
    .gen-btns { padding: 0 20px 8px; display: flex; flex-direction: column; gap: 10px; }
    .gen-btn { display: block; width: 100%; padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 600; text-align: center; text-decoration: none; border: none; cursor: pointer; font-family: inherit; }
    .gen-btn-insta { background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); color: #fff; }
    .gen-btn-call { background: #1f1f1f; color: #fff; }
    .gen-btn-wa { background: #25D366; color: #fff; }
    .gen-trust { text-align: center; font-size: 12px; opacity: .4; padding: 8px 20px 20px; letter-spacing: .3px; }
    .gen-cta { padding: 0 20px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 8px; }
  `;
}

// ── MAIN GENERATOR ────────────────────────────────────────

function generatePage() {
  const name  = val('cafeName');
  const phone = val('cafePhone');

  // Validation
  let hasErr = false;
  ['cafeName', 'cafePhone'].forEach(id => {
    document.getElementById(id).classList.remove('error-field');
  });

  if (!name) {
    document.getElementById('cafeName').classList.add('error-field');
    document.getElementById('cafeName').focus();
    showToast('⚠️ Cafe name is required');
    hasErr = true;
  }
  if (!phone) {
    document.getElementById('cafePhone').classList.add('error-field');
    if (!hasErr) document.getElementById('cafePhone').focus();
    showToast('⚠️ Phone number is required');
    hasErr = true;
  }
  if (hasErr) return;

  // Collect inputs
  const desc       = val('cafeDesc');
  const coverImg   = val('coverImg');
  const galleryRaw = val('galleryImgs');
  const timingsRaw = val('timings');
  const menuRaw    = val('menuInput');
  const mapsLink   = val('mapsLink');
  const instaLink  = val('instaLink');
  const theme      = val('themeSelect') || 'beige';
  const fontKey    = val('fontSelect')  || 'modern';

  const T = THEMES[theme] || THEMES.beige;
  const F = FONTS[fontKey] || FONTS.modern;

  const galleryUrls  = galleryRaw ? galleryRaw.split(',').map(u => u.trim()).filter(Boolean) : [];
  const timingLines  = timingsRaw ? timingsRaw.split(';').map(t => t.trim()).filter(Boolean) : [];
  const menuSections = parseMenu(menuRaw);

  const callPhone = phone.replace(/\s+/g, '');
  const waPhone   = callPhone.replace(/\D/g, '');

  // Assemble page HTML
  const pageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${esc(name)}</title>
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(F.url)}&display=swap" rel="stylesheet"/>
  <style>${buildPageCSS(T, F)}</style>
</head>
<body>

${buildCoverHTML(coverImg)}
${buildGalleryHTML(galleryUrls)}

<div class="gen-info">
  <div class="gen-name">${esc(name)}</div>
  ${desc ? `<div class="gen-desc">${esc(desc)}</div>` : ''}
</div>

${buildTimingsHTML(timingLines, T)}
${buildMenuHTML(menuSections, T)}
${buildButtonsHTML(mapsLink, instaLink, T)}

<div class="gen-trust">✨ Trusted by local customers</div>
<div class="gen-cta">
  <a class="gen-btn gen-btn-call" href="tel:${callPhone}">📞 Call for Orders</a>
  <a class="gen-btn gen-btn-wa" href="https://wa.me/${waPhone}">💬 Order on WhatsApp</a>
</div>
<div style="height:24px;"></div>

</body>
</html>`;

  generatedHTML = pageHTML;
  renderPreview(pageHTML);
  showToast('✅ Page generated!');
}

// ── PREVIEW RENDERER ──────────────────────────────────────

function renderPreview(pageHTML) {
  const panel = document.getElementById('previewPanel');
  document.getElementById('placeholder')?.remove();

  panel.innerHTML = `
    <div class="phone-frame">
      <div class="phone-notch"><div class="phone-notch-bar"></div></div>
      <div class="phone-screen" id="phoneScreen"></div>
    </div>`;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'width:420px;height:780px;border:none;display:block;';
  iframe.setAttribute('referrerpolicy', 'no-referrer');
  iframe.srcdoc = pageHTML;
  document.getElementById('phoneScreen').appendChild(iframe);
}

// ── COPY CODE ─────────────────────────────────────────────

function copyCode() {
  if (!generatedHTML) {
    showToast('⚠️ Generate a page first');
    return;
  }
  navigator.clipboard.writeText(generatedHTML)
    .then(() => showToast('✅ Code copied to clipboard!'))
    .catch(() => {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = generatedHTML;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('✅ Code copied!');
    });
}

// ── INIT ──────────────────────────────────────────────────

// Clear error state when user starts typing
['cafeName', 'cafePhone'].forEach(id => {
  document.getElementById(id).addEventListener('input', function () {
    this.classList.remove('error-field');
  });
});
