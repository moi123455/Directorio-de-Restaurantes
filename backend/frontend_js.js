// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Variables globales
let restaurantes = [];
let restaurantesFiltrados = [];
let dropdownAbierto = false;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    cargarRestaurantes();
    configurarBusqueda();
    configurarFormularioAgregar();
});

// Función para cargar restaurantes desde la API
async function cargarRestaurantes() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/restaurantes`);
        
        if (!response.ok) {
            throw new Error('Error al cargar restaurantes');
        }
        
        restaurantes = await response.json();
        restaurantesFiltrados = [...restaurantes];
        
        mostrarRestaurantes(restaurantes);
        llenarDropdown(restaurantes);
        
    } catch (error) {
        console.error('Error cargando restaurantes:', error);
        mostrarError('Error al cargar los restaurantes. Por favor, intenta nuevamente.');
    } finally {
        showLoading(false);
    }
}

// Función para mostrar los restaurantes en la grilla
function mostrarRestaurantes(lista) {
    const grid = document.getElementById('restaurantGrid');
    const noResults = document.getElementById('noResults');
    
    if (!grid) return;
    
    if (lista.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    grid.innerHTML = lista.map(restaurante => `
        <div class="restaurant-card" onclick="abrirRestaurante('${restaurante.slug}')">
            <div class="restaurant-image-container">
                ${restaurante.imagen ? 
                    `<img src="/uploads/${restaurante.imagen}" alt="${restaurante.nombre}" class="restaurant-image">` :
                    `<div class="restaurant-placeholder">
                        <i class="fas fa-utensils"></i>
                    </div>`
                }
                <div class="restaurant-overlay">
                    <span class="restaurant-type">${restaurante.tipo_comida}</span>
                </div>
            </div>
            
            <div class="restaurant-info">
                <h3 class="restaurant-name">${restaurante.nombre}</h3>
                <p class="restaurant-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${restaurante.ciudad}
                </p>
                <p class="restaurant-description">${truncarTexto(restaurante.descripcion, 100)}</p>
                
                <div class="restaurant-details">
                    <div class="restaurant-hours">
                        <i class="fas fa-clock"></i>
                        ${restaurante.horario_apertura && restaurante.horario_cierre ? 
                            `${restaurante.horario_apertura} - ${restaurante.horario_cierre}` : 
                            'Horario no especificado'
                        }
                    </div>
                    ${restaurante.rango_precios ? 
                        `<div class="price-range price-${restaurante.rango_precios}">
                            ${obtenerSimbolosPrecio(restaurante.rango_precios)}
                        </div>` : 
                        ''
                    }
                </div>
                
                <div class="restaurant-actions">
                    <button class="btn-view" onclick="event.stopPropagation(); abrirRestaurante('${restaurante.slug}')">
                        <i class="fas fa-eye"></i>
                        Ver Detalles
                    </button>
                    <button class="btn-reserve" onclick="event.stopPropagation(); reservarDirecto('${restaurante.slug}')">
                        <i class="fas fa-calendar-plus"></i>
                        Reservar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Función para llenar el dropdown con los nombres de restaurantes
function llenarDropdown(lista) {
    const dropdown = document.getElementById('dropdownMenu');
    if (!dropdown) return;
    
    dropdown.innerHTML = lista.map(restaurante => `
        <div class="dropdown-item" onclick="seleccionarRestaurante('${restaurante.slug}')">
            <i class="fas fa-utensils"></i>
            <span>${restaurante.nombre}</span>
            <small>${restaurante.ciudad}</small>
        </div>
    `).join('');
}

// Configurar la funcionalidad de búsqueda
function configurarBusqueda() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const termino = e.target.value.toLowerCase().trim();
            buscarRestaurantes(termino);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarRestaurantes(e.target.value.toLowerCase().trim());
            }
        });
    }
}

// Función de búsqueda
function buscarRestaurantes(termino = '') {
    if (!termino) {
        restaurantesFiltrados = [...restaurantes];
    } else {
        restaurantesFiltrados = restaurantes.filter(restaurante => 
            restaurante.nombre.toLowerCase().includes(termino) ||
            restaurante.ciudad.toLowerCase().includes(termino) ||
            restaurante.tipo_comida.toLowerCase().includes(termino) ||
            restaurante.descripcion.toLowerCase().includes(termino)
        );
    }
    
    mostrarRestaurantes(restaurantesFiltrados);
    llenarDropdown(restaurantesFiltrados);
}

// Función para el botón de búsqueda
function searchRestaurants() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        buscarRestaurantes(searchInput.value.toLowerCase().trim());
    }
}

