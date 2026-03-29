/* ===================================================
   QuickBiz Cafe Page Generator — script.js
   =================================================== */

// ---------- State ----------
const state = {
  theme: 'beige',
  font: 'modern',
  mobileView: false
};

// ---------- DOM Refs ----------
const generateBtn     = document.getElementById('generateBtn');
const exportBtn       = document.getElementById('exportBtn');
const cafePage        = document.getElementById('cafePage');
const emptyState      = document.getElementById('emptyState');
const previewFrame    = document.getElementById('previewFrame');
const viewDesktop     = document.getElementById('viewDesktop');
const viewMobile      = document.getElementById('viewMobile');
const toast           = document.getElementById('toast');
const themePicker     = document.getElementById('themePicker');
const fontPicker      = document.getElementById('fontPicker');

// ---------- Theme Picker ----------
themePicker.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    themePicker.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.theme = btn.dataset.theme;
    if (cafePage.style.display !== 'none') {
      cafePage.dataset.theme = state.theme;
    }
  });
});

// ---------- Font Picker ----------
fontPicker.querySelectorAll('.font-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    fontPicker.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.font = btn.dataset.font;
    if (cafePage.style.display !== 'none') {
      cafePage.dataset.font = state.font;
    }
  });
});

// ---------- View Toggle ----------
viewDesktop.addEventListener('click', () => {
  state.mobileView = false;
  previewFrame.classList.remove('mobile-view');
  viewDesktop.classList.add('active');
  viewMobile.classList.remove('active');
});

viewMobile.addEventListener('click', () => {
  state.mobileView = true;
  previewFrame.classList.add('mobile-view');
  viewMobile.classList.add('active');
  viewDesktop.classList.remove('active');
});

// ---------- Menu Parser ----------
/**
 * Parses menu string like:
 * "Coffee: Espresso - ₹59, Latte - ₹69; Tea: Lemon Tea - ₹20;"
 *
 * Returns array of { title, items: [{name, price}] }
 */
function parseMenu(raw) {
  if (!raw || !raw.trim()) return [];

  const categories = [];

  // Split by semicolon to get sections
  const sections = raw.split(';').map(s => s.trim()).filter(Boolean);

  sections.forEach(section => {
    // Split by first colon only to get title and items
    const colonIdx = section.indexOf(':');
    if (colonIdx === -1) return;

    const title = section.slice(0, colonIdx).trim();
    const itemsRaw = section.slice(colonIdx + 1).trim();

    if (!title || !itemsRaw) return;

    // Split items by comma
    const itemList = itemsRaw.split(',').map(i => i.trim()).filter(Boolean);

    const items = itemList.map(itemStr => {
      // Split by last dash (to handle names with dashes like "Half-n-Half")
      const dashIdx = itemStr.lastIndexOf('-');
      if (dashIdx === -1) {
        return { name: itemStr.trim(), price: '' };
      }
      return {
        name: itemStr.slice(0, dashIdx).trim(),
        price: itemStr.slice(dashIdx + 1).trim()
      };
    }).filter(item => item.name);

    if (items.length > 0) {
      categories.push({ title, items });
    }
  });

  return categories;
}

// ---------- Build Menu HTML ----------
function buildMenuHTML(categories) {
  if (!categories.length) return '';

  let html = `<div class="cafe-menu">
    <p class="cafe-menu__title">Our Menu</p>`;

  categories.forEach(cat => {
    html += `<div class="cafe-menu__category">
      <div class="cafe-menu__category-name">${escHtml(cat.title)}</div>`;

    cat.items.forEach(item => {
      html += `<div class="cafe-menu__item">
        <span class="cafe-menu__item-name">${escHtml(item.name)}</span>
        <span class="cafe-menu__item-price">${escHtml(item.price)}</span>
      </div>`;
    });

    html += `</div>`;
  });

  html += `</div>`;
  return html;
}

// ---------- Build Cover HTML ----------
function buildCoverHTML(url) {
  if (!url || !url.trim()) {
    return `<div class="cafe-cover"><div class="cafe-cover__fallback">☕</div></div>`;
  }
  return `<div class="cafe-cover">
    <img src="${escAttr(url)}" alt="Cafe cover" loading="lazy"
style="width:100%; height:auto; display:block;"> 
  </div>`;
}

