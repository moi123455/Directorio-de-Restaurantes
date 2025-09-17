document.getElementById('restaurantForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Aquí normalmente enviarías los datos a un servidor
            // Por ahora, solo mostraremos un mensaje de éxito
            
            const successMessage = document.getElementById('successMessage');
            successMessage.style.display = 'block';
            
            // Scroll to top to show the message
            window.scrollTo(0, 0);
            
            // Reset form
            this.reset();
            
            // Hide message after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        });

        // Update file upload label when file is selected
        document.getElementById('imagen').addEventListener('change', function() {
            // Update the label text with the selected file name
            const label = document.querySelector('.file-upload-label');
            if (this.files.length > 0) {
                label.textContent = `📷 ${this.files[0].name}`;
            } else {
                label.textContent = '📷 Seleccionar imagen (JPG, PNG)';
            }
        });



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
            <div class="info-grid">
                <div class="info-card">
                    <h2><i class="fas fa-info-circle"></i> Información del Restaurante</h2>
                    <p><strong>Dirección:</strong> ${data.address}</p>
                    <p><strong>Horario:</strong> ${data.openHours}</p>
                    
                    ${data.specialDishes ? `
                    <div class="special-dishes">
                        <h3><i class="fas fa-star"></i> Platos Especiales</h3>
                        <div class="dishes-list">
                            ${data.specialDishes.split(',').map(dish => `<span class="dish-tag">${dish.trim()}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}

                    ${data.services.length > 0 ? `
                    <h2><i class="fas fa-concierge-bell"></i> Servicios</h2>
                    <div class="services-grid">
                        ${data.services.map(service => {
                            const serviceIcons = {
                                'delivery': 'fa-motorcycle',
                                'takeaway': 'fa-shopping-bag',
                                'reservation': 'fa-calendar-check',
                                'parking': 'fa-parking',
                                'wifi': 'fa-wifi',
                                'terrace': 'fa-leaf'
                            };
                            const serviceNames = {
                                'delivery': 'Delivery',
                                'takeaway': 'Para Llevar',
                                'reservation': 'Reservaciones',
                                'parking': 'Estacionamiento',
                                'wifi': 'WiFi Gratis',
                                'terrace': 'Terraza'
                            };
                            return `
                            <div class="service-item">
                                <i class="fas ${serviceIcons[service]}"></i>
                                <p>${serviceNames[service]}</p>
                            </div>
                            `;
                        }).join('')}
                    </div>
                    ` : ''}
                </div>

                <div class="info-card contact-info">
                    <h2><i class="fas fa-phone"></i> Contacto</h2>
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>${data.phone}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <span>${data.email}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${data.address}</span>
                    </div>
                    
                    ${data.website ? `
                    <div class="contact-item">
                        <i class="fas fa-globe"></i>
                        <a href="${data.website}" target="_blank" style="color: white;">${data.website}</a>
                    </div>
                    ` : ''}
                    
                    ${data.instagram ? `
                    <div class="contact-item">
                        <i class="fab fa-instagram"></i>
                        <span>${data.instagram}</span>
                    </div>
                    ` : ''}
                </div>
            </div>

            ${data.services.includes('reservation') ? `
            <div class="reservation-section">
                <h2><i class="fas fa-calendar-check"></i> ¿Quieres hacer una reservación?</h2>
                <p>Reserva tu mesa y disfruta de una experiencia gastronómica única</p>
                <a href="#" class="btn" onclick="makeReservation('${data.name}', '${data.phone}')">
                    <i class="fas fa-calendar-plus"></i> Reservar Mesa
                </a>
            </div>
            ` : ''}
        </div>
    </div>

    <script>
        function makeReservation(restaurantName, phone) {
            const message = \`Hola, me gustaría hacer una reservación en \${restaurantName}. ¿Podrían ayudarme con la disponibilidad?\`;
            const whatsappUrl = \`https://wa.me/\${phone.replace(/[^0-9]/g, '')}?text=\${encodeURIComponent(message)}\`;
            window.open(whatsappUrl, '_blank');
        }
    </script>
</body>
</html>`;
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
            // En un entorno real, esto se haría mediante una API
            console.log('Nuevo restaurante agregado al directorio:', restaurantForDirectory);
            
            return restaurantId;
        }

        // Función para crear el archivo del restaurante
        function createRestaurantFile(restaurantData, restaurantId) {
            const htmlContent = generateRestaurantPage(restaurantData);
            
            // En un entorno real, esto se enviaría al servidor
            // Por ahora, simulamos la creación del archivo
            console.log(`Creando archivo: restaurantes/${restaurantId}.html`);
            console.log('Contenido HTML:', htmlContent);
            
            // Simular descarga del archivo para pruebas
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${restaurantId}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
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
                // Recopilar datos del formulario
                const formData = new FormData(this);
                const restaurantData = {
                    name: formData.get('name'),
                    category: formData.get('category'),
                    description: formData.get('description'),
                    phone: formData.get('phone'),
                    email: formData.get('email'),
                    address: formData.get('address'),
                    openHours: formData.get('openHours'),
                    priceRange: formData.get('priceRange'),
                    services: formData.getAll('services'),
                    website: formData.get('website'),
                    instagram: formData.get('instagram'),
                    specialDishes: formData.get('specialDishes'),
                    image: null
                };

                // Procesar imagen si existe
                const imageFile = document.getElementById('imageUpload').files[0];
                if (imageFile) {
                    restaurantData.image = document.getElementById('previewImg').src;
                }

                // Simular tiempo de procesamiento
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Crear el restaurante
                const restaurantId = updateMainDirectory(restaurantData);
                createRestaurantFile(restaurantData, restaurantId);

                // Simular guardado en base de datos
                console.log('Guardando en base de datos:', {
                    ...restaurantData,
                    id: restaurantId,
                    createdAt: new Date().toISOString(),
                    status: 'active'
                });

                showLoading(false);
                showSuccess('¡Restaurante creado exitosamente! Tu página ha sido generada.');

                // Redirigir después de 3 segundos
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

        // Inicialización
        document.addEventListener('DOMContentLoaded', function() {
            updateButtons();
            updateStepIndicator();
        });

        // Funciones adicionales para integración con el backend
        
        // Función para enviar datos al servidor (para implementación futura)
        async function sendToServer(data) {
            try {
                const response = await fetch('/api/restaurants', {
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
                
                const response = await fetch('/api/upload', {
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
                const response = await fetch(`/api/restaurants/check-name?name=${encodeURIComponent(name)}`);
                const result = await response.json();
                return result.available;
            } catch (error) {
                console.error('Error verificando disponibilidad:', error);
                return true; // Asumir disponible si hay error
            }
        }