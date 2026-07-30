// src/services/ai/generateByStyle.js
// Este servicio toma el análisis previo del documento y le pide a la IA
// que genere el contenido específico para el estilo de aprendizaje elegido.
//
// MVP: solo implementamos el estilo "visual".
// Más adelante se agregan "auditivo" y "kinestesico" siguiendo el mismo patrón.

const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PROMPTS_POR_ESTILO = {
  visual: `
Con base en el siguiente análisis de un documento educativo, genera contenido
para el ESTILO VISUAL de aprendizaje. Responde ÚNICAMENTE con un JSON válido,
sin texto adicional, con esta forma exacta:

{
  "titulo": "string",
  "resumen_visual": "string (explicación breve, clara, apta para leer rápido)",
  "conceptos": [
    { "nombre": "string", "descripcion": "string breve" }
  ],
  "flashcards": [
    { "pregunta": "string", "respuesta": "string" }
  ]
}

No inventes información que no esté en el análisis proporcionado.

Análisis del documento:
"""
{{ANALISIS_JSON}}
"""
`,
};

/**
 * Genera el contenido estructurado para un estilo de aprendizaje específico.
 * @param {object} analisisJson - Resultado previo de analizarDocumento().
 * @param {string} estilo - "visual" | "auditivo" | "kinestesico" (MVP: solo "visual").
 * @returns {Promise<object>} Contenido estructurado listo para renderizar.
 */
async function generarContenidoPorEstilo(analisisJson, estilo) {
  const plantillaPrompt = PROMPTS_POR_ESTILO[estilo];

  if (!plantillaPrompt) {
    throw new Error(`Estilo no soportado todavía: ${estilo}`);
  }

  const prompt = plantillaPrompt.replace(
    "{{ANALISIS_JSON}}",
    JSON.stringify(analisisJson)
  );

  const respuesta = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
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

module.exports = { generarContenidoPorEstilo };
