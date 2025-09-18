async function verificarAdmin() {
  const res = await fetch('/api/session');
  const data = await res.json();
  if (data.role !== 'admin') {
    window.location.href = '/directorio/directorio.html';
  }
}

verificarAdmin();

document.querySelectorAll('[data-view]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const view = link.getAttribute('data-view');
    if (view === 'reservas') cargarReservas();
    if (view === 'restaurantes') cargarRestaurantes();
    if (view === 'usuarios') cargarUsuarios();
  });
});

async function cargarReservas() {
  // Aquí sería mejor un endpoint /api/admin/reservas que traiga todas
  const res = await fetch('/api/admin/reservas');
  const reservas = await res.json();
  const html = `
    <h2>Reservas Pendientes</h2>
    <table class="table">
      <thead><tr><th>ID</th><th>Cliente</th><th>Restaurante</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>
        ${reservas.map(r => `
          <tr>
            <td>${r.id}</td>
            <td>${r.nombre_cliente}</td>
            <td>${r.restaurante_nombre}</td>
            <td>${r.fecha_reserva} ${r.hora_reserva}</td>
            <td>${r.estado}</td>
            <td>
              <button class="btn btn-success btn-sm" onclick="actualizarReserva(${r.id}, 'confirmada')">Aceptar</button>
              <button class="btn btn-danger btn-sm" onclick="actualizarReserva(${r.id}, 'cancelada')">Rechazar</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  document.getElementById('view').innerHTML = html;
}

async function actualizarReserva(id, estado) {
  await fetch(`/api/reservas/${id}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado })
  });
  cargarReservas();
}

function cargarRestaurantes() {
  document.getElementById('view').innerHTML = '<h2>Gestión de Restaurantes</h2>';
}

function cargarUsuarios() {
  document.getElementById('view').innerHTML = '<h2>Gestión de Usuarios y Admins</h2>';
}
