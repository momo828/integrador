import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3000;

// Conexión a PostgreSQL en Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
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
  const { nombre, email, edad } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO personas (nombre, email, edad) VALUES ($1, $2, $3) RETURNING *",
      [nombre, email, edad]
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
  const { nombre, email, edad } = req.body;
  try {
    const result = await pool.query(
      "UPDATE personas SET nombre = $1, email = $2, edad = $3 WHERE id = $4 RETURNING *",
      [nombre, email, edad, id]
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

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