// Función para limpiar búsqueda
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        buscarRestaurantes('');
    }
}

// Toggle del dropdown
function toggleDropdown() {
    const dropdown = document.getElementById('dropdownMenu');
    const btn = document.querySelector('.dropdown-btn');
    
    if (!dropdown || !btn) return;
    
    dropdownAbierto = !dropdownAbierto;
    dropdown.style.display = dropdownAbierto ? 'block' : 'none';
    btn.classList.toggle('active', dropdownAbierto);
}

// Seleccionar restaurante del dropdown
function seleccionarRestaurante(slug) {
    const restaurante = restaurantes.find(r => r.slug === slug);
    if (restaurante) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = restaurante.nombre;
        }
        restaurantesFiltrados = [restaurante];
        mostrarRestaurantes(restaurantesFiltrados);
    }
    toggleDropdown();
}

// Abrir página del restaurante
function abrirRestaurante(slug) {
    window.open(`/restaurante/${slug}`, '_blank');
}

// Reservar directamente
function reservarDirecto(slug) {
    const url = `/restaurante/${slug}#reserva`;
    window.open(url, '_blank');
}

// Configurar formulario de agregar restaurante
function configurarFormularioAgregar() {
    const form = document.getElementById('restaurantForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            // Cambiar texto del botón
            submitBtn.textContent = 'Creando página...';
            submitBtn.disabled = true;
            
            const response = await fetch(`${API_BASE_URL}/restaurantes`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al crear restaurante');
            }
            
            const result = await response.json();
            
            // Mostrar mensaje de éxito
            mostrarMensajeExito(result);
            
            // Resetear formulario
            form.reset();
            
            // Redirigir a la página del restaurante después de 3 segundos
            setTimeout(() => {
                window.open(result.url, '_blank');
            }, 2000);
            
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error al crear el restaurante: ' + error.message);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Funciones auxiliares
function truncarTexto(texto, limite) {
    if (!texto) return '';
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + '...';
}

function obtenerSimbolosPrecio(rango) {
    switch(rango) {
        case 'economico': return '$';
        case 'moderado': return '$$';
        case 'alto': return '$$$';
        case 'premium': return '$$$$';
        default: return '$';
    }
}

function mostrarMensajeExito(result) {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: #27ae60; margin-bottom: 15px;"></i>
                <h3>¡Página creada exitosamente!</h3>
                <p>Tu restaurante <strong>"${result.restaurante.nombre}"</strong> ya tiene su propia página.</p>
                <p>Se abrirá automáticamente en unos segundos...</p>
                <a href="${result.url}" target="_blank" class="btn-view" style="margin-top: 15px; display: inline-block;">
                    <i class="fas fa-external-link-alt"></i> Ver página ahora
                </a>
            </div>
        `;
        successMessage.style.display = 'block';
        
        // Scroll hacia el mensaje
        successMessage.scrollIntoView({ behavior: 'smooth' });
    }
}

function mostrarError(mensaje) {
    // Crear elemento de error si no existe
    let errorDiv = document.getElementById('errorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: #e74c3c;
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
            display: none;
        `;
        
        const container = document.querySelector('.container') || document.body;
        container.insertBefore(errorDiv, container.firstChild);
    }
    
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        ${mensaje}
    `;
    errorDiv.style.display = 'block';
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
    
    // Scroll hacia el error
    errorDiv.scrollIntoView({ behavior: 'smooth' });
}

function showLoading(show) {
    let loader = document.getElementById('loadingSpinner');
    
    if (show && !loader) {
        loader = document.createElement('div');
        loader.id = 'loadingSpinner';
        loader.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255,255,255,0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                font-size: 1.2rem;
                color: #667eea;
            ">
                <div style="text-align: center;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <div>Cargando restaurantes...</div>
                </div>
            </div>
        `;
        document.body.appendChild(loader);
    } else if (!show && loader) {
        loader.remove();
    }
}

// Función para scroll suave a secciones
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('dropdownMenu');
    const btn = document.querySelector('.dropdown-btn');
    
    if (dropdown && btn && dropdownAbierto) {
        if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
            toggleDropdown();
        }
    }
});

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
});

// Verificar disponibilidad del servidor al cargar
window.addEventListener('load', function() {
    fetch(`${API_BASE_URL}/restaurantes`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Servidor no disponible');
            }
        })
        .catch(error => {
            console.error('Error de conexión:', error);
            mostrarError('No se pudo conectar con el servidor. Verifica que esté ejecutándose.');
        });
});