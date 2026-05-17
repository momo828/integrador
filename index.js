import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import path from "path";

dotenv.config();
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3000;

// Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Middleware
app.use(cors());
app.use(express.json());

// Servir frontend
app.use(express.static("frontend"));

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.resolve("frontend/home.html"));
});

// Crear persona (sin archivos)
app.post("/personas", async (req, res) => {
  try {
    const {
      nombre,
      email,
      edad,
      foto_url,
      video_url,
      ubicacion_url,
      documento_url,
      instagram,
      linkedin
    } = req.body;

    const query = `
      INSERT INTO personas 
      (nombre, email, edad, foto_url, video_url, ubicacion_url, documento_url, instagram, linkedin)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
    `;

    const values = [
      nombre,
      email,
      edad,
      foto_url,
      video_url,
      ubicacion_url,
      documento_url,
      instagram,
      linkedin
    ];

    const result = await pool.query(query, values);

    res.json({
      mensaje: "Persona registrada correctamente",
      persona: result.rows[0]
    });

  } catch (error) {
    console.error("Error al registrar persona:", error);
    res.status(500).json({ error: "Error al registrar persona" });
  }
});

// Obtener personas
app.get("/personas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM personas ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener personas:", error);
    res.status(500).json({ error: "Error al obtener personas" });
  }
});

// Eliminar persona
app.delete("/personas/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("DELETE FROM personas WHERE id=$1", [id]);
    res.json({ mensaje: "Persona eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar persona:", error);
    res.status(500).json({ error: "Error al eliminar persona" });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
