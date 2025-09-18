// ==================== DEPENDENCIAS ====================
const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
require('dotenv').config();

// ==================== CONFIGURACIÓN APP ====================
const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES GLOBALES ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesiones
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use(session({
    secret: 'clave_secreta_segura', // cámbiala por algo más robusto en producción
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // true si usas HTTPS
}));

// ==================== ARCHIVOS ESTÁTICOS ====================
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/reserva', express.static(path.join(__dirname, 'public', 'reserva')));

// ==================== RUTAS BASE ====================
// Ruta raíz → directorio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/directorio/directorio.html'));
});

// Compatibilidad con enlaces antiguos
app.get('/directorio.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/directorio/directorio.html'));
});

app.get('/añadirrestaurante/agregar_restaurante.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/añadirrestaurante/agregar_restaurante.html'));
});


// Compatibilidad con enlaces antiguos
app.get('/directorio.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'directorio', 'directorio.html'));
});

app.get('/añadirrestaurante/agregar_restaurante.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'añadirrestaurante', 'agregar_restaurante.html'));
});

// ==================== CONFIGURACIÓN MULTER ====================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    }
});

// ==================== CONFIGURACIÓN BASE DE DATOS ====================
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'directorio_restaurantes',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    connectTimeout: 20000 // 20 segundos para evitar timeout rápido
};


let db;

// Función para conectar a la base de datos
async function connectDB() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('Conectado a la base de datos MySQL');
        await createTables();
    } catch (error) {
        console.error('Error conectando a la base de datos:', error);
        process.exit(1);
    }
}


// ==================== RUTA API: OBTENER RESTAURANTES ====================
app.get('/api/restaurantes', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT nombre, descripcion, imagen, carpeta_html FROM restaurantes WHERE activo = true ORDER BY fecha_creacion DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo restaurantes:', error);
        res.status(500).json({ error: 'Error al obtener restaurantes' });
    }
});

// ==================== CONFIGURACIÓN NODEMAILER ====================
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function enviarCorreo(destinatario, asunto, mensaje) {
    try {
        await transporter.sendMail({
            from: `"Directorio Restaurantes" <${process.env.SMTP_USER}>`,
            to: destinatario,
            subject: asunto,
            text: mensaje
        });
        console.log(`Correo enviado a ${destinatario}`);
    } catch (error) {
        console.error('Error enviando correo:', error);
    }
}


// ==================== CREACIÓN DE TABLAS ====================
async function createTables() {
    const createUsuariosTable = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createAdministradoresTable = `
        CREATE TABLE IF NOT EXISTS administradores (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            nombre_completo VARCHAR(255),
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createRestaurantesTable = `
        CREATE TABLE IF NOT EXISTS restaurantes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            propietario VARCHAR(255) NOT NULL,
            telefono VARCHAR(20) NOT NULL,
            email VARCHAR(255) NOT NULL,
            direccion TEXT NOT NULL,
            ciudad VARCHAR(100) NOT NULL,
            tipo_comida VARCHAR(100) NOT NULL,
            descripcion TEXT NOT NULL,
            platos_especiales TEXT,
            horario_apertura TIME,
            horario_cierre TIME,
            dias_atencion VARCHAR(255),
            rango_precios ENUM('economico', 'moderado', 'alto', 'premium'),
            imagen VARCHAR(255),
            redes_sociales VARCHAR(255),
            comentarios TEXT,
            slug VARCHAR(255) UNIQUE NOT NULL,
            carpeta_html VARCHAR(255),
            activo BOOLEAN DEFAULT true,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;

    const createReservasTable = `
        CREATE TABLE IF NOT EXISTS reservas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            restaurante_id INT NOT NULL,
            nombre_cliente VARCHAR(255) NOT NULL,
            email_cliente VARCHAR(255) NOT NULL,
            telefono_cliente VARCHAR(20) NOT NULL,
            fecha_reserva DATE NOT NULL,
            hora_reserva TIME NOT NULL,
            numero_personas INT NOT NULL,
            comentarios_especiales TEXT,
            estado ENUM('pendiente', 'confirmada', 'cancelada') DEFAULT 'pendiente',
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id) ON DELETE CASCADE
        )
    `;

    try {
        await db.execute(createUsuariosTable);
        await db.execute(createAdministradoresTable);
        await db.execute(createRestaurantesTable);
        await db.execute(createReservasTable);
        console.log('Tablas creadas exitosamente');
    } catch (error) {
        console.error('Error creando tablas:', error);
    }
}

