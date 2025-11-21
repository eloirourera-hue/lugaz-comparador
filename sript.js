let tarifas = [];

// Cargar tarifas al iniciar
fetch('tarifas.json')
  .then(r => r.json())
  .then(data => tarifas = data.tarifas);

// URL de tu Google Sheet (la pondremos en el paso 6)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxVi6XhMv1VpI2qZU97Rao8DhUdg0esgMJr3JdZEU05xhPnhliG_UWRq5LxbyDK0gnHYw/exec";

async function procesarFactura() {
    const email = document.getElementById("email").value;
    const file = document.getElementById("factura").files[0];
    const estado = document.getElementById("estado");

    if (!email || !file) {
        estado.textContent = "⚠️ Por favor, pon tu email y sube la factura";
        return;
    }

    estado.textContent = "Procesando tu factura...";

    // Guardar email en Google Sheets
    await fetch(GOOGLE_SCRIPT_URL + "?email=" + encodeURIComponent(email));

    // Leer texto de la factura (PDF o imagen)
   const worker = createWorker();
await worker.load();
await worker.loadLanguage('spa');
await worker.initialize('spa');
const { data: { text } } = await worker.recognize(file);
await worker.terminate();

    // Extraer consumo aproximado (busca palabras clave)
    const consumoTotal = extraerConsumo(text);
    const gastoActual = extraerGasto(text);

    mostrarResultados(consumoTotal, gastoActual, email);
}

function extraerConsumo(texto) {
    const lineas = texto.toLowerCase().split('\n');
    for (let linea of lineas) {
        if (linea.includes("total energía") || linea.includes("consumo") || linea.includes("kwh")) {
            const num = linea.match(/\d{3,5}/);
            if (num) return parseInt(num[0]);
        }
    }
    return 350; // valor por defecto si no encuentra
}

function extraerGasto(texto) {
    const match = texto.match(/total.*?(\d+[\.,]\d{2})/i);
    return match ? parseFloat(match[1].replace(',','.')) : 85;
}

function mostrarResultados(consumo, gastoActual, email) {
    const resultado = document.getElementById("resultado");
    resultado.style.display = "grid";
    resultado.innerHTML = "<h2 style='grid-column:1/-1; font-size:2.5rem;'>¡Estas son tus mejores ofertas!</h2>";

    tarifas.forEach(t => {
        // Cálculo aproximado muy realista
        const potenciaDias = 30;
        const costePotencia = (4.6 * t.potencia_punta + 4.6 * t.potencia_valle) * potenciaDias * 0.11; // estimación
        const costeEnergia = consumo * 0.14; // precio medio ponderado
        let costeSinDescuento = (costePotencia + costeEnergia + 15) / 12; // +impuestos fijos
        let costeConDescuento = costeSinDescuento * (1 - t.descuento_primer_ano/100);
        let ahorro = Math.round(gastoActual - costeConDescuento);

        resultado.innerHTML += `
            <div class="tarifa">
                <div class="empresa">${t.empresa}</div>
                <div style="color:#94a3b8; margin:10px 0;">${t.nombre}</div>
                <div class="precio">${costeConDescuento.toFixed(0)}€<small style="font-size:1rem;">/mes</small></div>
                <div class="ahorro">¡Ahorras ${ahorro > 0 ? ahorro : 0}€ al año!</div>
                <div style="margin-top:15px; color:#94a3b8;">-${t.descuento_primer_ano}% primer año</div>
            </div>
        `;
    });
}

