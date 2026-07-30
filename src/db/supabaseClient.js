// src/db/supabaseClient.js
// Este archivo crea UNA sola conexión a Supabase que todo el backend reutiliza.
//
// IMPORTANTE: aquí usamos la "Service Role Key", NO la "anon key" que usa el frontend.
// La Service Role Key tiene permisos completos (puede saltarse las reglas RLS),
// por eso vive SOLO en el backend y nunca se comparte ni se sube a GitHub.

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "Advertencia: faltan variables de entorno de Supabase. Revisa tu archivo .env"
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
