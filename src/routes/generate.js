// src/routes/generate.js
// Genera el material final para el estilo elegido por el profesor.
// En vez de un PDF, guarda las flashcards como datos (JSON) para
// mostrarlas de forma interactiva dentro de Thinking.

const express = require("express");
const supabase = require("../db/supabaseClient");
const { generarContenidoPorEstilo } = require("../services/ai/generateByStyle");

const router = express.Router();

router.post("/:job_id", async (req, res) => {
  const { job_id } = req.params;
  const { estilo } = req.body; // MVP: solo "visual"

  try {
    if (estilo !== "visual") {
      return res.status(400).json({
        error: "En esta primera versión (MVP) solo está disponible el estilo Visual.",
      });
    }

    const { data: job, error: errorJob } = await supabase
      .from("material_jobs")
      .select("analisis_json")
      .eq("id", job_id)
      .single();

    if (errorJob || !job) {
      return res.status(404).json({ error: "No se encontró el análisis de este trabajo." });
    }

    const contenidoVisual = await generarContenidoPorEstilo(job.analisis_json, "visual");

    const { data: materialGuardado, error: errorInsert } = await supabase
      .from("generated_materials")
      .insert({
        job_id: job_id,
        estilo: "visual",
        tipo_archivo: "flashcards_visual",
        contenido_json: contenidoVisual,
      })
      .select()
      .single();

    if (errorInsert) {
      console.error("Error al guardar el material:", errorInsert);
      return res.status(500).json({ error: "No se pudo guardar el material generado." });
    }

    await supabase
      .from("material_jobs")
      .update({ estado: "completado" })
      .eq("id", job_id);

    return res.json({
      mensaje: "Material generado correctamente.",
      material_id: materialGuardado.id,
      contenido: contenidoVisual,
    });
  } catch (err) {
    console.error("Error inesperado en /api/generate:", err);
    return res.status(500).json({ error: "Error inesperado al generar el material." });
  }
});

module.exports = router;
