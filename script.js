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

  // THEMES
  let bg = "#ffffff", text = "#222";

  if (theme === "beige") { bg = "#f8f1e9"; text = "#3e3e3e"; }
  if (theme === "peach") { bg = "#fff1eb"; text = "#3a3a3a"; }
  if (theme === "mint") { bg = "#edf6f3"; text = "#2f3e46"; }
  if (theme === "white") { bg = "#ffffff"; text = "#1a1a1a"; }
  if (theme === "black") { bg = "#1c1c1c"; text = "#f5f5f5"; }

  // FONTS
  let fontFamily = "Arial";
  if (font === "elegant") fontFamily = "'Playfair Display', serif";
  if (font === "cute") fontFamily = "'Pacifico', cursive";
  if (font === "modern") fontFamily = "'Poppins', sans-serif";

  // FORMAT NAME
  const formattedName = name.replace(/\b\w/g, c => c.toUpperCase());

  // GALLERY
  let galleryHTML = "";
  if (gallery) {
    const imgs = gallery.split(",");
    galleryHTML = `<div style="display:flex;overflow-x:auto;gap:10px;margin-top:10px;">`;
    imgs.forEach(img => {
      galleryHTML += `<img src="${img.trim()}" style="width:120px;height:90px;border-radius:10px;object-fit:cover;">`;
    });
    galleryHTML += `</div>`;
  }

  // TIMINGS
  let timingsHTML = "";
  if (timings) {
    const parts = timings.split(";");
    timingsHTML = `<div style="margin-top:15px;text-align:left;">
      <b>⏰ Timings</b>`;
    parts.forEach(t => {
      timingsHTML += `<div style="font-size:14px;">${t}</div>`;
    });
    timingsHTML += `</div>`;
  }

  // MENU
  let menuHTML = "";
  try {
    const sections = menu.split(";");
    sections.forEach(sec => {
      const parts = sec.split(":");
      const title = parts[0];
      const items = parts[1] ? parts[1].split(",") : [];

      menuHTML += `<div style="margin-top:15px;padding:10px;border-radius:10px;background:#fff;">`;
      menuHTML += `<div style="font-weight:600;">${title}</div>`;

      items.forEach(i => {
        const [n, p] = i.split("-");
        menuHTML += `
        <div style="display:flex;justify-content:space-between;font-size:14px;padding:6px 0;">
          <span>${n}</span>
          <span>${p || ""}</span>
        </div>`;
      });

      menuHTML += `</div>`;
    });
  } catch {
    menuHTML = "<p>Menu error</p>";
  }

  // INSTAGRAM
  let instaHTML = "";
  if (instagram) {
    instaHTML = `
    <a href="${instagram}" target="_blank" style="display:block;margin:10px 0;color:${text};">
      📸 Instagram
    </a>`;
  }

  // FINAL PAGE
  const result = `
<div style="max-width:350px;margin:auto;background:${bg};color:${text};padding:20px;border-radius:12px;font-family:${fontFamily};">

  <img src="${image}" style="width:100%;height:190px;object-fit:cover;border-radius:12px;">

  ${galleryHTML}

  <h1 style="font-size:28px;margin:10px 0;">${formattedName}</h1>

  <p style="opacity:0.85;font-size:14px;">${desc}</p>

  ${timingsHTML}

  <div style="margin-top:20px;">${menuHTML}</div>

  <a href="${location}" target="_blank" style="display:block;margin:12px 0;color:${text};">
    📍 Find us on Maps
  </a>

  ${instaHTML}

  <div style="margin:15px 0;height:1px;background:rgba(0,0,0,0.1);"></div>

  <a href="tel:${phone}" style="display:block;padding:14px;background:#1f1f1f;color:white;text-align:center;border-radius:10px;">
    📞 Call
  </a>

  <a href="https://wa.me/${phone}" style="display:block;padding:14px;background:#25D366;color:white;text-align:center;border-radius:10px;margin-top:10px;">
    💬 WhatsApp
  </a>

</div>
`;

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
