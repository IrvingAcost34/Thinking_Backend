// src/services/extraction/pdf.js
// Este servicio se encarga de leer un archivo PDF y devolver su texto en formato plano.
// Usamos la librería "pdf-parse", que es simple y confiable para extraer texto.

const fs = require("fs");
const pdfParse = require("pdf-parse");

/**
 * Extrae el texto de un archivo PDF.
 * @param {string} rutaArchivo - Ruta local donde está guardado el PDF temporalmente.
 * @returns {Promise<string>} El texto completo extraído del PDF.
 */
async function extraerTextoPDF(rutaArchivo) {
  const bufferArchivo = fs.readFileSync(rutaArchivo);
  const resultado = await pdfParse(bufferArchivo);
  return resultado.text;
}

module.exports = { extraerTextoPDF };
