async function checkSessionWhenReady() {
    const loginItem = document.getElementById('loginItem');
    const userItem = document.getElementById('userItem');
    const userName = document.getElementById('userName');
    const adminBadge = document.getElementById('adminBadge');
    const btnLogout = document.getElementById('btnLogout');
    const btnRegistroUsuario = document.getElementById('btnRegistroUsuario'); // Botón "Registro de usuario"
    const btnGoRegistro = document.getElementById('btnGoRegistro'); // Botón "Registrarme" del modal acción

    if (!loginItem || !userItem) {
        return setTimeout(checkSessionWhenReady, 100);
    }

    // Detectar si estamos en tu página "Restaurante Sicilia"
    const esMiPagina = window.location.pathname.toLowerCase().includes('restaurante%20sicilia') 
                    || window.location.pathname.toLowerCase().includes('restaurante sicilia');

    try {
        const API = window.__API_BASE_URL || '';
        const res = await fetch(API + '/api/session');
        const data = await res.json();

        if (data.role) {
            // Ocultar botón login y mostrar info usuario
            loginItem.style.display = 'none';
            userItem.style.display = 'inline-block';

            if (data.role === 'admin') {
                userName.textContent = data.username || `Admin #${data.id}`;
                adminBadge.style.display = 'inline-block';
            } else {
                userName.textContent = data.nombre || `Usuario #${data.id}`;
                adminBadge.style.display = 'none';
            }

            // 🔹 Solo en la página Restaurante Sicilia bloqueamos el botón "Registro de usuario"
            if (esMiPagina && btnRegistroUsuario) {
                btnRegistroUsuario.disabled = true;
                btnRegistroUsuario.classList.add('btn-disabled');
                btnRegistroUsuario.title = 'Debes cerrar sesión para registrarte';
            }

            if (btnLogout) {
                btnLogout.addEventListener('click', async () => {
                    await fetch(API + '/api/logout', { method: 'POST' });
                    location.reload();
                });
            }
        } else {
            if (esMiPagina) {
                // En tu página → ocultar login/usuario si no hay sesión
                loginItem.style.display = 'none';
                userItem.style.display = 'none';

                // Aseguramos que el botón esté activo si no hay sesión
                if (btnRegistroUsuario) {
                    btnRegistroUsuario.disabled = false;
                    btnRegistroUsuario.classList.remove('btn-disabled');
                    btnRegistroUsuario.title = '';
                }
            } else {
                // En otras páginas → comportamiento normal
                loginItem.style.display = 'inline-block';
                userItem.style.display = 'none';
            }
        }
    } catch (err) {
        console.error('Error verificando sesión:', err);
    }
}

// 🔹 Ajuste para ocultar el botón de registro si se selecciona "Administrador"
document.addEventListener('DOMContentLoaded', () => {
    const btnAdmin = document.getElementById('btnAdmin');
    const btnUsuario = document.getElementById('btnUsuario');
    const btnGoRegistro = document.getElementById('btnGoRegistro');

    if (btnAdmin && btnGoRegistro) {
        btnAdmin.addEventListener('click', () => {
            btnGoRegistro.style.display = 'none'; // Oculta registro para admin
        });
    }

    if (btnUsuario && btnGoRegistro) {
        btnUsuario.addEventListener('click', () => {
            btnGoRegistro.style.display = 'inline-block'; // Muestra registro para usuario
        });
    }
});

checkSessionWhenReady();