// ---------- Build Gallery HTML ----------
function buildGalleryHTML(raw) {
  if (!raw || !raw.trim()) return '';

  const urls = raw.split('\n')
    .map(u => u.trim())
    .filter(u => u && u.startsWith('http'))
    .slice(0, 4); // max 4

  if (!urls.length) return '';

  const imgs = urls.map(url =>
    `<img class="cafe-gallery__img" src="${escAttr(url)}" alt="Gallery" loading="lazy" onerror="this.style.display='none'" />`
  ).join('');

  return `<div class="cafe-gallery">${imgs}</div>`;
}

// ---------- Generate Page ----------
function generatePage() {
  const cafeName     = val('cafeName');
  const cafeDesc     = val('cafeDesc');
  const coverImage   = val('coverImage');
  const galleryRaw   = val('galleryImages');
  const menuRaw      = val('menuInput');
  const mapsUrl      = val('mapsUrl');
  const ctaText      = val('ctaText');
  const phoneNum     = val('phoneNumber');
  const whatsappNum  = val('whatsappNumber');

  if (!cafeName.trim()) {
    showToast('⚠️ Please enter a cafe name', 'error');
    document.getElementById('cafeName').focus();
    return;
  }

  const menuCategories = parseMenu(menuRaw);
  const menuHTML       = buildMenuHTML(menuCategories);
  const coverHTML      = buildCoverHTML(coverImage);
  const galleryHTML    = buildGalleryHTML(galleryRaw);

  // Location link
  let locationHTML = '';
  if (mapsUrl && mapsUrl.trim()) {
    locationHTML = `<div class="cafe-location">
      <a class="cafe-location__link" href="${escAttr(mapsUrl)}" target="_blank" rel="noopener">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        View on Google Maps
      </a>
    </div>`;
  }

  // CTA text
  let ctaHTML = '';
  if (ctaText && ctaText.trim()) {
    ctaHTML = `<p class="cafe-cta">${escHtml(ctaText)}</p>`;
  }

  // Action Buttons
  let actionsHTML = '';
  const hasBtns = phoneNum.trim() || whatsappNum.trim();
  if (hasBtns) {
    actionsHTML = `<div class="cafe-actions">`;
    if (phoneNum.trim()) {
      const clean = phoneNum.replace(/\s+/g, '').replace(/[^+\d]/g, '');
      actionsHTML += `<a href="tel:${escAttr(clean)}" class="cafe-btn cafe-btn--call">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.9 3.18 2 2 0 012.88 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        Call Us
      </a>`;
    }
    if (whatsappNum.trim()) {
      const clean = whatsappNum.replace(/\s+/g, '').replace(/[^+\d]/g, '');
      const waNum = clean.replace(/^\+/, '');
      actionsHTML += `<a href="https://wa.me/${escAttr(waNum)}" target="_blank" rel="noopener" class="cafe-btn cafe-btn--whatsapp">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        WhatsApp
      </a>`;
    }
    actionsHTML += `</div>`;
  }

  // Compose the full cafe page
  cafePage.innerHTML = `
    ${coverHTML}
    ${galleryHTML}
    <div class="cafe-body">
      <h1 class="cafe-name">${escHtml(cafeName)}</h1>
      ${cafeDesc.trim() ? `<p class="cafe-desc">${escHtml(cafeDesc)}</p>` : ''}
      ${menuHTML}
      ${locationHTML}
      ${ctaHTML}
      ${actionsHTML}
    </div>
  `;

  // Apply theme & font
  cafePage.dataset.theme = state.theme;
  cafePage.dataset.font  = state.font;

  // Show the page
  emptyState.style.display  = 'none';
  cafePage.style.display    = 'block';

  showToast('✅ Page generated!', 'success');

  // Scroll preview to top
  document.getElementById('previewFrameWrapper').scrollTop = 0;
}

