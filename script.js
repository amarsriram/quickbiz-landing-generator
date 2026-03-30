/* ═══════════════════════════════════════════════════════════
   QUICKBIZ V5.1 — SCRIPT.JS
   Bug-free engine: safe parsing, live preview, export
═══════════════════════════════════════════════════════════ */

"use strict";

/* ══════════════════════
   STATE
══════════════════════ */
let selectedTheme   = "theme-beige";
let selectedFont    = "font-modern";
let selectedTexture = "texture-plain";

/* ══════════════════════
   SAFE HELPERS
══════════════════════ */

/** Safely trim any value */
const safe = (val) => (val || "").trim();

/** Validate a URL string */
const isValidUrl = (url) => {
  try { new URL(url); return true; } catch { return false; }
};

/** Escape HTML to prevent XSS inside innerHTML */
const esc = (str) => {
  return safe(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/* ══════════════════════
   INPUT GETTERS
══════════════════════ */

const getVal = (id) => {
  const el = document.getElementById(id);
  return el ? safe(el.value) : "";
};

/* ══════════════════════
   PARSERS
══════════════════════ */

/**
 * Parse gallery: comma-separated URLs, max 6, valid only
 */
function parseGallery(raw) {
  return (safe(raw))
    .split(",")
    .map(i => i.trim())
    .filter(i => isValidUrl(i))
    .slice(0, 6);
}

/**
 * Parse reviews: "Name: Text" one per line, max 5
 */
function parseReviews(raw) {
  return (safe(raw))
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.includes(":"))
    .map(l => {
      const [name, ...rest] = l.split(":");
      return {
        name: safe(name),
        text: safe(rest.join(":"))
      };
    })
    .filter(r => r.name && r.text)
    .slice(0, 5);
}

/**
 * Parse menu: Category heading + Item - ₹Price lines,
 * blank line separates categories
 */
function parseMenu(raw) {
  const lines  = (safe(raw)).split("\n");
  const cats   = [];
  let currentCat = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      // blank line → end current category
      currentCat = null;
      continue;
    }

    if (line.includes(" - ")) {
      // It's a menu item
      const parts = line.split(" - ");
      const item  = safe(parts[0]);
      const price = safe(parts.slice(1).join(" - "));

      if (!item) continue; // skip invalid

      if (!currentCat) {
        // No active category — create an "unnamed" one
        currentCat = { name: "", items: [] };
        cats.push(currentCat);
      }
      currentCat.items.push({ item, price });

    } else {
      // It's a category heading
      currentCat = { name: line, items: [] };
      cats.push(currentCat);
    }
  }

  // Filter out empty categories
  return cats.filter(c => c.items.length > 0);
}

/* ══════════════════════
   HTML BUILDERS
══════════════════════ */

function buildHero(coverUrl) {
  if (coverUrl && isValidUrl(coverUrl)) {
    return `
      <div class="cafe-hero">
        <img src="${esc(coverUrl)}" alt="Cafe cover" onerror="this.parentElement.innerHTML='<div class=\\'cafe-hero-fallback\\'>☕</div>'" loading="lazy" />
      </div>`;
  }
  return `<div class="cafe-hero"><div class="cafe-hero-fallback">☕</div></div>`;
}

function buildName(name) {
  const display = name || "Cafe Name";
  return `
    <div class="cafe-name-wrap">
      <h1 class="cafe-name">${esc(display)}</h1>
    </div>`;
}

function buildDescription(desc) {
  if (!desc) return "";
  return `
    <div class="cafe-desc-wrap">
      <p class="cafe-desc">${esc(desc)}</p>
    </div>`;
}

function buildCTA(ctaTop, ctaBottom) {
  const defaultTop    = "🍽 Order your favorites online";
  const defaultBottom = "🎉 Book your celebrations";
  const topText    = ctaTop    || defaultTop;
  const bottomText = ctaBottom || defaultBottom;

  const topBlock = `
    <div class="cafe-cta">
      <p>${esc(topText)}</p>
    </div>`;

  const bottomBlock = `
    <div class="cafe-cta">
      <p>${esc(bottomText)}</p>
    </div>`;

  return { topBlock, bottomBlock };
}

function buildGallery(images) {
  if (!images || images.length === 0) return "";

  const imgs = images.map(url =>
    `<img src="${esc(url)}" alt="Cafe photo" onerror="this.remove()" loading="lazy" />`
  ).join("\n");

  return `
    <div class="cafe-gallery-section">
      <div class="cafe-gallery-title">📸 Gallery</div>
      <div class="cafe-gallery">
        ${imgs}
      </div>
    </div>`;
}

