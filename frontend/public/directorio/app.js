// Restaurant data storage
        let restaurants = [];
let filteredRestaurants = [...restaurants];

        // Initialize the page
        document.addEventListener('DOMContentLoaded', async function() {
    try {
        const API = window.__API_BASE_URL || '';
        // 1️⃣ Traer datos desde la API
        const res = await fetch(API + '/api/restaurantes');
        const data = await res.json();

        // 2️⃣ Adaptar los campos de la BD a los que usa tu código
        const nuevos = data.map(r => ({
            id: r.id,
            name: r.nombre,
            description: r.descripcion,
            image: r.imagen,
            link: r.carpeta_html
        }));

        // 3️⃣ Combinar los 3 fijos con los nuevos de la BD
        restaurants = [...restaurants, ...nuevos];
        filteredRestaurants = [...restaurants];

        // 4️⃣ Renderizar
        loadRestaurants();
        updateDropdown();
        loadStoredRestaurants();
    } catch (err) {
        console.error('Error cargando restaurantes desde la API:', err);
        // Si falla la API, al menos carga los fijos
        loadRestaurants();
        updateDropdown();
        loadStoredRestaurants();
    }
});


        // Load stored restaurants from local data
        function loadStoredRestaurants() {
            const storedRestaurants = getStoredRestaurants();
            if (storedRestaurants.length > 0) {
                restaurants = [...restaurants, ...storedRestaurants];
                filteredRestaurants = [...restaurants];
                loadRestaurants();
                updateDropdown();
            }
        }

        // Get stored restaurants (simulated localStorage)
        function getStoredRestaurants() {
            // In a real application, this would use localStorage
            // For this demo, we'll return an empty array
            return [];
        }

        // Save restaurant (simulated localStorage)
        function saveRestaurant(restaurant) {
            // In a real application, this would save to localStorage
            // For this demo, we'll just add to the array directly
            restaurants.push(restaurant);
            filteredRestaurants = [...restaurants];
            loadRestaurants();
            updateDropdown();
        }

        // Load restaurants into the grid
        function loadRestaurants() {
            const grid = document.getElementById('restaurantGrid');
            const noResults = document.getElementById('noResults');
            
            if (filteredRestaurants.length === 0) {
                grid.innerHTML = '';
                noResults.style.display = 'block';
                return;
            }
            
            noResults.style.display = 'none';
            
            grid.innerHTML = filteredRestaurants.map(restaurant => `
                <div class="restaurant-card">
                    <img class="restaurant-img" src="${restaurant.image}" alt="${restaurant.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='">
                    <div class="restaurant-content">
                        <h3 class="restaurant-name">${restaurant.name}</h3>
                        <p class="restaurant-desc">${restaurant.description}</p>
                        <a class="restaurant-link" href="${restaurant.link}">Acceder</a>
                    </div>
                </div>
            `).join('');
        }

        // Update dropdown with restaurant names
        function updateDropdown() {
            const dropdown = document.getElementById('dropdownMenu');
            dropdown.innerHTML = restaurants.map(restaurant => `
                <div class="dropdown-item" onclick="selectRestaurant('${restaurant.name}')">${restaurant.name}</div>
            `).join('');
        }

        // Toggle dropdown visibility
        function toggleDropdown() {
            const dropdown = document.getElementById('dropdownMenu');
            dropdown.classList.toggle('show');
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            const dropdown = document.getElementById('dropdownMenu');
            const button = event.target.closest('.dropdown-btn');
            
            if (!button && !dropdown.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });

        // Select restaurant from dropdown
        function selectRestaurant(name) {
            document.getElementById('searchInput').value = name;
            document.getElementById('dropdownMenu').classList.remove('show');
            searchRestaurants();
        }

        // Search restaurants
        function searchRestaurants() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            
            if (searchTerm === '') {
                filteredRestaurants = [...restaurants];
            } else {
                filteredRestaurants = restaurants.filter(restaurant => 
                    restaurant.name.toLowerCase().includes(searchTerm) ||
                    restaurant.description.toLowerCase().includes(searchTerm)
                );
            }
            
            loadRestaurants();
        }

        // Clear search
        function clearSearch() {
            document.getElementById('searchInput').value = '';
            filteredRestaurants = [...restaurants];
            loadRestaurants();
        }

        // Search on Enter key
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchRestaurants();
            }
        });

        // Real-time search as user types
        document.getElementById('searchInput').addEventListener('input', function() {
            searchRestaurants();
        });

        // Smooth scroll to sections
        function scrollToSection(sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Function to add a new restaurant (called from the form page)
        function addNewRestaurant(restaurantData) {
            const newRestaurant = {
                id: restaurants.length + 1,
                name: restaurantData.nombreRestaurante,
                description: restaurantData.descripcion,
                image: restaurantData.imagen || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk51ZXZvIFJlc3RhdXJhbnRlPC90ZXh0Pjwvc3ZnPg==',
                link: '#'
            };
            
            saveRestaurant(newRestaurant);
            return newRestaurant;
        }

        // Make functions available globally for the form page
        window.restaurantDirectory = {
            addNewRestaurant: addNewRestaurant,
            restaurants: restaurants
        };