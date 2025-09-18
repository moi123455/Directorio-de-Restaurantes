// Detectar si estamos en local o en producción
const API_BASE = window.location.hostname.includes('localhost')
  ? ''
  : 'https://directorio-de-restaurantes.onrender.com';

// ======== VERIFICAR ADMIN ========
async function verificarAdmin() {
  const res = await fetch(`${API_BASE}/api/session`, { credentials: 'include' });
  const data = await res.json();
  if (data.role !== 'admin') {
    window.location.href = '/directorio/directorio.html';
  }
}

verificarAdmin();

// ======== NAVEGACIÓN DEL PANEL ========
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
  const res = await fetch(`${API_BASE}/api/admin/reservas`, { credentials: 'include' });
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
      <td>
        <span class="badge bg-${r.estado === 'confirmada' ? 'success' : r.estado === 'cancelada' ? 'danger' : 'secondary'}">
          ${r.estado}
        </span>
        <div class="mt-1">
          <button class="btn btn-sm btn-success" onclick="cambiarEstadoReserva(${r.id}, 'confirmada')">Confirmar</button>
          <button class="btn btn-sm btn-danger" onclick="cambiarEstadoReserva(${r.id}, 'cancelada')">Cancelar</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function cambiarEstadoReserva(id, nuevoEstado) {
  if (!confirm(`¿Seguro que quieres marcar esta reserva como ${nuevoEstado}?`)) return;
  try {
    await fetch(`${API_BASE}/api/reservas/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ estado: nuevoEstado })
    });
    cargarReservas();
  } catch (error) {
    console.error('Error cambiando estado de reserva:', error);
  }
}

// ======== RESTAURANTES ========
async function cargarRestaurantes() {
  const res = await fetch(`${API_BASE}/api/admin/restaurantes`, { credentials: 'include' });
  const restaurantes = await res.json();
  renderRestaurantes(restaurantes);
}

function renderRestaurantes(lista) {
  const tbody = document.querySelector('#tablaRestaurantes tbody');
  tbody.innerHTML = '';
  lista.forEach(r => {
    const fecha = r.fecha_creacion ? new Date(r.fecha_creacion).toLocaleDateString() : '—';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.nombre}</td>
      <td>${r.tipo_comida || '—'}</td>
      <td>${r.ciudad || '—'}</td>
      <td>${r.activo ? 'Activo' : 'Inactivo'}</td>
      <td>${fecha}</td>
      <td>${r.carpeta_html ? `<a href="${r.carpeta_html}" target="_blank">Ver página</a>` : '—'}</td>
      <td>
        ${(r.id === 1 || r.id === 2)
          ? '<span class="text-muted">Default</span>'
          : `<button class="btn btn-danger btn-sm" onclick="eliminarRestaurante(${r.id})">Eliminar</button>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function eliminarRestaurante(id) {
  if (!confirm('¿Seguro que quieres eliminar este restaurante?')) return;
  try {
    await fetch(`${API_BASE}/api/admin/restaurantes/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    cargarRestaurantes();
  } catch (error) {
    console.error('Error eliminando restaurante:', error);
  }
}

// ======== USUARIOS/ADMINS ========
async function cargarUsuarios() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/usuarios`, { credentials: 'include' });
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
        ${u.esActual 
          ? '<span class="text-muted">No puedes borrarte a ti mismo</span>'
          : `<button class="btn btn-danger btn-sm" onclick="eliminarUsuario(${u.id}, '${u.rol}')">Eliminar</button>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function eliminarUsuario(id, rol) {
  if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;
  try {
    await fetch(`${API_BASE}/api/admin/usuarios/${id}?rol=${rol}`, {
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