function buildReviews(reviews) {
  if (!reviews || reviews.length === 0) return "";

  const cards = reviews.map(r => `
    <div class="review-card">
      <div class="review-stars">★★★★★</div>
      <p class="review-text">${esc(r.text)}</p>
      <div class="review-name">— ${esc(r.name)}</div>
    </div>`
  ).join("\n");

  return `
    <div class="cafe-reviews-section">
      <div class="cafe-reviews-title">⭐ Reviews</div>
      <div class="reviews-scroll">
        ${cards}
      </div>
    </div>`;
}

function buildMenu(categories) {
  if (!categories || categories.length === 0) {
    return `
      <div class="cafe-menu-section">
        <h2 class="cafe-menu-title">🍽 Menu</h2>
        <div style="padding: 12px; opacity: 0.5; font-size: 13px;">Menu coming soon.</div>
      </div>`;
  }

  const catHTML = categories.map(cat => {
    const catName = cat.name
      ? `<div class="menu-cat-name">${esc(cat.name)}</div>`
      : "";
    const items = cat.items.map(i => `
      <div class="menu-item">
        <span class="menu-item-name">${esc(i.item)}</span>
        ${i.price ? `<span class="menu-item-price">${esc(i.price)}</span>` : ""}
      </div>`).join("");

    return `<div class="menu-category">${catName}${items}</div>`;
  }).join("\n");

  return `
    <div class="cafe-menu-section">
      <h2 class="cafe-menu-title">🍽 Menu</h2>
      ${catHTML}
    </div>`;
}

function buildTimings(timings) {
  if (!timings) return "";
  return `
    <div class="cafe-timings-section">
      <div class="cafe-timings-card">
        <div class="timings-icon">⏰</div>
        <div class="timings-content">
          <div class="timings-label">Opening Hours</div>
          <div class="timings-value">${esc(timings)}</div>
        </div>
      </div>
    </div>`;
}

function buildMap(mapLink) {
  if (!mapLink || !isValidUrl(mapLink)) return "";
  return `
    <div class="cafe-map-section">
      <a href="${esc(mapLink)}" target="_blank" rel="noopener noreferrer" class="cafe-map-btn">
        📍 Get Directions on Google Maps
      </a>
    </div>`;
}

function buildContactButtons(phone) {
  const cleanPhone = safe(phone).replace(/\D/g, "");
  if (cleanPhone.length < 10) return "";

  return `
    <div class="cafe-contact-section">
      <a href="tel:${cleanPhone}" class="contact-btn btn-call">
        📞 Call Us
      </a>
      <a href="https://wa.me/${cleanPhone}" target="_blank" rel="noopener noreferrer" class="contact-btn btn-whatsapp">
        💬 WhatsApp
      </a>
    </div>`;
}

/* ══════════════════════
   FULL PAGE ASSEMBLER
══════════════════════ */

function assemblePage(opts) {
  const {
    coverUrl, cafeName, description,
    ctaTop, ctaBottom,
    galleryImages, reviews, menuCategories,
    timings, mapLink, phone,
    theme, font, texture
  } = opts;

  const hero       = buildHero(coverUrl);
  const nameBlock  = buildName(cafeName);
  const descBlock  = buildDescription(description);
  const { topBlock: ctaTopBlock, bottomBlock: ctaBottomBlock } = buildCTA(ctaTop, ctaBottom);
  const galleryBlock  = buildGallery(galleryImages);
  const reviewsBlock  = buildReviews(reviews);
  const menuBlock     = buildMenu(menuCategories);
  const timingsBlock  = buildTimings(timings);
  const mapBlock      = buildMap(mapLink);
  const contactBlock  = buildContactButtons(phone);

  /* FIXED section order per spec:
     1. Cover  2. Name  3. Description  4. CTA Top
     5. Gallery  6. Reviews  7. Menu  8. Timings
     9. Map  10. CTA Bottom  11. Buttons */

  return `
    ${hero}
    ${nameBlock}
    ${descBlock}
    ${ctaTopBlock}
    ${galleryBlock}
    ${reviewsBlock}
    ${menuBlock}
    ${timingsBlock}
    ${mapBlock}
    ${ctaBottomBlock}
    ${contactBlock}
    <div class="page-footer-space"></div>
  `;
}

/* ══════════════════════
   MAIN RENDER ENGINE
══════════════════════ */

