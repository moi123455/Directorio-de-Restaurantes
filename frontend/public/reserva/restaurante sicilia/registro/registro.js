// === LOGIN USUARIO ===
document.getElementById('formLoginUsuario')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmailUsuario').value.trim();
    const password = document.getElementById('loginPasswordUsuario').value.trim();

    const res = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (res.ok) {
        alert('Sesión iniciada');
        window.location.href = '/';
    } else {
        alert('Credenciales incorrectas');
    }
});

// === REGISTRO USUARIO ===
document.getElementById('formRegistroUsuario')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('regNombreUsuario').value.trim();
    const email = document.getElementById('regEmailUsuario').value.trim();
    const password = document.getElementById('regPasswordUsuario').value.trim();
    const confirm = document.getElementById('regConfirmPasswordUsuario').value.trim();

    if (password !== confirm) return alert('Las contraseñas no coinciden');

    const res = await fetch('/api/usuarios/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
    });

    if (res.ok) {
        alert('Registro exitoso');
        location.reload();
    } else {
        alert('Error en el registro');
    }
});

// === LOGIN ADMIN ===
document.getElementById('formLoginAdmin')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsernameAdmin').value.trim();
    const password = document.getElementById('loginPasswordAdmin').value.trim();

    const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (res.ok) {
        alert('Sesión de administrador iniciada');
        window.location.href = '/';
    } else {
        alert('Credenciales incorrectas');
    }
});

// === REGISTRO ADMIN ===
document.getElementById('formRegistroAdmin')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre_completo = document.getElementById('regNombreCompletoAdmin').value.trim();
    const email = document.getElementById('regEmailAdmin').value.trim();
    const username = document.getElementById('regUsernameAdmin').value.trim();
    const password = document.getElementById('regPasswordAdmin').value.trim();

    const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_completo, email, username, password })
    });

    if (res.ok) {
        alert('Registro exitoso');
        location.reload();
    } else {
        alert('Error en el registro');
    }
});
