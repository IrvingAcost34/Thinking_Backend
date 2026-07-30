// src/index.js
// Este es el archivo principal que enciende el servidor backend.
// Aquí se "conectan" todas las rutas (upload, analyze, generate).

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const uploadRoutes = require("./routes/upload");
const analyzeRoutes = require("./routes/analyze");
const generateRoutes = require("./routes/generate");

const app = express();

// Permite que el frontend (GitHub Pages) pueda hacer peticiones a este backend
app.use(cors());

// Permite recibir JSON en las peticiones
app.use(express.json());

// Conectamos cada grupo de rutas a su "camino" en la URL
app.use("/api/upload", uploadRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/generate", generateRoutes);

// Ruta simple para comprobar que el servidor está vivo
app.get("/", (req, res) => {
  res.json({ status: "ok", mensaje: "Thinking Backend funcionando correctamente" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
