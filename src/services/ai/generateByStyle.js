// src/services/ai/generateByStyle.js
// Le pide a Groq que genere el contenido del estilo Visual.

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

async function generarContenidoPorEstilo(analisisJson, estilo) {
  const plantillaPrompt = PROMPTS_POR_ESTILO[estilo];

  if (!plantillaPrompt) {
    throw new Error(`Estilo no soportado todavía: ${estilo}`);
  }

  const prompt = plantillaPrompt.replace(
    "{{ANALISIS_JSON}}",
    JSON.stringify(analisisJson)
  );

  const respuesta = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    console.error("Error de Groq:", datos);
    throw new Error(datos.error?.message || "Error al llamar a Groq");
  }

  const textoRespuesta = datos.choices[0].message.content
    .replace(/```json|```/g, "")
    .trim();

  try {
    return JSON.parse(textoRespuesta);
  } catch (error) {
    console.error("Groq no devolvió un JSON válido:", textoRespuesta);
    throw new Error("No se pudo interpretar la respuesta de la IA.");
  }
}

module.exports = { generarContenidoPorEstilo };
