// src/services/ai/analyzeDocument.js
// Le pide a Groq (gratis) que "entienda" el documento.

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

module.exports = { analizarDocumento };
