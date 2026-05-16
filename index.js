import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;

// Necesario para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Conexión a PostgreSQL en Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// ⭐ Servir frontend desde la carpeta "frontend"
app.use(express.static(path.join(__dirname, "frontend")));

// Ruta de prueba
app.get("/api", (req, res) => {
  res.send("API funcionando");
});

// Obtener todas las personas
app.get("/personas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM personas ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener personas" });
  }
});

// Obtener una persona por id
app.get("/personas/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM personas WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Persona no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener persona" });
  }
});

// Crear persona
app.post("/personas", async (req, res) => {
  const { nombre, email, edad, foto_url, video_url, ubicacion_url, documento_url, instagram, linkedin } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO personas (nombre, email, edad, foto_url, video_url, ubicacion_url, documento_url, instagram, linkedin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [nombre, email, edad, foto_url, video_url, ubicacion_url, documento_url, instagram, linkedin]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear persona" });
  }
});

// Actualizar persona
app.put("/personas/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, email, edad, foto_url, video_url, ubicacion_url, documento_url, instagram, linkedin } = req.body;
  try {
    const result = await pool.query(
      `UPDATE personas
       SET nombre = $1, email = $2, edad = $3, foto_url = $4, video_url = $5, ubicacion_url = $6, documento_url = $7, instagram = $8, linkedin = $9
       WHERE id = $10 RETURNING *`,
      [nombre, email, edad, foto_url, video_url, ubicacion_url, documento_url, instagram, linkedin, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Persona no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar persona" });
  }
});


// Eliminar persona
app.delete("/personas/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM personas WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Persona no encontrada" });
    }
    res.json({ mensaje: "Persona eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar persona" });
  }
});

// ⭐ Ruta final: si no es API, enviar el frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

