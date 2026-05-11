const API_URL = "http://localhost:3000/personas";

// Cargar personas al iniciar
document.addEventListener("DOMContentLoaded", cargarPersonas);

// Obtener todas las personas
async function cargarPersonas() {
  const res = await fetch(API_URL);
  const personas = await res.json();

  const tabla = document.getElementById("tablaPersonas");
  tabla.innerHTML = "";

  personas.forEach(p => {
    tabla.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>${p.email}</td>
        <td>${p.edad}</td>
        <td class="actions">
          <button onclick="editarPersona(${p.id}, '${p.nombre}', '${p.email}', ${p.edad})">Editar</button>
          <button onclick="eliminarPersona(${p.id})">Eliminar</button>
        </td>
      </tr>
    `;
  });
}

// Guardar o actualizar persona
document.getElementById("personaForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("id").value;
  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const edad = document.getElementById("edad").value;

  const persona = { nombre, email, edad };

  if (id) {
    // Actualizar
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(persona)
    });
  } else {
    // Crear
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(persona)
    });
  }

  e.target.reset();
  cargarPersonas();
});

// Llenar formulario para editar
function editarPersona(id, nombre, email, edad) {
  document.getElementById("id").value = id;
  document.getElementById("nombre").value = nombre;
  document.getElementById("email").value = email;
  document.getElementById("edad").value = edad;
}

// Eliminar persona
async function eliminarPersona(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  cargarPersonas();
}

