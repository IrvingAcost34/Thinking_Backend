// src/routes/generate.js
// Esta ruta genera el material final para el estilo elegido por el profesor.
//
// Flujo (MVP: solo estilo Visual, solo salida en PDF):
// 1. Recibe el "job_id" y el estilo elegido ("visual" en el MVP).
// 2. Le pide a la IA que genere el contenido estructurado (JSON) para ese estilo.
// 3. Convierte ese JSON en un PDF usando una plantilla HTML.
// 4. Sube el PDF generado a Supabase Storage.
// 5. Actualiza el estado del trabajo a "completado".

const express = require("express");
const supabase = require("../db/supabaseClient");
const { generarContenidoPorEstilo } = require("../services/ai/generateByStyle");
const { generarPDFDesdeHTML } = require("../services/render/toPDF");
const { subirArchivoGenerado } = require("../services/storage/supabaseStorage");

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

    // Obtenemos el análisis previo guardado en el paso anterior
    const { data: job, error: errorJob } = await supabase
      .from("material_jobs")
      .select("analisis_json")
      .eq("id", job_id)
      .single();

    if (errorJob || !job) {
      return res.status(404).json({ error: "No se encontró el análisis de este trabajo." });
    }

    const contenidoVisual = await generarContenidoPorEstilo(job.analisis_json, "visual");
    const bufferPDF = await generarPDFDesdeHTML(contenidoVisual);

    const urlArchivo = await subirArchivoGenerado({
      buffer: bufferPDF,
      jobId: job_id,
      estilo: "visual",
      nombreArchivo: "Resumen-Visual.pdf",
    });

    // Guardamos referencia del material generado
    await supabase.from("generated_materials").insert({
      job_id: job_id,
      estilo: "visual",
      tipo_archivo: "pdf",
      url_archivo: urlArchivo,
    });

    await supabase
      .from("material_jobs")
      .update({ estado: "completado" })
      .eq("id", job_id);

    return res.json({
      mensaje: "Material generado correctamente.",
      url_archivo: urlArchivo,
    });
  } catch (err) {
    console.error("Error inesperado en /api/generate:", err);
    return res.status(500).json({ error: "Error inesperado al generar el material." });
  }
});

module.exports = router;
