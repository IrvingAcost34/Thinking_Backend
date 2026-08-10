// src/routes/analyze.js
// Esta ruta se encarga de analizar el contenido del documento con IA.

const express = require("express");
const supabase = require("../db/supabaseClient");
const { extraerTextoPDF } = require("../services/extraction/pdf");
const { analizarDocumento } = require("../services/ai/analyzeDocument");

const router = express.Router();

router.post("/:job_id", async (req, res) => {
  const { job_id } = req.params;

  try {
    const { ruta_archivo } = req.body;

    if (!ruta_archivo) {
      return res.status(400).json({ error: "Falta la ruta del archivo a analizar." });
    }

    const textoExtraido = await extraerTextoPDF(ruta_archivo);
    const analisis = await analizarDocumento(textoExtraido);

    const { error } = await supabase
      .from("material_jobs")
      .update({
        estado: "analizado",
        tema_detectado: analisis.tema_principal,
        analisis_json: analisis,
      })
      .eq("id", job_id);

    if (error) {
      console.error("Error al actualizar el job:", error);
      return res.status(500).json({ error: "No se pudo guardar el análisis." });
    }

    return res.json({
      mensaje: "Documento analizado correctamente.",
      analisis,
    });
  } catch (err) {
    console.error("Error inesperado en /api/analyze:", err);
    return res.status(500).json({ error: "Error inesperado al analizar el documento." });
  }
});

module.exports = router;