function renderPage() {
  /* ── 1. Read all inputs safely ── */
  const cafeName   = getVal("cafeName");
  const description = getVal("description");
  const phone      = getVal("phone");
  const coverUrl   = getVal("coverImage");
  const ctaTop     = getVal("ctaTop");
  const ctaBottom  = getVal("ctaBottom");
  const galleryRaw = getVal("gallery");
  const reviewsRaw = getVal("reviews");
  const menuRaw    = getVal("menu");
  const timings    = getVal("timings");
  const mapLink    = getVal("mapLink");

  /* ── 2. Parse inputs ── */
  const galleryImages  = parseGallery(galleryRaw);
  const reviews        = parseReviews(reviewsRaw);
  const menuCategories = parseMenu(menuRaw);

  /* ── 3. Assemble inner page HTML ── */
  const innerHTML = assemblePage({
    coverUrl, cafeName, description,
    ctaTop, ctaBottom,
    galleryImages, reviews, menuCategories,
    timings, mapLink, phone,
    theme: selectedTheme,
    font: selectedFont,
    texture: selectedTexture
  });

  /* ── 4. Inject into preview with SAFE DOM check ── */
  const preview = document.getElementById("preview");
  if (!preview) return;

  /* Reset classes — CRITICAL to prevent stacking */
  preview.className = "preview";

  /* Apply theme, font, texture to preview root
     (wrapping page-root handles it) */
  const pageHTML = `
    <div class="page-root ${selectedTheme} ${selectedFont} ${selectedTexture}">
      ${innerHTML}
    </div>
  `;

  preview.innerHTML = pageHTML;
}

function generatePreview() {
  try {
    renderPage();
  } catch (e) {
    console.error("Render error:", e);
    // Fail gracefully — never crash the UI
    const preview = document.getElementById("preview");
    if (preview && preview.innerHTML === "") {
      preview.innerHTML = `
        <div class="page-root theme-beige font-modern texture-plain">
          <div class="demo-fallback">
            <div class="demo-icon">☕</div>
            <p>Your cafe landing page will appear here.<br/>Start filling in the form!</p>
          </div>
        </div>`;
    }
  }
}

/* ══════════════════════
   PILL SELECTORS
══════════════════════ */

