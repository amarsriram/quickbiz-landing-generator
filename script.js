function generate() {
  const name = document.getElementById("name").value.trim();
  const desc = document.getElementById("desc").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const image = document.getElementById("image").value.trim();
  const menu = document.getElementById("menu").value.trim();
  const location = document.getElementById("location").value.trim();
  const theme = document.getElementById("theme").value;
  const font = document.getElementById("font").value;

  if (!name || !desc || !phone) {
    alert("Fill required fields");
    return;
  }

  // Themes
  let bgColor, textColor, btnColor;

  if (theme === "peach") {
    bgColor = "#fff1eb"; textColor = "#3a3a3a"; btnColor = "#e5989b";
  }
  if (theme === "mint") {
    bgColor = "#edf6f3"; textColor = "#2f3e46"; btnColor = "#84a98c";
  }
  if (theme === "white") {
    bgColor = "#ffffff"; textColor = "#1a1a1a"; btnColor = "#6c757d";
  }
  if (theme === "beige") {
    bgColor = "#f8f1e9"; textColor = "#3e3e3e"; btnColor = "#a98467";
  }
  if (theme === "black") {
    bgColor = "#1c1c1c"; textColor = "#f5f5f5"; btnColor = "#4f772d";
  }

  // Fonts
  let fontFamily;
  if (font === "elegant") fontFamily = "'Playfair Display', serif";
  if (font === "cute") fontFamily = "'Pacifico', cursive";
  if (font === "modern") fontFamily = "'Poppins', sans-serif";

  const result = `
<div style="max-width:350px;margin:auto;background:${bgColor};color:${textColor};padding:20px;border-radius:12px;font-family:Arial;text-align:center">

  <div style="margin-bottom:15px;">
    <img src="${image}" style="width:100%;border-radius:12px;">
  </div>

  <h1 style="font-size:28px;font-family:${fontFamily};margin:10px 0;">
    ${name}
  </h1>

  <p style="opacity:0.8;">
    ${desc}
  </p>

  <p style="margin-top:15px;">
    <b>Menu:</b> ${menu}
  </p>

  <a href="${location}" target="_blank" style="display:block;margin:10px 0;">
    📍 View Location
  </a>

  <p style="margin-top:15px;font-weight:bold;">
    Tap below to contact instantly
  </p>

  <a href="tel:${phone}" 
  style="display:block;padding:14px;background:${btnColor};color:white;margin:10px;border-radius:8px;text-decoration:none;">
  📞 Call Now</a>

  <a href="https://wa.me/${phone}" 
  style="display:block;padding:14px;background:#25D366;color:white;margin:10px;border-radius:8px;text-decoration:none;">
  💬 WhatsApp</a>

</div>
  `;

  document.getElementById("output").innerHTML = result;
}
