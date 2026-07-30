// src/services/ai/analyzeDocument.js
// Este servicio le pide a la IA (Claude) que "entienda" el documento:
// tema principal, resumen corto y conceptos clave.
//
// IMPORTANTE: le pedimos a la IA que responda SOLO en formato JSON,
// para que el resto del sistema pueda usar esa información sin ambigüedad.

const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Analiza el texto de un documento y devuelve su estructura principal.
 * @param {string} textoDocumento - Texto extraído del archivo original.
 * @returns {Promise<object>} Objeto con tema_principal, resumen_corto y conceptos_clave.
 */
async function analizarDocumento(textoDocumento) {
  const prompt = `
Analiza el siguiente documento educativo y responde ÚNICAMENTE con un JSON válido,
sin texto adicional, sin explicaciones, sin comillas de markdown.

El JSON debe tener exactamente esta forma:
{
  "tema_principal": "string",
  "resumen_corto": "string (máximo 3 oraciones)",
  "conceptos_clave": ["string", "string", "..."]
}

Usa solo información que esté presente en el documento. No inventes datos.

Documento:
"""
${textoDocumento}
"""
`;

  const respuesta = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  const textoRespuesta = respuesta.content
    .map((bloque) => bloque.text || "")
    .join("")
    .trim();

  try {
    return JSON.parse(textoRespuesta);
  } catch (error) {
    console.error("La IA no devolvió un JSON válido:", textoRespuesta);
    throw new Error("No se pudo interpretar la respuesta de la IA.");
  }
}

module.exports = { analizarDocumento };
