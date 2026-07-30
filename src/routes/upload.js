// src/routes/upload.js
// Esta ruta recibe el archivo que el profesor sube desde "Create-Material.html".
//
// Flujo de este archivo (MVP):
// 1. Recibe el archivo (por ahora, MVP: solo PDF).
// 2. Lo guarda temporalmente.
// 3. Crea un registro en la tabla "material_jobs" con estado "procesando".
// 4. Devuelve el "job_id" al frontend para que pueda preguntar el estado después.

const express = require("express");
const multer = require("multer");
const supabase = require("../db/supabaseClient");

const router = express.Router();

// Configuración simple: los archivos subidos se guardan temporalmente en /tmp
const upload = multer({ dest: "tmp/" });

router.post("/", upload.single("archivo"), async (req, res) => {
  try {
    const archivo = req.file;
    const { teacher_id } = req.body;

    if (!archivo) {
      return res.status(400).json({ error: "No se recibió ningún archivo." });
    }

    if (!teacher_id) {
      return res.status(400).json({ error: "Falta el ID del profesor (teacher_id)." });
    }

    // MVP: validamos que por ahora solo aceptamos PDF
    if (archivo.mimetype !== "application/pdf") {
      return res.status(400).json({
        error: "En esta primera versión (MVP) solo se aceptan archivos PDF.",
      });
    }

    // Creamos el registro del trabajo en la base de datos
    const { data, error } = await supabase
      .from("material_jobs")
      .insert({
        teacher_id: teacher_id,
        nombre_archivo_original: archivo.originalname,
        estado: "procesando",
      })
      .select()
      .single();

    if (error) {
      console.error("Error al crear el job en Supabase:", error);
      return res.status(500).json({ error: "No se pudo registrar el trabajo." });
    }

    // TODO (siguiente paso): aquí se dispararía el análisis con la IA,
    // usando el archivo guardado en "archivo.path".

    return res.json({
      mensaje: "Archivo recibido correctamente. Procesando...",
      job_id: data.id,
    });
  } catch (err) {
    console.error("Error inesperado en /api/upload:", err);
    return res.status(500).json({ error: "Error inesperado al procesar el archivo." });
  }
});

module.exports = router;
