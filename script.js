/* =============================================
   QuickBiz V4 — script.js
   Generator Logic
   ============================================= */

'use strict';

/* ===== STATE ===== */
let selectedTheme = 'beige';
let generatedHTML = '';

/* ===== THEME CONFIG ===== */
const themes = {
  beige: {
    bg:         '#f5f0e8',
    card:       'rgba(255,255,255,0.65)',
    text:       '#2a2218',
    sub:        '#6b5f4e',
    border:     'rgba(0,0,0,0.08)',
    timingsBg:  'rgba(0,0,0,0.06)',
    menuBg:     'rgba(255,255,255,0.7)',
    accent:     '#b5831f'
  },
  peach: {
    bg:         '#ffe5d9',
    card:       'rgba(255,255,255,0.65)',
    text:       '#3b1f14',
    sub:        '#7a4030',
    border:     'rgba(0,0,0,0.08)',
    timingsBg:  'rgba(0,0,0,0.06)',
    menuBg:     'rgba(255,255,255,0.7)',
    accent:     '#c0522a'
  },
  mint: {
    bg:         '#d4f0e4',
    card:       'rgba(255,255,255,0.65)',
    text:       '#142b20',
    sub:        '#3a6b50',
    border:     'rgba(0,0,0,0.08)',
    timingsBg:  'rgba(0,0,0,0.06)',
    menuBg:     'rgba(255,255,255,0.7)',
    accent:     '#217a4a'
  },
  white: {
    bg:         '#ffffff',
    card:       'rgba(245,245,245,0.8)',
    text:       '#111111',
    sub:        '#555555',
    border:     'rgba(0,0,0,0.1)',
    timingsBg:  'rgba(0,0,0,0.04)',
    menuBg:     '#f8f8f8',
    accent:     '#222222'
  },
  black: {
    bg:         '#111111',
    card:       'rgba(255,255,255,0.06)',
    text:       '#f0ece4',
    sub:        '#aaaaaa',
    border:     'rgba(255,255,255,0.08)',
    timingsBg:  'rgba(255,255,255,0.06)',
    menuBg:     'rgba(255,255,255,0.07)',
    accent:     '#e8c97a'
  },
  pink: {
    bg:         '#ffd6e7',
    card:       'rgba(255,255,255,0.65)',
    text:       '#3b0f24',
    sub:        '#7a2045',
    border:     'rgba(0,0,0,0.08)',
    timingsBg:  'rgba(0,0,0,0.06)',
    menuBg:     'rgba(255,255,255,0.7)',
    accent:     '#b0175c'
  }
};

/* ===== THEME SWATCH SELECTOR ===== */
document.querySelectorAll('.theme-swatch').forEach(function (sw) {
  sw.addEventListener('click', function () {
    document.querySelectorAll('.theme-swatch').forEach(function (s) {
      s.classList.remove('active');
    });
    sw.classList.add('active');
    selectedTheme = sw.dataset.theme;
  });
});

/* ===== HELPERS ===== */

/**
 * Escape HTML special characters to prevent XSS / broken layout.
 * @param {string} str
 * @returns {string}
 */
function escHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Parse and render menu text into HTML.
 * Expected format:
 *   Category Name
 *   Item - ₹Price
 *   Item - ₹Price
 *
 *   Next Category
 *   Item - ₹Price
 *
 * @param {string} menuText
 * @returns {string} HTML string
 */
function formatMenu(menuText) {
  if (!menuText || !menuText.trim()) {
    return '<p style="color:#999;font-size:13px;text-align:center;padding:10px 0;">Menu not available</p>';
  }

  var categories = menuText.split(/\n\s*\n/);

  return categories.map(function (cat) {
    var lines = cat.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (!lines.length) return '';

    var title = lines[0];
    var items = lines.slice(1);

    var itemsHTML = items.map(function (item) {
      var dashIdx = item.lastIndexOf(' - ');
      var itemName  = dashIdx !== -1 ? item.slice(0, dashIdx).trim() : item.trim();
      var itemPrice = dashIdx !== -1 ? item.slice(dashIdx + 3).trim() : '';
      return (
        '<div class="menu-item">' +
          '<span class="item-name">'  + escHtml(itemName)  + '</span>' +
          '<span class="item-price">' + escHtml(itemPrice) + '</span>' +
        '</div>'
      );
    }).join('');

    return (
      '<div class="menu-category">' +
        '<h3>' + escHtml(title) + '</h3>' +
        itemsHTML +
      '</div>'
    );
  }).join('');
}

/* ===== HTML BUILDER ===== */