function initPillGroup(groupId, onSelect) {
  const group = document.getElementById(groupId);
  if (!group) return;

  group.querySelectorAll(".pill").forEach(btn => {
    btn.addEventListener("click", () => {
      group.querySelectorAll(".pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      onSelect(btn.dataset.value);
    });
  });
}

/* ══════════════════════
   DEVICE TOGGLE
══════════════════════ */

function initDeviceToggle() {
  const frame   = document.getElementById("previewFrame");
  const btnMob  = document.getElementById("devMobile");
  const btnDesk = document.getElementById("devDesktop");

  if (!frame || !btnMob || !btnDesk) return;

  btnMob.addEventListener("click", () => {
    frame.className = "preview-frame mobile";
    btnMob.classList.add("active");
    btnDesk.classList.remove("active");
  });

  btnDesk.addEventListener("click", () => {
    frame.className = "preview-frame desktop";
    btnDesk.classList.add("active");
    btnMob.classList.remove("active");
  });
}

/* ══════════════════════
   MOBILE PANEL TOGGLE
══════════════════════ */

function initPanelToggle() {
  const btn   = document.getElementById("panelToggleBtn");
  const panel = document.getElementById("builderPanel");
  if (!btn || !panel) return;

  btn.addEventListener("click", () => {
    panel.classList.toggle("open");
    btn.textContent = panel.classList.contains("open") ? "✕ Close" : "✏️ Edit";
  });

  // Close panel when clicking preview on mobile
  const previewStage = document.querySelector(".preview-stage");
  if (previewStage) {
    previewStage.addEventListener("click", () => {
      if (panel.classList.contains("open")) {
        panel.classList.remove("open");
        btn.textContent = "✏️ Edit";
      }
    });
  }
}

/* ══════════════════════
   EXPORT / DOWNLOAD
══════════════════════ */

function buildExportHTML() {
  const cafeName   = getVal("cafeName") || "Cafe Name";
  const description = getVal("description");
  const phone      = getVal("phone");
  const coverUrl   = getVal("coverImage");
  const ctaTop     = getVal("ctaTop");
  const ctaBottom  = getVal("ctaBottom");
  const galleryRaw = getVal("gallery");
  const reviewsRaw = getVal("reviews");
  const menuRaw    = getVal("menu");
  const timings    = getVal("timings");
  const mapLink    = getVal("mapLink");

  const galleryImages  = parseGallery(galleryRaw);
  const reviews        = parseReviews(reviewsRaw);
  const menuCategories = parseMenu(menuRaw);

  const innerHTML = assemblePage({
    coverUrl, cafeName, description,
    ctaTop, ctaBottom,
    galleryImages, reviews, menuCategories,
    timings, mapLink, phone,
    theme: selectedTheme,
    font: selectedFont,
    texture: selectedTexture
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(cafeName)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&family=Playfair+Display:wght@400;600&family=Nunito:wght@300;400;600&family=Inter:wght@300;400;600&family=DM+Sans:wght@300;400;600&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { min-height: 100%; }
    body { overflow-x: hidden; word-wrap: break-word; overflow-wrap: break-word; }

    /* THEMES */
    .theme-beige { --bg: #F5EDE4; --card: #FFFFFF; --text: #2C2C2C; background: var(--bg); color: var(--text); }
    .theme-peach { --bg: #FFE8DC; --card: #FFF7F3; --text: #2E2E2E; background: var(--bg); color: var(--text); }
    .theme-mint  { --bg: #EAF7F2; --card: #FFFFFF; --text: #2A2A2A; background: var(--bg); color: var(--text); }
    .theme-white { --bg: #FFFFFF; --card: #F4F4F4; --text: #111111; background: var(--bg); color: var(--text); }
    .theme-dark  { --bg: #121212; --card: #1E1E1E; --text: #F5F5F5; background: var(--bg); color: var(--text); }

    /* TEXTURES */
    .texture-plain { background: var(--bg); }
    .texture-grain { position: relative; }
    .texture-grain::before { content: ""; position: fixed; inset: 0; background-image: url("https://www.transparenttextures.com/patterns/noise.png"); opacity: 0.04; pointer-events: none; z-index: 0; }
    .texture-soft { background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4), transparent 40%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.05), transparent 40%), var(--bg); }

    /* FONTS */
    .font-modern  { font-family: 'Poppins', sans-serif; }
    .font-friendly { font-family: 'Nunito', sans-serif; }
    .font-minimal  { font-family: 'Inter', sans-serif; }
    .font-stylish  { font-family: 'DM Sans', sans-serif; }
    .font-elegant h1, .font-elegant h2 { font-family: 'Playfair Display', serif; }

    .page-root { width: 100%; min-height: 100vh; overflow-x: hidden; word-wrap: break-word; overflow-wrap: break-word; max-width: 480px; margin: 0 auto; }

    .cafe-hero { width: 100%; }
    .cafe-hero img { width: 100%; height: auto; display: block; }
    .cafe-hero-fallback { width: 100%; height: 200px; display: flex; align-items: center; justify-content: center; background: var(--card); font-size: 48px; opacity: 0.4; }

    .cafe-name-wrap { padding: 20px 20px 8px; text-align: center; }
    .cafe-name { font-size: 26px; font-weight: 700; color: var(--text); line-height: 1.2; word-wrap: break-word; overflow-wrap: break-word; }

    .cafe-desc-wrap { padding: 6px 20px 16px; text-align: center; }
    .cafe-desc { font-size: 13.5px; color: var(--text); opacity: 0.7; line-height: 1.6; word-wrap: break-word; overflow-wrap: break-word; }

    .cafe-cta { margin: 0 20px 20px; background: var(--card); border-radius: 14px; padding: 14px 16px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.07); }
    .cafe-cta p { font-size: 13.5px; color: var(--text); line-height: 1.7; font-weight: 500; word-wrap: break-word; overflow-wrap: break-word; }

    .cafe-gallery-section { padding: 16px 0; }
    .cafe-gallery-title { font-size: 13px; font-weight: 700; color: var(--text); padding: 0 20px 10px; letter-spacing: 0.3px; opacity: 0.85; text-transform: uppercase; }
    .cafe-gallery { display: flex; gap: 12px; overflow-x: auto; padding: 0 20px 12px; scroll-snap-type: x mandatory; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
    .cafe-gallery::-webkit-scrollbar { display: none; }
    .cafe-gallery img { flex: 0 0 75%; height: 160px; border-radius: 14px; object-fit: cover; scroll-snap-align: start; transition: transform 0.3s ease; display: block; }
    .cafe-gallery img:active { transform: scale(0.97); }

    .cafe-reviews-section { padding: 16px 0; }
    .cafe-reviews-title { font-size: 13px; font-weight: 700; color: var(--text); padding: 0 20px 10px; letter-spacing: 0.3px; opacity: 0.85; text-transform: uppercase; }
    .reviews-scroll { display: flex; gap: 14px; overflow-x: auto; padding: 0 20px 12px; scroll-snap-type: x mandatory; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
    .reviews-scroll::-webkit-scrollbar { display: none; }
    .review-card { flex: 0 0 85%; border-radius: 16px; padding: 16px; background: var(--card); scroll-snap-align: start; transition: transform 0.3s ease; box-shadow: 0 2px 12px rgba(0,0,0,0.08); word-wrap: break-word; overflow-wrap: break-word; }
    .review-card:active { transform: scale(0.97); }
    .review-stars { color: #f4a832; font-size: 13px; margin-bottom: 7px; }
    .review-text { font-size: 13px; color: var(--text); opacity: 0.85; line-height: 1.6; margin-bottom: 9px; }
    .review-name { font-size: 11.5px; font-weight: 700; color: var(--text); opacity: 0.6; letter-spacing: 0.3px; }

    .cafe-menu-section { padding: 16px 20px 20px; }
    .cafe-menu-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 14px; letter-spacing: -0.2px; }
    .menu-category { margin-bottom: 16px; }
    .menu-cat-name { font-size: 12px; font-weight: 700; color: var(--text); opacity: 0.5; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid rgba(0,0,0,0.08); }
    .menu-item { display: flex; justify-content: space-between; align-items: center; padding: 9px 12px; background: var(--card); border-radius: 10px; margin-bottom: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
    .menu-item-name { font-size: 13.5px; color: var(--text); font-weight: 500; flex: 1; word-wrap: break-word; overflow-wrap: break-word; padding-right: 8px; }
    .menu-item-price { font-size: 13px; font-weight: 700; color: var(--text); opacity: 0.75; white-space: nowrap; flex-shrink: 0; }

    .cafe-timings-section { margin: 0 20px 20px; }
    .cafe-timings-card { background: var(--card); border-radius: 14px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.07); }
    .timings-icon { font-size: 22px; flex-shrink: 0; }
    .timings-label { font-size: 10px; font-weight: 700; color: var(--text); opacity: 0.45; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px; }
    .timings-value { font-size: 13px; color: var(--text); font-weight: 500; word-wrap: break-word; overflow-wrap: break-word; }

    .cafe-map-section { padding: 0 20px 20px; }
    .cafe-map-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: var(--card); border: none; border-radius: 14px; padding: 14px 20px; font-size: 14px; font-weight: 600; color: var(--text); cursor: pointer; text-decoration: none; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }

    .cafe-contact-section { padding: 0 20px 24px; display: flex; gap: 10px; }
    .contact-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; border: none; border-radius: 14px; padding: 13px 10px; font-size: 13.5px; font-weight: 600; cursor: pointer; text-decoration: none; box-shadow: 0 4px 14px rgba(0,0,0,0.14); }
    .btn-call { background: #2563eb; color: #fff; }
    .btn-whatsapp { background: #25D366; color: #fff; }

    .page-footer-space { height: 32px; }
  </style>
</head>
<body>
  <div class="page-root ${selectedTheme} ${selectedFont} ${selectedTexture}">
    ${innerHTML}
  </div>
</body>
</html>`;
}

function initExport() {
  const btn = document.getElementById("exportBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    try {
      const html     = buildExportHTML();
      const blob     = new Blob([html], { type: "text/html;charset=utf-8" });
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement("a");
      const cafeName = getVal("cafeName") || "cafe-landing";
      const filename = cafeName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + ".html";

      a.href     = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export error:", e);
    }
  });
}

/* ══════════════════════
   LIVE INPUT LISTENERS
══════════════════════ */

function initLiveListeners() {
  document.querySelectorAll("input, textarea").forEach(el => {
    if (el) {
      el.addEventListener("input", generatePreview);
    }
  });
}

/* ══════════════════════
   INIT
══════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  /* Pill groups */
  initPillGroup("themeGroup", (val) => {
    selectedTheme = val;
    generatePreview();
  });

  initPillGroup("fontGroup", (val) => {
    selectedFont = val;
    generatePreview();
  });

  initPillGroup("textureGroup", (val) => {
    selectedTexture = val;
    generatePreview();
  });

  /* Device toggle */
  initDeviceToggle();

  /* Mobile panel toggle */
  initPanelToggle();

  /* Export */
  initExport();

  /* Live listeners */
  initLiveListeners();

  /* Initial render */
  generatePreview();
});
