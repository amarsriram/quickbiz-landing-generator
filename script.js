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
  let bgColor = "#ffffff", textColor = "#222";

  if (theme === "peach") {
    bgColor = "#fff1eb"; textColor = "#3a3a3a";
  } else if (theme === "mint") {
    bgColor = "#edf6f3"; textColor = "#2f3e46";
  } else if (theme === "white") {
    bgColor = "#ffffff"; textColor = "#1a1a1a";
  } else if (theme === "beige") {
    bgColor = "#f8f1e9"; textColor = "#3e3e3e";
  } else if (theme === "black") {
    bgColor = "#1c1c1c"; textColor = "#f5f5f5";
  }

  // FONTS
  let fontFamily = "Arial";

  if (font === "elegant") fontFamily = "'Playfair Display', serif";
  else if (font === "cute") fontFamily = "'Pacifico', cursive";
  else if (font === "modern") fontFamily = "'Poppins', sans-serif";

  // MENU (SAFE + CLEAN)
  let formattedMenu = "";

  try {
    const sections = menu.split(";");

    sections.forEach(section => {

      const parts = section.split(":");
      const title = parts[0] || "";
      const items = parts[1] ? parts[1].split(",") : [];

      formattedMenu += `
      <div style="
        margin-top:25px;
        padding:12px;
        border-radius:10px;
        background:rgba(255,255,255,0.6);
        backdrop-filter:blur(4px);
        box-shadow:0 2px 8px rgba(0,0,0,0.05); 
      ">
        
        <div style="
          font-weight:700;
          font-size:15px;
          margin-bottom:8px;
        ">
          ${title}
        </div>
      `;

      items.forEach(item => {
        const parts = item.split("-");
        const itemName = parts[0] || "";
        const price = parts[1] || "";

        formattedMenu += `
        <div style="
          display:flex;
          justify-content:space-between;
          padding:6px 0;
          font-size:14px;
        ">
          <span>${itemName}</span>
          <span style="opacity:0.7;">${price}</span>
        </div>`;
      });

      formattedMenu += `</div>`;
    });

  } catch (e) {
    formattedMenu = "<p>Menu format error</p>";
  }

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

  <div style="position:relative;margin-bottom:10px;">
  <img src="${image}" style="
    width:100%;
    height:190px;
    object-fit:cover;
    border-radius:14px;
  ">
  <div style="
    position:absolute;
    top:0;
    left:0;
    width:100%;
    height:100%;
    border-radius:14px;
    background:linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3));
  "></div>
</div> 

  <h1 style="
font-size:30px;
font-family:${fontFamily};
margin:12px 0 6px 0;
letter-spacing:0.5px;
"> 
    ${name}
  </h1>

  <p style="
opacity:0.75;
font-size:14px;
margin-bottom:10px;
"> 
    ${desc}
  </p>

  <div style="margin-top:20px;text-align:left;">
    ${formattedMenu}
  </div>

  <a href="${location}" target="_blank" 
  style="
display:block;
margin:14px 0;
color:${textColor};
text-decoration:none;
font-size:14px;
opacity:0.8;
">
  📍 Find us on Maps 
  </a>

  
  </p>

<div style="
margin:15px 0;
height:1px;
background:rgba(0,0,0,0.08);
"></div>

  <p style="margin-top:15px;font-weight:500;">
    Contact us directly
  
  </p>

  <a href="tel:${phone}" 
  style="
  display:block;
  width:100%;
  padding:14px;
  background:#1f1f1f;
  color:white;
  margin-top:10px;
  border-radius:10px;
  text-decoration:none;
  ">
  📞 Call
  </a>

  <a href="https://wa.me/${phone}" 
  style="
  display:block;
  width:100%;
  padding:14px;
  background:#25D366;
  color:white;
  margin-top:15px;
  border-radius:10px;
  text-decoration:none;
  ">
  💬 Chat on WhatsApp
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
