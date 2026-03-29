function generatePage() {
  const name = document.getElementById("cafeName").value;
  const desc = document.getElementById("cafeDesc").value;
  const phone = document.getElementById("cafePhone").value;
  const cover = document.getElementById("coverImg").value;
  const gallery = document.getElementById("galleryImgs").value.split(",");
  const menu = document.getElementById("menuInput").value;
  const maps = document.getElementById("mapsLink").value;

  const formattedMenu = formatMenu(menu);

  const galleryHTML = gallery
    .filter(url => url.trim() !== "")
    .map(url => `<img src="${url.trim()}">`)
    .join("");

  const html = `
    <div class="preview-card">

      <!-- COVER -->
      <img src="${cover}" class="cover-img">

      <!-- GALLERY -->
      <div class="gallery">
        ${galleryHTML}
      </div>

      <!-- NAME -->
      <h2 style="margin-top:10px;">${name}</h2>

      <!-- DESC -->
      <p>${desc}</p>

      <!-- MENU -->
      ${formattedMenu}

      <!-- LOCATION -->
      <p style="margin-top:10px;">
        📍 <a href="${maps}" target="_blank">View Location</a>
      </p>

      <p style="margin-top:10px;">Contact us directly</p>

      <!-- BUTTONS -->
      <a href="tel:${phone}" class="call-btn">📞 Call</a>
      <a href="https://wa.me/${phone}" class="whatsapp-btn">💬 WhatsApp</a>

    </div>
  `;

  document.getElementById("previewPanel").innerHTML = html;
}


/* 🔥 BULLETPROOF MENU FORMATTER */
function formatMenu(menuText) {
  let html = "";

  const sections = menuText.split(";");

  sections.forEach(section => {
    if (!section.trim()) return;

    const parts = section.split(":");

    if (parts.length < 2) return;

    const title = parts[0].trim();
    const items = parts[1].split(",");

    let itemsHTML = "";

    items.forEach(item => {
      const itemParts = item.split("-");

      if (itemParts.length === 2) {
        itemsHTML += `
          <div class="menu-item">
            <span>${itemParts[0].trim()}</span>
            <span>${itemParts[1].trim()}</span>
          </div>
        `;
      }
    });

    html += `
      <div class="menu-card">
        <h3>${title}</h3>
        ${itemsHTML}
      </div>
    `;
  });

  return html;
}


/* COPY CODE */
function copyCode() {
  const preview = document.getElementById("previewPanel").innerHTML;
  navigator.clipboard.writeText(preview);
  alert("Code copied!");
}
