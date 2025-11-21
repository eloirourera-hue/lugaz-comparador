function showStep(step) {
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("email-screen").classList.add("hidden");
  document.getElementById("upload-screen").classList.add("hidden");
  document.getElementById("results-screen").classList.add("hidden");

  if (step === 1) document.getElementById("start-screen").classList.remove("hidden");
  if (step === 2) document.getElementById("email-screen").classList.remove("hidden");
  if (step === 3) document.getElementById("upload-screen").classList.remove("hidden");
  if (step === 4) document.getElementById("results-screen").classList.remove("hidden");
}

function saveEmail() {
  const email = document.getElementById("email").value;
  if (!email.includes("@")) {
    alert("Introduce un email válido");
    return;
  }
  localStorage.setItem("email", email);
  showStep(3);
}

function fakeReadFactura() {
  const file = document.getElementById("factura").files[0];
  if (!file) {
    alert("Debes subir un archivo PDF primero.");
    return;
  }

  alert("Factura leída (DE MOMENTO ES UNA SIMULACIÓN)");

  loadTariffs();
}

function loadTariffs() {
  fetch("tariffs.json")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("results-output");
      container.innerHTML = "";
      
      data.forEach(cia => {
        container.innerHTML += `
        <div style="border:1px solid #ccc; padding:12px; margin-bottom:10px;">
          <b>${cia.company}</b><br>
          Precio fijo medio: <b>${cia.price} €/kWh</b><br>
          <i>(${cia.notes})</i>
        </div>`;
      });

      showStep(4);
    });
}
