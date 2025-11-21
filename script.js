let tarifas = [];

// Cargar tarifas
fetch('tarifas.json')
  .then(r => r.json())
  .then(data => tarifas = data.tarifas);

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxVi6XhMv1YpI2qZU97Rao8DhUdg0esgMJr3JdZEU05xhPnhiG_UWRq5LxbyD0QnHYw/exec";

async function procesarFactura() {
    const email = document.getElementById("email").value;
    const fileInput = document.getElementById("factura");
    const estado = document.getElementById("estado");

    if (!email || !fileInput.files[0]) {
        estado.textContent = "⚠️ Pon tu email y sube una factura";
        return;
    }

    estado.textContent = "¡Calculando tu ahorro...";

    // Guardar email en Google Sheets
    try {
        await fetch(GOOGLE_SCRIPT_URL + "?email=" + encodeURIComponent(email));
    } catch(e) {}

    // Valores simulados (para que veas que funciona YA)
    const consumoTotal = 380;
    const gastoActual = 92;

    mostrarResultados(consumoTotal, gastoActual);
}

function mostrarResultados(consumo, gastoActual) {
    const resultado = document.getElementById("resultado");
    resultado.style.display = "grid";
    resultado.innerHTML = "<h2 style='grid-column:1/-1; color:#a5f3fc; margin-bottom:30px;'>¡Tus mejores ofertas!</h2>";

    tarifas.forEach(t => {
        const potenciaDias = 30;
        const costePotencia = (4.6 * t.potencia_punta + 4.6 * t.potencia_valle) * potenciaDias * 0.11;
        const costeEnergia = consumo * ((t.precio_kwh_punta + t.precio_kwh_llano + t.precio_kwh_valle)/3);
        let costeSinDescuento = (costePotencia + costeEnergia + 18) / 12;
        let costeFinal = costeSinDescuento * (1 - t.descuento_primer_ano/100);
        let ahorro = Math.round(gastoActual - costeFinal);

        resultado.innerHTML += `
            <div class="tarifa">
                <div class="empresa">${t.empresa}</div>
                <div style="color:#94a3b8; margin:10px 0;">${t.nombre}</div>
                <div class="precio">${costeFinal.toFixed(0)}€<small style="font-size:1rem;">/mes</small></div>
                <div class="ahorro">Ahorras ${ahorro > 0 ? ahorro*12 : 0}€ al año</div>
                <div style="margin-top:15px; color:#94a3b8;">-${t.descuento_primer_ano}% el primer año</div>
            </div>
        `;
    });
}
