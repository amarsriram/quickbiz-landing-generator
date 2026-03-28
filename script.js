function generate() {

  const name = document.getElementById("name").value.trim();
  const desc = document.getElementById("desc").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const image = document.getElementById("image").value.trim();
  const gallery = document.getElementById("gallery").value.trim();
  const timings = document.getElementById("timings").value.trim();
  const menu = document.getElementById("menu").value.trim();
  const location = document.getElementById("location").value.trim();
  const instagram = document.getElementById("instagram").value.trim();
  const theme = document.getElementById("theme").value;
  const font = document.getElementById("font").value;

  if (!name || !phone) {
    alert("Fill required fields");
    return;
  }

  // THEME
  let bg = "#ffffff", text = "#222";

  if (theme === "beige") bg = "#f8f1e9";
  if (theme === "peach") bg = "#fff1eb";
  if (theme === "mint") bg = "#edf6f3";
  if (theme === "black") { bg = "#1c1c1c"; text = "#f5f5f5"; }

  // FONT
  let fontFamily = "Poppins";
  if (font === "elegant") fontFamily = "'Playfair Display', serif";
  if (font === "cute") fontFamily = "'Pacifico', cursive";

  // GALLERY
  let galleryHTML = "";
  if (gallery) {
    const imgs = gallery.split(",");
    galleryHTML = `<div style="display:flex;overflow-x:auto;gap:10px;margin:10px 0;">`;
    imgs.forEach(img => {
      galleryHTML += `<img src="${img.trim()}" style="width:140px;height:100px;border-radius:12px;object-fit:cover;">`;
    });
    galleryHTML += `</div>`;
  }

  // TIMINGS
  let timingsHTML = "";
  if (timings) {
    timingsHTML = `<div style="margin-top:10px;text-align:left;">
      <div style="font-weight:700;">⏲️ Timings</div>`;
    timings.split(";").forEach(t => {
      timingsHTML += `<div style="font-size:14px;">${t}</div>`;
    });
    timingsHTML += `</div>`;
  }

  // MENU
  let menuHTML = "";
  const sections = menu.split(";");
  sections.forEach(sec => {
    const [title, items] = sec.split(":");
    if (!items) return;

    menuHTML += `<div style="margin-top:15px;padding:12px;border-radius:12px;background:rgba(255,255,255,0.6);">
      <div style="font-weight:700;margin-bottom:6px;">${title}</div>`;

    items.split(",").forEach(i => {
      const [n, p] = i.split("-");
      menuHTML += `
      <div style="display:flex;justify-content:space-between;font-size:14px;padding:6px 0;">
        <span>${n}</span>
        <span>${p}</span>
      </div>`;
    });

    menuHTML += `</div>`;
  });

  // INSTAGRAM
  let instaHTML = "";
  if (instagram) {
    instaHTML = `<a href="${instagram}" target="_blank" style="display:block;margin:10px 0;">📸 Instagram</a>`;
  }

  const result = `
<div style="width:100%;padding:18px 15px 30px 15px;background:${bg};color:${text};font-family:${fontFamily};">

<div style="height:10px;"></div>

  <img src="${image}" style="width:100%;height:200px;border-radius:12px;object-fit:cover;">

  ${galleryHTML}

  <h2 style="margin:10px 0;">${name}</h2>
  <p style="font-size:14px;opacity:0.8;">${desc}</p>

  ${timingsHTML}

  ${menuHTML}

  <a href="${location}" target="_blank" style="display:block;text-align:center;margin:15px 0;font-weight:600;">
    📍 View Location
  </a>

  ${instaHTML}

  <div style="font-size:13px;opacity:0.7;margin:10px 0;text-align:center;">
    ✔ Loved by local customers
  </div>

  <a href="tel:${phone}" style="display:block;padding:14px;background:#1f1f1f;color:white;text-align:center;border-radius:10px;">
    📞 Call Now
  </a>

  <a href="https://wa.me/${phone}" style="display:block;padding:14px;background:#25D366;color:white;text-align:center;border-radius:10px;margin-top:10px;">
    💬 Chat on WhatsApp
  </a>

</div>
`;

  document.getElementById("output").innerHTML = `
    
document.getElementById("output").innerHTML = result;
  
  window.generatedCode = result;
}

function copyCode() {
  if (!window.generatedCode) {
    alert("Generate first!");
    return;
  }
  navigator.clipboard.writeText(window.generatedCode);
  alert("Code copied!");
}
