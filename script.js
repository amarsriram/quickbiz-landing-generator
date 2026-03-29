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

      <img src="${cover}" class="cover-img">

      <div class="gallery">
        ${galleryHTML}
      </div>

      <h2 style="margin-top:10px;">${name}</h2>
      <p>${desc}</p>

      ${formattedMenu}

      <p style="margin-top:10px;">
        📍 <a href="${maps}" target="_blank">View Location</a>
      </p>

      <p>Contact us directly</p>

      <a href="tel:${phone}" class="call-btn">📞 Call</a>
      <a href="https://wa.me/${phone}" class="whatsapp-btn">💬 WhatsApp</a>

    </div>
  `;

  document.getElementById("previewPanel").innerHTML = html;
}

/* 🔥 PERFECT MENU FORMATTER */
function formatMenu(menuText) {
  const sections = menuText.split("\n\n");
  let html = "";

  sections.forEach(section => {
    const lines = section.split("\n");
    const title = lines[0];
    const items = lines.slice(1);

    let itemsHTML = "";

    items.forEach(item => {
      const parts = item.split(" - ");
      if (parts.length === 2) {
        itemsHTML += `
          <div class="menu-item">
            <span>${parts[0]}</span>
            <span>${parts[1]}</span>
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
