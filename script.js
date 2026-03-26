function generate() {
  const name = document.getElementById("name").value;
  const service = document.getElementById("service").value;
  const phone = document.getElementById("phone").value;

  const result = `
<h2>${name}</h2>
<p>${service}</p>
<a href="tel:${phone}">Call Now</a><br>
<a href="https://wa.me/${phone}">WhatsApp</a>
  `;

  document.getElementById("output").innerHTML = `
    ${result}
    <br><br>
    <button onclick="copyText()">Copy Code</button>
  `;

  window.generatedCode = result;
}

function copyText() {
  navigator.clipboard.writeText(window.generatedCode);
  alert("Copied!");
}
