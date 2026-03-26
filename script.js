function generate() {
  const name = document.getElementById("name").value.trim();
  const service = document.getElementById("service").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!name || !service || !phone) {
    alert("Please fill all fields");
    return;
  }

  const result = `
<div style="text-align:center; font-family: Arial, sans-serif; padding:20px;">
  
  <h1 style="color:#222;">${name}</h1>
  
  <p style="font-size:18px; color:#555;">
  ${service}
</p>

<p style="margin-top:15px; font-weight:bold;">
  Contact us now to get started!
</p>

<p style="color:green; font-weight:bold;">
  ✔ Trusted by local businesses
</p>

  <div style="margin-top:20px;">

    <a href="tel:${phone}" 
   style="display:block; padding:14px; background:#111; color:white; margin:12px; text-decoration:none; border-radius:8px; font-size:16px;">
   📞 Call Now
</a>

<a href="https://wa.me/${phone}" 
   style="display:block; padding:14px; background:#25D366; color:white; margin:12px; text-decoration:none; border-radius:8px; font-size:16px;">
   💬 WhatsApp
</a>
  </div>

</div>
  `;

  document.getElementById("output").innerHTML = `
    <h3>Your Landing Page Preview</h3>
    ${result}
    <button onclick="copyText()" style="margin-top:15px;">Copy Code</button>
  `;

  window.generatedCode = result;
}

function copyText() {
  navigator.clipboard.writeText(window.generatedCode);
  alert("Code copied!");
}
