let currentStep = 1;
        const totalSteps = 3;

        // Navegación entre pasos
        function changeStep(direction) {
            if (direction === 1 && currentStep < totalSteps) {
                if (validateCurrentStep()) {
                    hideStep(currentStep);
                    currentStep++;
                    showStep(currentStep);
                    updateStepIndicator();
                }
            } else if (direction === -1 && currentStep > 1) {
                hideStep(currentStep);
                currentStep--;
                showStep(currentStep);
                updateStepIndicator();
            }
        }

        function hideStep(step) {
            document.getElementById(`step${step}`).style.display = 'none';
        }

        function showStep(step) {
            document.getElementById(`step${step}`).style.display = 'block';
            updateButtons();
        }

        function updateButtons() {
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const submitBtn = document.getElementById('submitBtn');

            prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
            nextBtn.style.display = currentStep === totalSteps ? 'none' : 'inline-flex';
            submitBtn.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
        }

        function updateStepIndicator() {
            const steps = document.querySelectorAll('.step');
            steps.forEach((step, index) => {
                step.classList.remove('active', 'completed');
                if (index + 1 < currentStep) {
                    step.classList.add('completed');
                } else if (index + 1 === currentStep) {
                    step.classList.add('active');
                }
            });
        }

        function validateCurrentStep() {
            const currentStepElement = document.getElementById(`step${currentStep}`);
            const requiredFields = currentStepElement.querySelectorAll('[required]');
            
            for (let field of requiredFields) {
                if (!field.value.trim()) {
                    field.focus();
                    showError(`Por favor, completa el campo: ${field.previousElementSibling.textContent.replace(' *', '')}`);
                    return false;
                }
            }
            return true;
        }

        // Manejo de imagen
        document.getElementById('imageUpload').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    showError('La imagen debe ser menor a 5MB');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('previewImg').src = e.target.result;
                    document.getElementById('imagePreview').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });

        // Función para mostrar mensajes
        function showSuccess(message) {
    const successElement = document.getElementById('successMessage');
    successElement.style.display = 'block';
    if (message) {
        let span = successElement.querySelector('span');
        if (!span) {
            span = document.createElement('span');
            successElement.appendChild(span);
        }
        span.textContent = message;
    }
    setTimeout(() => {
        successElement.style.display = 'none';
    }, 3000);
}


        function showError(message) {
            const errorElement = document.getElementById('errorMessage');
            const errorText = document.getElementById('errorText');
            errorText.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }

        function showLoading(show) {
            document.getElementById('loading').style.display = show ? 'block' : 'none';
        }

        // Función para generar un ID único
        function generateId() {
            return 'rest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        // Función para generar el HTML de la página del restaurante
        function generateRestaurantPage(data) {
            const restaurantId = generateId();
            const imageSrc = data.image || 'https://via.placeholder.com/400x300/667eea/ffffff?text=Restaurante';
            
            return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name} - Restaurante</title>
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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .hero {
            background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${imageSrc}');
            background-size: cover;
            background-position: center;
            height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
        }

        .hero-content h1 {
            font-size: 3.5rem;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
        }

        .hero-content p {
            font-size: 1.3rem;
            margin-bottom: 30px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
        }

        .category-badge {
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        .content {
            padding: 60px 0;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 40px;
            margin-bottom: 60px;
        }

        .info-card {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .info-card h2 {
            color: #667eea;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .contact-info {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }

        .contact-info h2 {
            color: white;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
            padding: 10px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
        }

        .contact-item i {
            width: 20px;
            text-align: center;
        }

        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .service-item {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s ease;
        }

        .service-item:hover {
            transform: translateY(-5px);
        }

        .service-item i {
            font-size: 2rem;
            color: #667eea;
            margin-bottom: 10px;
        }

        .reservation-section {
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            margin: 40px 0;
        }

        .btn {
            background: white;
            color: #28a745;
            padding: 15px 30px;
            border: none;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 10px;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .back-link {
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(255,255,255,0.9);
            padding: 10px 15px;
            border-radius: 50px;
            text-decoration: none;
            color: #333;
            font-weight: 600;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            z-index: 1000;
        }

        .back-link:hover {
            background: white;
            transform: translateX(-5px);
        }

        .price-range {
            font-size: 1.5rem;
            color: #28a745;
            font-weight: bold;
        }

        .special-dishes {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
        }

        .special-dishes h3 {
            color: #856404;
            margin-bottom: 10px;
        }

        .dishes-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .dish-tag {
            background: #ffeaa7;
            color: #856404;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .hero-content h1 {
                font-size: 2.5rem;
            }
            
            .services-grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            }
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

<a href="../../directorio.html" class="back-link">
    <i class="fas fa-arrow-left"></i> Volver al Directorio
</a>

<div class="hero">
    <div class="hero-content">
        <div class="category-badge">${data.category.charAt(0).toUpperCase() + data.category.slice(1)}</div>
        <h1>${data.name}</h1>
        <p>${data.description}</p>
        <div class="price-range">${data.priceRange}</div>
    </div>
</div>

<div class="container">
    <div class="content">
        <!-- ... resto del contenido ... -->
    </div>
</div>

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

    const API = window.__API_BASE_URL || '';
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

      const url = currentRole === 'admin'
        ? API + '/api/admin/login'
        : API + '/api/usuarios/login';

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

      const url = currentRole === 'admin'
        ? API + '/api/admin/register'
        : API + '/api/usuarios/register';

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
      await fetch(API + '/api/logout', { method: 'POST' });
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
</html>
`;

        }
// Función para actualizar el app.js del directorio principal
function updateMainDirectory(restaurantData) {
    const restaurantId = generateId();
    const imageSrc = restaurantData.image || 'https://via.placeholder.com/400x300/667eea/ffffff?text=Restaurante';
    
    // Crear objeto del restaurante para el directorio
    const restaurantForDirectory = {
        id: restaurantId,
        name: restaurantData.name,
        category: restaurantData.category,
        description: restaurantData.description,
        image: imageSrc,
        phone: restaurantData.phone,
        address: restaurantData.address,
        priceRange: restaurantData.priceRange,
        services: restaurantData.services,
        openHours: restaurantData.openHours,
        pageUrl: `restaurantes/${restaurantId}.html`
    };

    // Simular la actualización del directorio principal
    console.log('Nuevo restaurante agregado al directorio:', restaurantForDirectory);
    
    return restaurantId;
}

// Función para crear el archivo del restaurante
function createRestaurantFile(restaurantData, restaurantId) {
    const htmlContent = generateRestaurantPage(restaurantData);
    
    console.log('Creando archivo: restaurantes/' + restaurantId + '.html');
    console.log('Contenido HTML:', htmlContent);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = restaurantId + '.html';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}

// Función principal para enviar el formulario
document.getElementById('restaurantForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }

    showLoading(true);

    try {
        const formData = new FormData(this);
        const restaurantData = {
            nombre: formData.get('name'),
            propietario: formData.get('propietario'),
            telefono: formData.get('phone'),
            email: formData.get('email'),
            direccion: formData.get('address'),
            ciudad: formData.get('ciudad'),
            tipo_comida: formData.get('category'),
            descripcion: formData.get('description'),
            platos_especiales: formData.get('specialDishes'),
            horario_apertura: formData.get('horario_apertura'),
            horario_cierre: formData.get('horario_cierre'),
            dias_atencion: formData.get('dias_atencion'),
            rango_precios: formData.get('priceRange'),
            imagen: null,
            redes_sociales: [formData.get('website'), formData.get('instagram')].filter(Boolean).join(', '),
            comentarios: formData.get('comentarios'),
            slug: formData.get('name').toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
        };

        const imageFile = document.getElementById('imageUpload').files[0];
        if (imageFile) {
            restaurantData.imagen = document.getElementById('previewImg').src;
        }

        const API = window.__API_BASE_URL || '';
const response = await fetch(API + '/api/restaurantes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // 🔹 importante para producción
    body: JSON.stringify(restaurantData)
});

const result = await response.json();

if (!result.success) {
    showLoading(false);
    showError(result.message || 'Error al guardar en la base de datos');
    return;
}

// Usar el ID real que devuelve el backend
const restaurantId = result.id;

updateMainDirectory({ ...restaurantData, id: restaurantId });
createRestaurantFile({ ...restaurantData, id: restaurantId }, restaurantId);

console.log('Guardando en base de datos:', {
    ...restaurantData,
    id: restaurantId,
    createdAt: new Date().toISOString(),
    status: 'active'
});

showLoading(false);
showSuccess('¡Restaurante creado exitosamente! Tu página ha sido generada.');

setTimeout(() => {
    window.location.href = '../directorio.html';
}, 3000);


    } catch (error) {
        showLoading(false);
        showError('Ha ocurrido un error al crear el restaurante. Por favor, intenta nuevamente.');
        console.error('Error:', error);
    }
});

// Validaciones en tiempo real
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.startsWith('58')) {
            value = '+' + value;
        } else if (!value.startsWith('0')) {
            value = '+58' + value;
        }
    }
    e.target.value = value;
});

document.getElementById('email').addEventListener('blur', function(e) {
    const email = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        showError('Por favor, ingresa un email válido');
        e.target.focus();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    updateButtons();
    updateStepIndicator();
});

// Función para enviar datos al servidor (para implementación futura)
async function sendToServer(data) {
    try {
        const API = window.__API_BASE_URL || '';
        const response = await fetch(API + '/api/restaurants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Error en el servidor');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error enviando al servidor:', error);
        throw error;
    }
}

// Función para subir imagen (para implementación futura)
async function uploadImage(file) {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const API = window.__API_BASE_URL || '';
        const response = await fetch(API + '/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Error subiendo imagen');
        }
        
        const result = await response.json();
        return result.imageUrl;
    } catch (error) {
        console.error('Error subiendo imagen:', error);
        throw error;
    }
}

// Función para validar disponibilidad del nombre (para implementación futura)
async function checkNameAvailability(name) {
    try {
        const API = window.__API_BASE_URL || '';
        const response = await fetch(API + '/api/restaurants/check-name?name=' + encodeURIComponent(name));
        const result = await response.json();
        return result.available;
    } catch (error) {
        console.error('Error verificando disponibilidad:', error);
        return true; // Asumir disponible si hay error
    }
}
