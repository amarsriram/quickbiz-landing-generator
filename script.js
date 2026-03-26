function generate() {
  const name = document.getElementById("name").value;
  const service = document.getElementById("service").value;
  const phone = document.getElementById("phone").value;

  document.getElementById("output").innerHTML = `
    <h2>${name}</h2>
    <p>${service}</p>
    <a href="tel:${phone}">Call Now</a><br>
    <a href="https://wa.me/${phone}">WhatsApp</a>
  `;
}
