async function verificarAdmin() {
  const res = await fetch('/api/session', { credentials: 'include' });
  const data = await res.json();
  if (data.role !== 'admin') {
    window.location.href = '/directorio/directorio.html';
  }
}

verificarAdmin();

// Manejo de navegación del panel
document.querySelectorAll('[data-view]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const view = link.getAttribute('data-view');
    mostrarSeccion(view);
  });
});

function mostrarSeccion(view) {
  // Ocultar todas las secciones
  document.querySelectorAll('main section').forEach(sec => sec.style.display = 'none');

  if (view === 'reservas') {
    document.getElementById('sectionReservas').style.display = 'block';
    cargarReservas();
  }
  if (view === 'restaurantes') {
    document.getElementById('sectionRestaurantes').style.display = 'block';
    cargarRestaurantes();
  }
  if (view === 'usuarios') {
    document.getElementById('sectionUsuarios').style.display = 'block';
    cargarUsuarios();
  }
}

// ======== RESERVAS ========
async function cargarReservas() {
  const res = await fetch('/api/admin/reservas', { credentials: 'include' });
  const reservas = await res.json();
  renderReservas(reservas);
}

function renderReservas(lista) {
  const tbody = document.querySelector('#tablaReservas tbody');
  tbody.innerHTML = '';
  lista.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.restaurante_nombre}</td>
      <td>${r.nombre_cliente}</td>
      <td>${r.email_cliente}</td>
      <td>${r.telefono_cliente}</td>
      <td>${r.fecha_reserva}</td>
      <td>${r.hora_reserva}</td>
      <td>${r.numero_personas}</td>
      <td>${r.estado}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ======== RESTAURANTES ========
async function cargarRestaurantes() {
  const res = await fetch('/api/admin/restaurantes', { credentials: 'include' });

  const restaurantes = await res.json();
  renderRestaurantes(restaurantes);
}

function renderRestaurantes(lista) {
  const tbody = document.querySelector('#tablaRestaurantes tbody');
  tbody.innerHTML = '';
  lista.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.nombre}</td>
      <td>${r.tipo_comida}</td>
      <td>${r.ciudad}</td>
      <td>${r.activo ? 'Activo' : 'Inactivo'}</td>
      <td>${new Date(r.fecha_creacion).toLocaleDateString()}</td>
      <td><a href="${r.carpeta_html}" target="_blank">Ver página</a></td>
    `;
    tbody.appendChild(tr);
  });
}

// ======== USUARIOS/ADMINS ========
async function cargarUsuarios() {
  try {
    const res = await fetch('/api/admin/usuarios', { credentials: 'include' });
    const usuarios = await res.json();
    renderUsuarios(usuarios);
  } catch (error) {
    console.error('Error cargando usuarios/admins:', error);
  }
}

function renderUsuarios(lista) {
  const tbody = document.querySelector('#tablaUsuarios tbody');
  tbody.innerHTML = '';
  lista.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.nombre || u.username}</td>
      <td>${u.email}</td>
      <td>${u.rol}</td>
      <td>
        ${u.esActual ? 
          '<span class="text-muted">No puedes borrarte a ti mismo</span>' :
          `<button class="btn btn-danger btn-sm" onclick="eliminarUsuario(${u.id}, '${u.rol}')">Eliminar</button>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function eliminarUsuario(id, rol) {
  if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;
  try {
    await fetch(`/api/admin/usuarios/${id}?rol=${rol}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    cargarUsuarios();
  } catch (error) {
    console.error('Error eliminando usuario:', error);
  }
}

// ======== INICIO ========
document.addEventListener('DOMContentLoaded', () => {
  // Por defecto, mostrar Restaurantes al entrar
  mostrarSeccion('restaurantes');
});
