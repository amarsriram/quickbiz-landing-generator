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


/* 🔥 FINAL MENU FORMATTER (NO BUGS) */
function formatMenu(menuText) {
  const lines = menuText.split("\n");
  let html = "";
  let currentSection = "";
  let itemsHTML = "";

  lines.forEach(line => {
    line = line.trim();

    // Section detection
    if (line.endsWith(":")) {

      if (currentSection !== "") {
        html += `
          <div class="menu-card">
            <h3>${currentSection}</h3>
            ${itemsHTML}
          </div>
        `;
      }

      currentSection = line.replace(":", "");
      itemsHTML = "";

    } 
    else if (line.includes(" - ")) {
      const parts = line.split(" - ");

      itemsHTML += `
        <div class="menu-item">
          <span>${parts[0]}</span>
          <span>${parts[1]}</span>
        </div>
      `;
    }
  });

  // Last section push
  if (currentSection !== "") {
    html += `
      <div class="menu-card">
        <h3>${currentSection}</h3>
        ${itemsHTML}
      </div>
    `;
  }

  return html;
}


/* COPY CODE */
function copyCode() {
  const preview = document.getElementById("previewPanel").innerHTML;
  navigator.clipboard.writeText(preview);
  alert("Code copied!");
}
