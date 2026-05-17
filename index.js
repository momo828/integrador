import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import multer from "multer";
import path from "path";

dotenv.config();
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3000;

// ⭐ Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ⭐ Middleware
app.use(cors());
app.use(express.json());

// ⭐ Carpeta pública para imágenes subidas
app.use("/uploads", express.static("uploads"));

// ⭐ Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ⭐ Servir frontend
app.use(express.static("frontend"));

// ⭐ Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.resolve("frontend/home.html"));
});

// ⭐ Crear persona (con imagen)
app.post("/personas", upload.single("foto"), async (req, res) => {
  try {
    const foto = req.file ? "/uploads/" + req.file.filename : null;

    const {
      nombre,
      email,
      edad,
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
      foto,
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

// ⭐ Obtener todas las personas
app.get("/personas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM personas ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener personas:", error);
    res.status(500).json({ error: "Error al obtener personas" });
  }
});

// ⭐ Actualizar persona (opcional si lo necesitas)
app.put("/personas/:id", upload.single("foto"), async (req, res) => {
  try {
    const id = req.params.id;
    const foto = req.file ? "/uploads/" + req.file.filename : req.body.foto_url;

    const {
      nombre,
      email,
      edad,
      video_url,
      ubicacion_url,
      documento_url,
      instagram,
      linkedin
    } = req.body;

    const query = `
      UPDATE personas SET
      nombre=$1, email=$2, edad=$3, foto_url=$4, video_url=$5,
      ubicacion_url=$6, documento_url=$7, instagram=$8, linkedin=$9
      WHERE id=$10 RETURNING *;
    `;

    const values = [
      nombre,
      email,
      edad,
      foto,
      video_url,
      ubicacion_url,
      documento_url,
      instagram,
      linkedin,
      id
    ];

    const result = await pool.query(query, values);

    res.json({
      mensaje: "Persona actualizada correctamente",
      persona: result.rows[0]
    });

  } catch (error) {
    console.error("Error al actualizar persona:", error);
    res.status(500).json({ error: "Error al actualizar persona" });
  }
});

// ⭐ Eliminar persona
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

// ⭐ Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