/**
 * Build the complete cafe landing page HTML string.
 * @param {Object} data   - Form field values
 * @param {Object} t      - Theme config object
 * @returns {string}      - Full standalone HTML document
 */
function buildHTML(data, t) {
  var name        = data.name;
  var description = data.description;
  var timings     = data.timings;
  var cover       = data.cover;
  var gallery     = data.gallery;
  var menuText    = data.menuText;
  var phone       = data.phone;
  var mapsLink    = data.mapsLink;

  /* --- Gallery --- */
  var galleryArray = gallery
    ? gallery.split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s && s.startsWith('http'); })
    : [];

  var gallerySection = galleryArray.length > 0
    ? '<div class="cafe-gallery">' +
        galleryArray.map(function (img) {
          return '<img src="' + img + '" alt="gallery" onerror="this.remove()" />';
        }).join('') +
      '</div>'
    : '';

  /* --- Cover --- */
  var coverSection = (cover && cover.startsWith('http'))
    ? '<div class="cafe-cover"><img src="' + cover + '" alt="Cafe cover" onerror="this.style.display=\'none\'" /></div>'
    : '';

  /* --- Timings --- */
  var timingsSection = timings
    ? '<div class="timings-bar">⏰ ' + escHtml(timings) + '</div>'
    : '';

  /* --- Contact --- */
  var cleanPhone = (phone || '').replace(/\D/g, '');
  var callBtn    = cleanPhone ? '<a href="tel:' + cleanPhone + '" class="call-btn">📞 Call Now</a>' : '';
  var waBtn      = cleanPhone ? '<a href="https://wa.me/' + cleanPhone + '" class="wa-btn">💬 WhatsApp Us</a>' : '';

  /* --- Maps --- */
  var mapsBtn = (mapsLink && mapsLink.startsWith('http'))
    ? '<a href="' + mapsLink + '" target="_blank" class="maps-btn">📍 View Location on Maps</a>'
    : '';

  /* --- Dark mode flag --- */
  var isDark = selectedTheme === 'black';
  var mapsBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'<meta charset="UTF-8" />\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
'<title>' + escHtml(name || 'Cafe') + '</title>\n' +
'<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />\n' +
'<style>\n' +
'  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\n' +
'  html, body { overflow-x: hidden; }\n' +
'  body {\n' +
'    font-family: \'DM Sans\', sans-serif;\n' +
'    background: ' + t.bg + ';\n' +
'    color: ' + t.text + ';\n' +
'    max-width: 480px;\n' +
'    margin: 0 auto;\n' +
'    padding: 0 0 40px 0;\n' +
'  }\n' +
'  .cafe-cover { width: 100%; overflow: hidden; border-radius: 0 0 18px 18px; }\n' +
'  .cafe-cover img { width: 100%; height: auto; display: block; }\n' +
'  .cafe-gallery { display: flex; gap: 10px; padding: 14px 16px; overflow-x: auto; -webkit-overflow-scrolling: touch; }\n' +
'  .cafe-gallery::-webkit-scrollbar { display: none; }\n' +
'  .cafe-gallery img { width: 120px; height: 90px; object-fit: cover; border-radius: 10px; flex-shrink: 0; }\n' +
'  .cafe-body { padding: 18px 16px; }\n' +
'  .cafe-name { font-family: \'Playfair Display\', serif; font-size: 26px; font-weight: 700; line-height: 1.2; margin-bottom: 8px; color: ' + t.text + '; }\n' +
'  .cafe-desc { font-size: 14px; line-height: 1.6; color: ' + t.sub + '; margin-bottom: 14px; }\n' +
'  .timings-bar { margin: 10px 0 18px; padding: 11px 14px; background: ' + t.timingsBg + '; border-radius: 10px; font-size: 13px; font-weight: 500; color: ' + t.sub + '; border: 1px solid ' + t.border + '; }\n' +
'  .section-title { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ' + t.accent + '; margin-bottom: 12px; margin-top: 24px; }\n' +
'  .menu-category { background: ' + t.menuBg + '; padding: 14px; border-radius: 14px; margin-bottom: 14px; border: 1px solid ' + t.border + '; backdrop-filter: blur(8px); }\n' +
'  .menu-category h3 { margin-bottom: 10px; font-size: 15px; font-weight: 700; color: ' + t.text + '; }\n' +
'  .menu-item { display: flex; justify-content: space-between; align-items: baseline; padding: 8px 0; font-size: 14px; border-bottom: 1px dashed ' + t.border + '; gap: 10px; }\n' +
'  .menu-item:last-child { border-bottom: none; }\n' +
'  .item-name { flex: 1; max-width: 70%; word-break: break-word; color: ' + t.text + '; }\n' +
'  .item-price { font-weight: 700; white-space: nowrap; color: ' + t.accent + '; }\n' +
'  .cta-box { background: ' + t.menuBg + '; border: 1px solid ' + t.border + '; border-radius: 14px; padding: 16px; font-size: 13px; line-height: 1.6; color: ' + t.sub + '; text-align: center; margin-bottom: 20px; }\n' +
'  .maps-btn { display: block; width: 100%; padding: 13px; background: ' + mapsBg + '; color: ' + t.text + '; border: 1px solid ' + t.border + '; border-radius: 10px; text-align: center; text-decoration: none; font-size: 14px; font-weight: 500; margin-bottom: 12px; }\n' +
'  .call-btn { background: ' + t.text + '; color: ' + t.bg + '; padding: 14px; border-radius: 10px; display: block; text-align: center; text-decoration: none; font-size: 14px; font-weight: 700; margin-bottom: 10px; letter-spacing: 0.02em; }\n' +
'  .wa-btn { background: #25D366; color: #fff; padding: 14px; border-radius: 10px; display: block; text-align: center; text-decoration: none; font-size: 14px; font-weight: 700; letter-spacing: 0.02em; }\n' +
'</style>\n' +
'</head>\n' +
'<body>\n\n' +
coverSection + '\n\n' +
gallerySection + '\n\n' +
'<div class="cafe-body">\n\n' +
(name        ? '  <h1 class="cafe-name">' + escHtml(name) + '</h1>\n'        : '') +
(description ? '  <p class="cafe-desc">'  + escHtml(description) + '</p>\n'  : '') +
(timingsSection ? '  ' + timingsSection + '\n' : '') +
'\n  <div class="section-title">Our Menu</div>\n' +
formatMenu(menuText) + '\n' +
(mapsBtn ? '  ' + mapsBtn + '\n' : '') +
'\n  <div class="cta-box">\n' +
'    We accept online orders 🍽️ and pre-bookings 🎉 for birthdays, celebrations, and special occasions. Reach out below to order or reserve your spot.\n' +
'  </div>\n\n' +
(callBtn ? '  ' + callBtn + '\n' : '') +
(waBtn   ? '  ' + waBtn   + '\n' : '') +
'\n</div>\n' +
'</body>\n</html>';
}