// ==================== FUNCIONES AUXILIARES ====================

// Generar slug único a partir del nombre
function generateSlug(name) {
    return name
        .normalize('NFD') // elimina acentos
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Date.now();
}


// Función para generar página HTML del restaurante
async function generateRestaurantPage(restaurante) {
    const template = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${restaurante.nombre} - Directorio de Restaurantes</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            background: rgba(255,255,255,0.2);
            border-radius: 25px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }
        
        .back-link:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
        
        .restaurant-card {
            background: rgba(255,255,255,0.95);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            backdrop-filter: blur(20px);
        }
        
        .restaurant-header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .restaurant-image {
            width: 300px;
            height: 200px;
            object-fit: cover;
            border-radius: 15px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .restaurant-name {
            font-size: 2.5rem;
            color: #2c3e50;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .restaurant-type {
            font-size: 1.2rem;
            color: #7f8c8d;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .info-section {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            padding: 25px;
            border-radius: 15px;
            border-left: 5px solid #667eea;
        }
        
        .info-title {
            font-size: 1.3rem;
            color: #2c3e50;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .info-content {
            color: #555;
            line-height: 1.6;
        }
        
        .price-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .price-economico { background: #27ae60; color: white; }
        .price-moderado { background: #f39c12; color: white; }
        .price-alto { background: #e74c3c; color: white; }
        .price-premium { background: #9b59b6; color: white; }
        
        .reservation-section {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
        }
        
        .reservation-title {
            font-size: 2rem;
            margin-bottom: 20px;
        }
        
        .reservation-form {
            max-width: 600px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .form-group {
            text-align: left;
        }
        
        .form-group.full-width {
            grid-column: 1 / -1;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 10px;
            background: rgba(255,255,255,0.9);
            font-size: 1rem;
        }
        
        .btn-reserve {
            grid-column: 1 / -1;
            padding: 15px 30px;
            background: #27ae60;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-reserve:hover {
            background: #219a52;
            transform: translateY(-2px);
        }
        
        .success-message {
            display: none;
            background: #27ae60;
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
            text-align: center;
        }
        
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .restaurant-card { padding: 20px; }
            .restaurant-name { font-size: 2rem; }
            .info-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>

<body>
<header class="main-header">
    <nav>
        <ul>
            <li id="loginItem">
                <button id="btnOpenLogin" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalRol">
    Login / Registro
</button>

            </li>
            <li id="userItem" style="display:none;">
                <span id="userName" style="font-weight:bold;"></span>
                <span id="adminBadge" style="display:none; background:yellow; color:black; padding:2px 6px; border-radius:4px; font-weight:bold; margin-left:5px;">ADMIN</span>
                <button id="btnLogout" class="btn btn-danger btn-sm" style="margin-left:10px;">Cerrar sesión</button>
            </li>
        </ul>
    </nav>
</header>
    <div class="container">
        <a href="../../directorio.html" class="back-link">← Volver al Directorio</a>
        
        <div class="restaurant-card">
            <div class="restaurant-header">
                ${restaurante.imagen ? `<img src="../../uploads/${restaurante.imagen}" alt="${restaurante.nombre}" class="restaurant-image">` : ''}
                <h1 class="restaurant-name">${restaurante.nombre}</h1>
                <p class="restaurant-type">${restaurante.tipo_comida}</p>
            </div>
            
            <div class="info-grid">
                <div class="info-section">
                    <h3 class="info-title"><i class="fas fa-info-circle"></i> Información</h3>
                    <div class="info-content">
                        <p><strong>Propietario:</strong> ${restaurante.propietario}</p>
                        <p><strong>Teléfono:</strong> ${restaurante.telefono}</p>
                        <p><strong>Email:</strong> ${restaurante.email}</p>
                        <p><strong>Dirección:</strong> ${restaurante.direccion}</p>
                        <p><strong>Ciudad:</strong> ${restaurante.ciudad}</p>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3 class="info-title"><i class="fas fa-clock"></i> Horarios</h3>
                    <div class="info-content">
                        <p><strong>Días:</strong> ${restaurante.dias_atencion || 'No especificado'}</p>
                        <p><strong>Horario:</strong> ${restaurante.horario_apertura || 'No especificado'} - ${restaurante.horario_cierre || 'No especificado'}</p>
                        ${restaurante.rango_precios ? `<p><strong>Precios:</strong> <span class="price-badge price-${restaurante.rango_precios}">${restaurante.rango_precios}</span></p>` : ''}
                    </div>
                </div>
                
                <div class="info-section full-width">
                    <h3 class="info-title"><i class="fas fa-utensils"></i> Descripción</h3>
                    <div class="info-content">
                        <p>${restaurante.descripcion}</p>
                        ${restaurante.platos_especiales ? `<p><strong>Platos especiales:</strong> ${restaurante.platos_especiales}</p>` : ''}
                    </div>
                </div>
                
                ${restaurante.redes_sociales ? `
                <div class="info-section">
                    <h3 class="info-title"><i class="fas fa-share-alt"></i> Redes Sociales</h3>
                    <div class="info-content">
                        <a href="${restaurante.redes_sociales}" target="_blank" style="color: #667eea; text-decoration: none;">
                            <i class="fas fa-external-link-alt"></i> Visitar
                        </a>
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="reservation-section">
                <h2 class="reservation-title">Reservar Mesa</h2>
                <p style="margin-bottom: 30px;">Asegura tu lugar en ${restaurante.nombre}</p>
                
                <form class="reservation-form" id="reservationForm">
                    <input type="hidden" name="restaurante_id" value="${restaurante.id}">
                    
                    <div class="form-group">
                        <label for="nombre">Nombre Completo *</label>
                        <input type="text" id="nombre" name="nombre" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email *</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="telefono">Teléfono *</label>
                        <input type="tel" id="telefono" name="telefono" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="personas">Número de Personas *</label>
                        <input type="number" id="personas" name="personas" min="1" max="20" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="fecha">Fecha *</label>
                        <input type="date" id="fecha" name="fecha" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="hora">Hora *</label>
                        <input type="time" id="hora" name="hora" required>
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="comentarios">Comentarios Especiales</label>
                        <textarea id="comentarios" name="comentarios" rows="3" placeholder="Alergias, ocasión especial, etc."></textarea>
                    </div>
                    
                    <button type="submit" class="btn-reserve">Reservar Mesa</button>
                </form>
                
                <div class="success-message" id="successMessage">
                    ¡Reserva enviada exitosamente! Te contactaremos pronto para confirmar.
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Establecer fecha mínima como hoy
        document.getElementById('fecha').min = new Date().toISOString().split('T')[0];
        
        document.getElementById('reservationForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch('/api/reservas', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    document.getElementById('successMessage').style.display = 'block';
                    this.reset();
                    document.getElementById('fecha').min = new Date().toISOString().split('T')[0];
                } else {
                    alert('Error al enviar la reserva. Por favor intenta nuevamente.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al enviar la reserva. Por favor intenta nuevamente.');
            }
        });
    </script>
    <script>
        function makeReservation(restaurantName, phone) {
            const message = 'Hola, me gustaría hacer una reservación en ' + restaurantName + '. ¿Podrían ayudarme con la disponibilidad?';
            const whatsappUrl = 'https://wa.me/' + phone.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(message);
            window.open(whatsappUrl, '_blank');
        }
    </script>
  <!-- Bootstrap -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>


<!-- Contenedor para modales -->
<div id="modals-container"></div>

<script>
fetch('/partials/auth-modals.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('modals-container').innerHTML = html;

    let currentRole = null;

    // Abrir modal de rol
    document.getElementById('btnOpenLogin').addEventListener('click', () => {
      new bootstrap.Modal(document.getElementById('modalRol')).show();
    });

    // Elegir rol y pasar al modal de acción
    document.getElementById('btnUsuario').addEventListener('click', () => {
      currentRole = 'usuario';
      bootstrap.Modal.getInstance(document.getElementById('modalRol')).hide();
      new bootstrap.Modal(document.getElementById('modalAccion')).show();
    });

    document.getElementById('btnAdmin').addEventListener('click', () => {
      currentRole = 'admin';
      bootstrap.Modal.getInstance(document.getElementById('modalRol')).hide();
      new bootstrap.Modal(document.getElementById('modalAccion')).show();
    });

    // Pasar a login o registro
    document.getElementById('btnGoLogin').addEventListener('click', () => {
      bootstrap.Modal.getInstance(document.getElementById('modalAccion')).hide();
      new bootstrap.Modal(document.getElementById('modalLogin')).show();
    });

    document.getElementById('btnGoRegistro').addEventListener('click', () => {
      bootstrap.Modal.getInstance(document.getElementById('modalAccion')).hide();
      new bootstrap.Modal(document.getElementById('modalRegistro')).show();
    });

    // LOGIN
    document.getElementById('formLogin').addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailOrUser = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      const url = currentRole === 'admin' ? '/api/admin/login' : '/api/usuarios/login';
      const body = currentRole === 'admin'
        ? { username: emailOrUser, password }
        : { email: emailOrUser, password };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalLogin')).hide();
        if (currentRole === 'admin') {
          window.open('/phpmyadmin', '_blank');
        }
        location.reload();
      } else {
        alert(data.error || 'Error en la autenticación');
      }
    });

    // REGISTRO
    document.getElementById('formRegistro').addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre = document.getElementById('regNombre').value;
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;

      const url = currentRole === 'admin' ? '/api/admin/register' : '/api/usuarios/register';
      const body = currentRole === 'admin'
        ? { username: prompt("Introduce un nombre de usuario:"), email, password, nombre_completo: nombre }
        : { nombre, email, password };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalRegistro')).hide();
        location.reload();
      } else {
        alert(data.error || 'Error en el registro');
      }
    });

    // LOGOUT
    document.getElementById('btnLogout').addEventListener('click', async () => {
      await fetch('/api/logout', { method: 'POST' });
      alert('Sesión cerrada');
      location.reload();
    });

    // Cargar scripts adicionales
    const script1 = document.createElement('script');
    script1.src = '/js/session-check.js';
    script1.onload = () => {
      const script2 = document.createElement('script');
      script2.src = '/js/auth-modals.js';
      document.body.appendChild(script2);
    };
    document.body.appendChild(script1);
  })
  .catch(err => console.error('Error cargando modales:', err));
</script>
</body>
</html>`;

 // Crear directorio del restaurante si no existe (en public/reserva)
const restaurantDir = path.join(__dirname, 'public', 'reserva', restaurante.slug);
await fs.mkdir(restaurantDir, { recursive: true });

// Escribir el archivo HTML
await fs.writeFile(path.join(restaurantDir, 'index.html'), template);
}

// ==================== RUTAS DE LA API ====================

// Obtener todos los restaurantes
app.get('/api/restaurantes', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM restaurantes WHERE activo = true ORDER BY fecha_creacion DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo restaurantes:', error);
        res.status(500).json({ error: 'Error al obtener restaurantes' });
    }
});

// Obtener un restaurante por slug
app.get('/api/restaurantes/:slug', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM restaurantes WHERE slug = ? AND activo = true',
            [req.params.slug]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Restaurante no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error obteniendo restaurante:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== USUARIOS ====================
app.post('/api/usuarios/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)',
            [nombre, email, hashedPassword]
        );

        // Enviar correo de bienvenida
        await enviarCorreo(
            email,
            'Registro exitoso',
            `Su registro en nuestra base de datos ha culminado exitosamente..! bienvenido usuario ${nombre}`
        );

        res.json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error registrando usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== ADMINISTRADORES ====================
app.post('/api/admin/register', async (req, res) => {
    try {
        const { username, email, password, nombre_completo } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO administradores (username, email, password_hash, nombre_completo) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, nombre_completo]
        );

        // Enviar correo de bienvenida
        await enviarCorreo(
            email,
            'Registro exitoso',
            `Su registro en nuestra base de datos ha culminado exitosamente..! bienvenido admin ${nombre_completo || username}`
        );

        res.json({ message: 'Administrador registrado correctamente' });
    } catch (error) {
        console.error('Error registrando administrador:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== LOGIN USUARIOS (username o email) ====================
app.post('/api/usuarios/login', async (req, res) => {
    try {
        const { email, password } = req.body; // "email" aquí puede ser email o nombre de usuario
        const [rows] = await db.execute(
            'SELECT * FROM usuarios WHERE email = ? OR nombre = ?',
            [email, email]
        );
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }
        const usuario = rows[0];
        const match = await bcrypt.compare(password, usuario.password_hash);
        if (!match) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }
        req.session.usuarioId = usuario.id;
        res.json({ message: 'Login exitoso', role: 'usuario', nombre: usuario.nombre });
    } catch (error) {
        console.error('Error en login usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== LOGIN ADMIN (username o email) ====================
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body; // "username" aquí puede ser username o email
        const [rows] = await db.execute(
            'SELECT * FROM administradores WHERE username = ? OR email = ?',
            [username, username]
        );
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Administrador no encontrado' });
        }
        const admin = rows[0];
        const match = await bcrypt.compare(password, admin.password_hash);
        if (!match) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }
        req.session.adminId = admin.id;
        res.json({ message: 'Login exitoso', role: 'admin', username: admin.username });
    } catch (error) {
        console.error('Error en login admin:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});




// ==================== MIDDLEWARES DE AUTENTICACIÓN ====================
function requireUsuario(req, res, next) {
    if (!req.session.usuarioId) {
        return res.status(403).json({
            code: 'AUTH_REQUIRED_USER',
            message: 'Debes iniciar sesión como usuario para poder realizar una reserva. Inicia sesión e inténtalo de nuevo.'
        });
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.adminId) {
        return res.status(403).json({
            code: 'AUTH_REQUIRED_ADMIN',
            message: 'Acceso denegado: esta sección es solo para administradores. Inicia sesión con una cuenta de administrador.'
        });
    }
    next();
}


// ==================== SESIÓN ACTIVA ====================
app.get('/api/session', async (req, res) => {
    try {
        if (req.session && req.session.adminId) {
            const [rows] = await db.execute('SELECT username FROM administradores WHERE id = ?', [req.session.adminId]);
            return res.json({ role: 'admin', id: req.session.adminId, username: rows[0]?.username });
        }
        if (req.session && req.session.usuarioId) {
            const [rows] = await db.execute('SELECT nombre FROM usuarios WHERE id = ?', [req.session.usuarioId]);
            return res.json({ role: 'usuario', id: req.session.usuarioId, nombre: rows[0]?.nombre });
        }
        res.json({ role: null });
    } catch (error) {
        console.error('Error obteniendo sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Error cerrando sesión' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Sesión cerrada' });
    });
});

// ==================== CREAR NUEVO RESTAURANTE (SOLO ADMIN) ====================
app.post('/api/restaurantes', requireAdmin, upload.single('imagen'), async (req, res) => {
    try {
        const {
            nombre,
            propietario,
            telefono,
            email,
            direccion,
            ciudad,
            tipo_comida,
            descripcion,
            platos_especiales,
            horario_apertura,
            horario_cierre,
            dias_atencion,
            rango_precios,
            imagen,
            redes_sociales,
            comentarios,
            slug
        } = req.body;

        const imagenFinal = req.file ? req.file.filename : imagen || null;

        // Usar slug generado si no viene en el body
        const slugFinal = slug || generateSlug(nombre);
        const carpetaHtml = `/reserva/${slugFinal}/index.html`;

        const sql = `
            INSERT INTO restaurantes (
                nombre, propietario, telefono, email, direccion, ciudad, tipo_comida,
                descripcion, platos_especiales, horario_apertura, horario_cierre,
                dias_atencion, rango_precios, imagen, redes_sociales, comentarios, slug, carpeta_html
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            nombre, propietario, telefono, email, direccion, ciudad, tipo_comida,
            descripcion, platos_especiales, horario_apertura, horario_cierre,
            dias_atencion, rango_precios, imagenFinal, redes_sociales, comentarios, slugFinal, carpetaHtml
        ];

        const [result] = await db.execute(sql, values);

        const [restaurante] = await db.execute('SELECT * FROM restaurantes WHERE id = ?', [result.insertId]);

        // Generar página HTML
        await generateRestaurantPage(restaurante[0]);

        res.status(201).json({
    message: 'Restaurante creado exitosamente',
    id: restaurante[0].id,
    restaurante: restaurante[0],
    url: carpetaHtml
});


    } catch (error) {
        console.error('Error creando restaurante:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// ==================== CREAR NUEVA RESERVA (SOLO USUARIOS LOGEADOS) ====================
app.post('/api/reservas', requireUsuario, async (req, res) => {
    try {
        const {
            restaurante_id,
            nombre,
            email,
            telefono,
            fecha,
            hora,
            personas,
            comentarios
        } = req.body;

        const sql = `
            INSERT INTO reservas (
                restaurante_id, nombre_cliente, email_cliente, telefono_cliente,
                fecha_reserva, hora_reserva, numero_personas, comentarios_especiales
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            restaurante_id, nombre, email, telefono, fecha, hora, personas, comentarios
        ];

        const [result] = await db.execute(sql, values);

        // Obtener nombre del restaurante para el correo
        const [rest] = await db.execute('SELECT nombre FROM restaurantes WHERE id = ?', [restaurante_id]);
        const nombreRestaurante = rest[0]?.nombre || 'Restaurante';

        // Enviar correo de confirmación de recepción
        await enviarCorreo(
            email,
            'Reserva recibida',
            `Usted ha realizado una reserva en el restaurante ${nombreRestaurante} su reserva ha ingresado en nuestros servidores esperando por la confirmacion de un administrador, por favor sea paciente mientras espera..!`
        );

        res.status(201).json({
            message: 'Reserva creada exitosamente',
            reserva_id: result.insertId
        });
    } catch (error) {
        console.error('Error creando reserva:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== OBTENER RESERVAS DE UN RESTAURANTE (SOLO ADMIN) ====================
app.get('/api/restaurantes/:id/reservas', requireAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM reservas WHERE restaurante_id = ? ORDER BY fecha_reserva DESC, hora_reserva DESC',
            [req.params.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo reservas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// ==================== LISTAR TODOS LOS RESTAURANTES (SOLO ADMIN) ====================
app.get('/api/admin/restaurantes', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM restaurantes ORDER BY fecha_creacion DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo restaurantes (admin):', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==================== OBTENER LISTA DE RESERVAS (SOLO ADMIN) ====================
app.get('/api/admin/reservas', requireAdmin, async (req, res) => {
  const [rows] = await db.execute(`
    SELECT r.*, rest.nombre AS restaurante_nombre
    FROM reservas r
    JOIN restaurantes rest ON r.restaurante_id = rest.id
    ORDER BY r.fecha_reserva DESC, r.hora_reserva DESC
  `);
  res.json(rows);
});

// ==================== ELIMINAR RESTAURANTE (SOLO ADMIN) ====================
app.delete('/api/admin/restaurantes/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Bloquear borrado de restaurantes por defecto
    if (id === 1 || id === 2) {
      return res.status(400).json({ error: 'Este restaurante es predeterminado y no puede ser eliminado' });
    }

    await db.execute('DELETE FROM restaurantes WHERE id = ?', [id]);
    res.json({ message: 'Restaurante eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando restaurante:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});




// ==================== ACTUALIZAR ESTADO DE RESERVA (SOLO ADMIN) ====================
app.put('/api/reservas/:id/estado', requireAdmin, async (req, res) => {
    try {
        const { estado } = req.body;
        await db.execute('UPDATE reservas SET estado = ? WHERE id = ?', [estado, req.params.id]);

        // Obtener datos de la reserva y restaurante para el correo
        const [reservaData] = await db.execute(`
            SELECT r.nombre_cliente, r.email_cliente, r.fecha_reserva, r.hora_reserva, rest.nombre AS restaurante_nombre
            FROM reservas r
            JOIN restaurantes rest ON r.restaurante_id = rest.id
            WHERE r.id = ?
        `, [req.params.id]);

        if (reservaData.length > 0) {
            const { email_cliente, restaurante_nombre, fecha_reserva, hora_reserva } = reservaData[0];
            let asunto = '';
            let mensaje = '';

            if (estado === 'confirmada') {
                asunto = 'Reserva confirmada';
                mensaje = `Estimado Comensal, su reserva en el restaurante ${restaurante_nombre} ha sido confirmada por un administrador..! su reserva estará pautada para el día ${fecha_reserva} con hora ${hora_reserva}.`;
            } else if (estado === 'cancelada') {
                asunto = 'Reserva rechazada';
                mensaje = `Estimado Comensal, su reserva ha sido rechazada por nuestra administración. Por favor, verifique los datos y vuelva a intentarlo o contacte con un administrador.`;
            }

            if (asunto && mensaje) {
                await enviarCorreo(email_cliente, asunto, mensaje);
            }

            // 🔹 Eliminar la reserva después de notificar
            await db.execute('DELETE FROM reservas WHERE id = ?', [req.params.id]);
        }

        res.json({ message: 'Estado de reserva actualizado y reserva eliminada' });
    } catch (error) {
        console.error('Error actualizando reserva:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== GESTIÓN DE USUARIOS Y ADMINS (SOLO ADMIN) ====================
app.get('/api/admin/usuarios', requireAdmin, async (req, res) => {
  try {
    const [usuarios] = await db.execute(`SELECT id, nombre, email, 'usuario' AS rol FROM usuarios`);
    const [admins] = await db.execute(`SELECT id, username AS nombre, email, 'admin' AS rol FROM administradores`);

    // Marcar si es el admin actual para evitar que se borre a sí mismo
    const todos = [...usuarios, ...admins].map(u => ({
      ...u,
      esActual: (u.rol === 'admin' && u.id === req.session.adminId)
    }));

    res.json(todos);
  } catch (error) {
    console.error('Error obteniendo usuarios/admins:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/admin/usuarios/:id', requireAdmin, async (req, res) => {
  try {
    const { rol } = req.query;

    // Evitar que un admin se borre a sí mismo
    if (rol === 'admin' && parseInt(req.params.id) === req.session.adminId) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta de administrador' });
    }

    const tabla = rol === 'admin' ? 'administradores' : 'usuarios';
    await db.execute(`DELETE FROM ${tabla} WHERE id = ?`, [req.params.id]);

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// ==================== SERVIR PÁGINAS DE RESTAURANTES ====================
app.get('/reserva/:slug', (req, res) => {
    const restaurantPath = path.join(__dirname, 'public', 'reserva', req.params.slug, 'index.html');
    res.sendFile(restaurantPath, (err) => {
        if (err) {
            res.status(404).send('Restaurante no encontrado');
        }
    });
});

// ==================== MANEJO DE ERRORES ====================
app.use((error, req, res, next) => {
    console.error('Error detectado:', error);
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'El archivo es demasiado grande' });
        }
    }
    res.status(500).json({ error: error.message });
});

// ==================== CREAR DIRECTORIOS NECESARIOS ====================
async function createDirectories() {
    try {
        await fs.mkdir(path.join(__dirname, 'uploads'), { recursive: true });
        await fs.mkdir(path.join(__dirname, 'public', 'reserva'), { recursive: true });
        console.log('Directorios creados');
    } catch (error) {
        console.error('Error creando directorios:', error);
    }
}

// ==================== INICIALIZAR SERVIDOR ====================
async function startServer() {
    await createDirectories();
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
}

startServer().catch(console.error);
