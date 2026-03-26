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

  // THEMES
  let bgColor, textColor;

  if (theme === "peach") {
    bgColor = "#fff1eb"; textColor = "#3a3a3a";
  }
  if (theme === "mint") {
    bgColor = "#edf6f3"; textColor = "#2f3e46";
  }
  if (theme === "white") {
    bgColor = "#ffffff"; textColor = "#1a1a1a";
  }
  if (theme === "beige") {
    bgColor = "#f8f1e9"; textColor = "#3e3e3e";
  }
  if (theme === "black") {
    bgColor = "#1c1c1c"; textColor = "#f5f5f5";
  }

  // FONTS
  let fontFamily;
  if (font === "elegant") fontFamily = "'Playfair Display', serif";
  if (font === "cute") fontFamily = "'Pacifico', cursive";
  if (font === "modern") fontFamily = "'Poppins', sans-serif";

  // MENU LOGIC (SECTIONED + PRICING)
  let formattedMenu = "";

const sections = menu.split(";");

sections.forEach(section => {

  const parts = section.split(":");
  const title = parts[0];
  const items = parts[1] ? parts[1].split(",") : [];

  formattedMenu += `
  <div style="
    margin-top:20px;
    padding:12px;
    border-radius:10px;
    background:rgba(0,0,0,0.03);
  ">
    
    <div style="
      font-weight:700;
      font-size:15px;
      margin-bottom:8px;
      letter-spacing:0.3px;
    ">
      ${title}
    </div>
  `;

  items.forEach(item => {
    const [name, price] = item.split("-");

    formattedMenu += `
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:6px 0;
      font-size:14px;
    ">
      <span>${name}</span>
      <span style="
        opacity:0.7;
        font-size:13px;
      ">
        ${price || ""}
      </span>
    </div>`;
  });

  formattedMenu += `</div>`;
});

  });

  // FINAL PAGE
  const result = `
<div style="
max-width:350px;
margin:auto;
background:${bgColor};
color:${textColor};
padding:20px;
border-radius:12px;
text-align:center;
font-family:Arial;
">

  <div style="margin-bottom:15px;">
    <img src="${image}" style="width:100%;border-radius:12px;">
  </div>

  <h1 style="font-size:28px;font-family:${fontFamily};margin:10px 0;">
    ${name}
  </h1>
<p style="opacity:0.8;">
  ${desc}
</p>

<div style="margin-top:20px;text-align:left;">
  ${formattedMenu}
</div>
  

  <div style="margin-top:15px;text-align:left;">
    <b>Menu</b>
    ${formattedMenu}
  </div>

  <a href="${location}" target="_blank" 
  style="display:block;margin:12px 0;color:${textColor};text-decoration:none;font-weight:500;">
  📍 View Location
  </a>

  <p style="font-size:13px;opacity:0.7;">
    ✔ Loved by local customers
  </p>

  <p style="margin-top:15px;font-weight:bold;">
    Tap below to contact instantly
  </p>

  <a href="tel:${phone}" 
  style="
  display:block;
  padding:14px;
  background:#2b2b2b;
  color:white;
  margin:10px;
  border-radius:8px;
  text-decoration:none;
  ">
  📞 Call Now
  </a>

  <a href="https://wa.me/${phone}" 
  style="
  display:block;
  padding:14px;
  background:#4f772d;
  color:white;
  margin:10px;
  border-radius:8px;
  text-decoration:none;
  ">
  💬 WhatsApp
  </a>

</div>
  `;

  document.getElementById("output").innerHTML = result;
  window.generatedCode = result;
}


// COPY FUNCTION
function copyCode() {

  if (!window.generatedCode) {
    alert("Generate first!");
    return;
  }

  navigator.clipboard.writeText(window.generatedCode);
  alert("Code copied!");
}
