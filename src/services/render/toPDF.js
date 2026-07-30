// src/services/render/toPDF.js
// Este servicio toma el contenido estructurado (JSON) que devolvió la IA
// y lo convierte en un archivo PDF real, usando la plantilla HTML del estilo
// correspondiente y Puppeteer (que "imprime" HTML a PDF, igual que el navegador).

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

/**
 * Genera un PDF a partir del contenido visual estructurado.
 * @param {object} contenidoVisual - { titulo, resumen_visual, conceptos, flashcards }
 * @returns {Promise<Buffer>} El PDF generado, listo para subir a Supabase Storage.
 */
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

  // Reemplazamos los marcadores de la plantilla con el contenido real
  html = html
    .replace("{{TITULO}}", contenidoVisual.titulo || "Material de Estudio")
    .replace("{{RESUMEN_VISUAL}}", contenidoVisual.resumen_visual || "")
    .replace("{{CONCEPTOS_HTML}}", conceptosHTML)
    .replace("{{FLASHCARDS_HTML}}", flashcardsHTML);

  const navegador = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const pagina = await navegador.newPage();
  await pagina.setContent(html, { waitUntil: "networkidle0" });
  const bufferPDF = await pagina.pdf({ format: "A4", printBackground: true });
  await navegador.close();

  return bufferPDF;
}

module.exports = { generarPDFDesdeHTML };
