// src/services/render/toPDF.js
// Convierte el contenido generado por la IA en un PDF real.
// Usa @sparticuz/chromium: una versión de Chrome empaquetada especialmente
// para funcionar en servidores como Render, sin problemas de instalación.

const fs = require("fs");
const path = require("path");
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

async function generarPDFDesdeHTML(contenidoVisual) {
  const rutaPlantilla = path.join(
    __dirname,
    "../../../templates/visual/resumen.html"
  );
  let html = fs.readFileSync(rutaPlantilla, "utf-8");

  const conceptosHTML = (contenidoVisual.conceptos || [])
    .map(
      (c) =>
        `<div class="concepto"><strong>${c.nombre}</strong>: ${c.descripcion}</div>`
    )
    .join("");

  const flashcardsHTML = (contenidoVisual.flashcards || [])
    .map(
      (f) =>
        `<div class="flashcard"><div class="pregunta">${f.pregunta}</div><div class="respuesta">${f.respuesta}</div></div>`
    )
    .join("");

  html = html
    .replace("{{TITULO}}", contenidoVisual.titulo || "Material de Estudio")
    .replace("{{RESUMEN_VISUAL}}", contenidoVisual.resumen_visual || "")
    .replace("{{CONCEPTOS_HTML}}", conceptosHTML)
    .replace("{{FLASHCARDS_HTML}}", flashcardsHTML);

  const navegador = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const pagina = await navegador.newPage();
  await pagina.setContent(html, { waitUntil: "networkidle0" });
  const bufferPDF = await pagina.pdf({ format: "A4", printBackground: true });
  await navegador.close();

  return bufferPDF;
}

module.exports = { generarPDFDesdeHTML };