/* ===== GENERATE ===== */

/**
 * Read form values, build HTML, and inject into the preview iframe.
 */
function generatePage() {
  var data = {
    name:        (document.getElementById('cafeName').value    || '').trim(),
    description: (document.getElementById('description').value || '').trim(),
    timings:     (document.getElementById('timings').value     || '').trim(),
    cover:       (document.getElementById('coverImg').value    || '').trim(),
    gallery:     (document.getElementById('galleryImgs').value || '').trim(),
    menuText:    (document.getElementById('menuText').value    || '').trim(),
    phone:       (document.getElementById('phone').value       || '').trim(),
    mapsLink:    (document.getElementById('mapsLink').value    || '').trim()
  };

  var t = themes[selectedTheme];
  generatedHTML = buildHTML(data, t);

  /* Render in sandboxed iframe */
  var previewContent = document.getElementById('previewContent');
  previewContent.innerHTML = '';

  var iframe = document.createElement('iframe');
  iframe.style.cssText = 'width:100%;border:none;display:block;min-height:600px;';
  iframe.setAttribute('scrolling', 'no');
  previewContent.appendChild(iframe);

  iframe.contentDocument.open();
  iframe.contentDocument.write(generatedHTML);
  iframe.contentDocument.close();

  /* Auto-resize iframe to content height */
  setTimeout(function () {
    try {
      iframe.style.height = iframe.contentDocument.body.scrollHeight + 'px';
    } catch (e) {
      /* cross-origin guard — safe to ignore */
    }
  }, 400);
}

/* ===== COPY ===== */

/**
 * Copy the generated HTML to clipboard.
 */
function copyCode() {
  if (!generatedHTML) {
    showToast('⚠️ Generate first!');
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(generatedHTML)
      .then(function () { showToast('✓ HTML copied!'); })
      .catch(function () { fallbackCopy(); });
  } else {
    fallbackCopy();
  }
}

function fallbackCopy() {
  var ta = document.createElement('textarea');
  ta.value = generatedHTML;
  ta.style.position = 'fixed';
  ta.style.opacity  = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast('✓ HTML copied!');
  } catch (e) {
    showToast('❌ Copy failed');
  }
  document.body.removeChild(ta);
}

/* ===== TOAST ===== */

/**
 * Show a brief toast notification.
 * @param {string} msg
 */
function showToast(msg) {
  var toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function () {
    toast.classList.remove('show');
  }, 2500);
}