// ---------- Export HTML ----------
function exportPage() {
  if (cafePage.style.display === 'none') {
    showToast('⚠️ Generate a page first', 'error');
    return;
  }

  const theme = cafePage.dataset.theme;
  const font  = cafePage.dataset.font;

  const fontMap = {
    modern:  "'Poppins', sans-serif",
    elegant: "'Playfair Display', serif",
    cute:    "'Pacifico', cursive"
  };

  const themeMap = {
    beige: { bg:'#f5f0e8', text:'#2c2417', muted:'#7a6a52', card:'#fffdf7', border:'#e0d4c0' },
    peach: { bg:'#fde8d8', text:'#3a1f10', muted:'#8a5a3a', card:'#fff5ef', border:'#f0c8a8' },
    mint:  { bg:'#dff2ec', text:'#0d2e22', muted:'#3a7a60', card:'#f4fdf8', border:'#b8dfd2' },
    white: { bg:'#ffffff', text:'#1a1a1a', muted:'#666',    card:'#f8f8f8', border:'#e5e5e5' },
    black: { bg:'#1a1a1a', text:'#f0ede8', muted:'#999',    card:'#252525', border:'#333'   }
  };

  const t = themeMap[theme] || themeMap.beige;
  const ff = fontMap[font] || fontMap.modern;
  const cafeName = val('cafeName') || 'Cafe';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${escHtml(cafeName)}</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&family=Pacifico&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:${ff};background:${t.bg};color:${t.text};padding-bottom:40px}
img{max-width:100%;display:block}
.cafe-cover{width:100%;aspect-ratio:16/9;overflow:hidden;background:${t.border}}
.cafe-cover img{width:100%;height:100%;object-fit:cover}
.cafe-gallery{display:flex;gap:10px;overflow-x:auto;padding:14px 18px;scrollbar-width:none}
.cafe-gallery::-webkit-scrollbar{display:none}
.cafe-gallery__img{flex-shrink:0;width:110px;height:80px;border-radius:10px;object-fit:cover;border:2px solid ${t.border}}
.cafe-body{padding:0 18px}
.cafe-name{font-size:28px;font-weight:700;line-height:1.2;margin:16px 0 8px;color:${t.text}}
.cafe-desc{font-size:14px;color:${t.muted};line-height:1.65;margin-bottom:24px;font-family:'Poppins',sans-serif}
.cafe-menu{margin-bottom:24px}
.cafe-menu__title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:${t.muted};margin-bottom:12px;font-family:'Poppins',sans-serif}
.cafe-menu__category{background:${t.card};border:1px solid ${t.border};border-radius:12px;padding:14px 16px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.cafe-menu__category-name{font-size:15px;font-weight:600;color:${t.text};margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid ${t.border};font-family:'Poppins',sans-serif}
.cafe-menu__item{display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13.5px;font-family:'Poppins',sans-serif}
.cafe-menu__item:not(:last-child){border-bottom:1px dashed ${t.border}}
.cafe-menu__item-name{color:${t.text}}
.cafe-menu__item-price{color:${t.muted};font-weight:600;font-size:13px;white-space:nowrap;margin-left:12px}
.cafe-location{margin-bottom:20px}
.cafe-location__link{display:inline-flex;align-items:center;gap:7px;color:${t.muted};text-decoration:none;font-size:13px;font-family:'Poppins',sans-serif;padding:9px 14px;border:1px solid ${t.border};border-radius:8px;background:${t.card}}
.cafe-cta{font-size:15px;font-weight:600;color:${t.text};margin-bottom:20px;line-height:1.5;font-family:'Poppins',sans-serif}
.cafe-actions{display:flex;gap:12px;flex-wrap:wrap}
.cafe-btn{flex:1;min-width:130px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 20px;border-radius:10px;font-size:14px;font-weight:600;font-family:'Poppins',sans-serif;text-decoration:none;border:none;cursor:pointer}
.cafe-btn--call{background:#222222 !important;color:#ffffff !important}
.cafe-btn--whatsapp{background:#25D366 !important;color:#ffffff !important}
@media(max-width:480px){.cafe-actions{flex-direction:column}.cafe-btn{flex:unset;width:100%}}
</style>
</head>
<body>
${cafePage.innerHTML}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${(val('cafeName') || 'cafe').toLowerCase().replace(/\s+/g, '-')}-page.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('📥 HTML exported!', 'success');
}

// ---------- Event Listeners ----------
generateBtn.addEventListener('click', generatePage);
exportBtn.addEventListener('click', exportPage);

// Live theme/font update
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.ctrlKey) generatePage();
});

// ---------- Helpers ----------
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}

let toastTimer = null;

function showToast(msg, type = 'success') {
  toast.textContent = msg;
  toast.className = `toast toast--${type} show`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}
