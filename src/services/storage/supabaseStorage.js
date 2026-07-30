// src/services/storage/supabaseStorage.js
// Este servicio sube los archivos ya generados (PDF, DOCX, etc.) a Supabase Storage,
// organizados por trabajo (job_id) y por estilo, siguiendo esta estructura:
//
// materiales-generados/{job_id}/visual/Resumen-Visual.pdf
// materiales-generados/{job_id}/auditivo/Guion.docx   <-- (futuro)
// materiales-generados/{job_id}/kinestesico/...        <-- (futuro)

const supabase = require("../../db/supabaseClient");

const NOMBRE_BUCKET = "materiales-generados";

/**
 * Sube un archivo generado a Supabase Storage y devuelve su URL pública/firmada.
 * @param {object} params
 * @param {Buffer} params.buffer - Contenido del archivo generado.
 * @param {string} params.jobId - ID del trabajo (material_jobs.id).
 * @param {string} params.estilo - "visual" | "auditivo" | "kinestesico".
 * @param {string} params.nombreArchivo - Nombre final del archivo, ej. "Resumen-Visual.pdf".
 * @returns {Promise<string>} URL del archivo subido.
 */
async function subirArchivoGenerado({ buffer, jobId, estilo, nombreArchivo }) {
  const rutaEnBucket = `${jobId}/${estilo}/${nombreArchivo}`;

  const { error } = await supabase.storage
    .from(NOMBRE_BUCKET)
    .upload(rutaEnBucket, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    console.error("Error al subir el archivo a Supabase Storage:", error);
    throw new Error("No se pudo subir el archivo generado.");
  }

  // Generamos una URL firmada válida por 7 días (el profesor puede descargarla)
  const { data, error: errorUrl } = await supabase.storage
    .from(NOMBRE_BUCKET)
    .createSignedUrl(rutaEnBucket, 60 * 60 * 24 * 7);

  if (errorUrl) {
    console.error("Error al generar la URL firmada:", errorUrl);
    throw new Error("No se pudo generar el enlace de descarga.");
  }

  return data.signedUrl;
}

module.exports = { subirArchivoGenerado };
