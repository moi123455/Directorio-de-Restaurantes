async function checkSessionWhenReady() {
    const loginItem = document.getElementById('loginItem');
    const userItem = document.getElementById('userItem');
    const userName = document.getElementById('userName');
    const adminBadge = document.getElementById('adminBadge');
    const btnLogout = document.getElementById('btnLogout');

    if (!loginItem || !userItem) {
        return setTimeout(checkSessionWhenReady, 100);
    }

    // Detectar si estamos en tu página "restaurante sicilia"
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

            if (btnLogout) {
                btnLogout.addEventListener('click', async () => {
                    await fetch(API + '/api/logout', { method: 'POST' });
                    location.reload();
                });
            }
        } else {
            if (esMiPagina) {
                // En tu página → ocultar siempre el botón y la sección si no hay sesión
                loginItem.style.display = 'none';
                userItem.style.display = 'none';
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

checkSessionWhenReady();
