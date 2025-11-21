let tarifas = [];

// Cargar tarifas desde JSON
fetch('tarifas.json')
  .then(response => response.json())
  .then(data => {
    tarifas = data.tarifas;
  })
  .catch(error => console.log('Error cargando tarifas:', error));

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxVi6XhMv1YpI2qZU97Rao8DhUdg0esgMJr3JdZEU05xhPnhiG_UWRq5LxbyD0QnHYw/exec";

async function procesarFactura() {
  const email = document.getElementById("email").value;
  const file = document.getElementById("factura").files[0];
  const estado = document.getElementById("estado");

  if (!email) {
    estado.textContent = "⚠️ Por favor, introduce tu email";
    return;
  }

  if (!file) {
    estado.textContent = "⚠️ Por favor, sube tu factura";
    return;
  }

  estado.textContent = "Procesando tu factura y guardando tu email...";

  // Guardar email en Google Sheets (con try-catch para evitar bloqueos)
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',  // Esto evita errores CORS
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'email=' + encodeURIComponent(email)
    });
    console.log('Email guardado exitosamente');
  } catch (error) {
    console.log('Error guardando email (pero seguimos):', error);
  }

  // Simular extracción de la factura (valores realistas por defecto)
  const consumoTotal = 350; // kWh/mes estimado
  const gastoActual = 85;   // €/mes estimado

  // Espera 2 segundos para simular procesamiento
  setTimeout(() => {
    estado.textContent = "¡Ofertas calculadas! Mira cuánto ahorras:";
    mostrarResultados(consumoTotal, gastoActual);
  }, 2000);
}

function mostrarResultados(consumo, gastoActual) {
  const resultado = document.getElementById("resultado");
  resultado.style.display = "block";

  let html = '<h2 style="grid-column: 1/-1; text-align: center; color: #a5f3fc; margin-bottom: 30px;">¡Tus mejores ofertas personalizadas!</h2>';

  tarifas.forEach(t => {
    // Cálculo simple y realista
    const precioMedioKwh = (t.precio_kwh_punta + t.precio_kwh_llano + t.precio_kwh_valle) / 3;
    const costeEnergia = consumo * precioMedioKwh;
    const costePotencia = (t.potencia_punta * 4.6 * 30) + (t.potencia_valle * 4.6 * 30); // Estimado
    let costeTotalMes = (costeEnergia + costePotencia + 15) / 100; // Ajuste aproximado
    let costeConDescuento = costeTotalMes * (1 - t.descuento_primer_ano / 100);
    let ahorroAnual = Math.round((gastoActual - costeConDescuento) * 12);

    html += `
      <div class="tarifa">
        <div class="empresa">${t.empresa}</div>
        <div style="color: #94a3b8; margin: 10px 0; font-size: 1.1rem;">${t.nombre}</div>
        <div class="precio">${costeConDescuento.toFixed(0)} € <small>/mes</small></div>
        <div class="ahorro">¡Ahorras ${ahorroAnual > 0 ? ahorroAnual : 0} € al año!</div>
        <div style="margin-top: 15px; color: #94a3b8; font-size: 0.9rem;">Descuento: -${t.descuento_primer_ano}% primer año</div>
      </div>
    `;
  });

  resultado.innerHTML = html;
}

// Cargar tarifas al iniciar la página
window.addEventListener('load', () => {
  console.log('Página cargada, listo para comparar');
});
