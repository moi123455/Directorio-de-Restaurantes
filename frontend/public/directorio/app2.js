
        // Variables globales
        let users = JSON.parse(localStorage.getItem('users')) || [];
        let currentUser = null;

        // Cambiar entre pestañas
        function switchTab(tab) {
            const tabs = document.querySelectorAll('.tab-button');
            const panels = document.querySelectorAll('.form-panel');
            
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            if (tab === 'login') {
                tabs[0].classList.add('active');
                document.getElementById('loginPanel').classList.add('active');
            } else {
                tabs[1].classList.add('active');
                document.getElementById('registerPanel').classList.add('active');
            }
            
            hideAlert();
        }

        // Mostrar/ocultar contraseña
        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const toggle = input.nextElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                toggle.classList.remove('fa-eye');
                toggle.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                toggle.classList.remove('fa-eye-slash');
                toggle.classList.add('fa-eye');
            }
        }

        // Validar contraseña en tiempo real
        document.getElementById('registerPassword').addEventListener('input', function() {
            const password = this.value;
            const requirements = {
                'req-length': password.length >= 8,
                'req-uppercase': /[A-Z]/.test(password),
                'req-lowercase': /[a-z]/.test(password),
                'req-number': /\d/.test(password),
                'req-special': /[!@#$%^&*(),.?":{}|<>]/.test(password)
            };

            let validCount = 0;
            Object.keys(requirements).forEach(req => {
                const element = document.getElementById(req);
                if (requirements[req]) {
                    element.classList.remove('invalid');
                    element.classList.add('valid');
                    element.querySelector('i').classList.remove('fa-times');
                    element.querySelector('i').classList.add('fa-check');
                    validCount++;
                } else {
                    element.classList.remove('valid');
                    element.classList.add('invalid');
                    element.querySelector('i').classList.remove('fa-check');
                    element.querySelector('i').classList.add('fa-times');
                }
            });

            // Barra de fortaleza
            const strengthBar = document.getElementById('passwordStrengthBar');
            if (validCount <= 2) {
                strengthBar.className = 'password-strength-bar strength-weak';
            } else if (validCount <= 4) {
                strengthBar.className = 'password-strength-bar strength-medium';
            } else {
                strengthBar.className = 'password-strength-bar strength-strong';
            }

            validateRegistrationForm();
        });

        // Validar formulario de registro
        function validateRegistrationForm() {
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const acceptTerms = document.getElementById('acceptTerms').checked;
            const registerButton = document.getElementById('registerButton');

            const passwordValid = password.length >= 8 && 
                                /[A-Z]/.test(password) && 
                                /[a-z]/.test(password) && 
                                /\d/.test(password) && 
                                /[!@#$%^&*(),.?":{}|<>]/.test(password);

            const passwordsMatch = password === confirmPassword && password.length > 0;
            const allValid = passwordValid && passwordsMatch && acceptTerms;

            registerButton.disabled = !allValid;
        }

        // Event listeners para validación
        document.getElementById('confirmPassword').addEventListener('input', validateRegistrationForm);
        document.getElementById('acceptTerms').addEventListener('change', validateRegistrationForm);

        // Manejar formulario de login
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            // Validar credenciales
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                currentUser = user;
                if (rememberMe) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
                showAlert('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'directorio.html';
                }, 1500);
            } else {
                showAlert('Credenciales incorrectas. Por favor, verifica tu email y contraseña.', 'error');
            }
        });

        // Manejar formulario de registro
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const newsletter = document.getElementById('newsletter').checked;

            // Verificar si el usuario ya existe
            if (users.some(u => u.email === email)) {
                showAlert('Este correo electrónico ya está registrado.', 'error');
                return;
            }

            // Crear nuevo usuario
            const newUser = {
                id: Date.now(),
                name,
                email,
                password,
                newsletter,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            showAlert('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
            
            setTimeout(() => {
                switchTab('login');
                document.getElementById('loginEmail').value = email;
            }, 1500);
        });

        // Acceso como invitado
        function guestAccess() {
            showAlert('Accediendo como invitado...', 'success');
            setTimeout(() => {
                window.location.href = 'directorio.html?guest=true';
            }, 1000);
        }

        // Login social (simulado)
        function socialLogin(provider) {
            showAlert(`Redirigiendo a ${provider}...`, 'success');
            setTimeout(() => {
                // Simular login exitoso
                const guestUser = {
                    id: Date.now(),
                    name: `Usuario de ${provider}`,
                    email: `user@${provider}.com`,
                    provider: provider
                };
                currentUser = guestUser;
                window.location.href = 'directorio.html';
            }, 1500);
        }

        // Mostrar alerta
        function showAlert(message, type) {
            const alert = document.getElementById('alert');
            alert.textContent = message;
            alert.className = `alert ${type}`;
            alert.style.display = 'block';
            
            setTimeout(() => {
                hideAlert();
            }, 5000);
        }

        // Ocultar alerta
        function hideAlert() {
            document.getElementById('alert').style.display = 'none';
        }

        // Mostrar "Olvidé mi contraseña"
        function showForgotPassword() {
            const email = prompt('Ingresa tu correo electrónico para recuperar tu contraseña:');
            if (email) {
                if (users.some(u => u.email === email)) {
                    showAlert('Se ha enviado un enlace de recuperación a tu correo.', 'success');
                } else {
                    showAlert('No se encontró una cuenta con ese correo electrónico.', 'error');
                }
            }
        }

        // Mostrar términos y condiciones
        function showTerms() {
            alert('Términos y Condiciones:\n\n1. Uso responsable de la plataforma\n2. Respeto a otros usuarios\n3. Información veraz en las reseñas\n4. Cumplimiento de las normas locales\n\nAl aceptar estos términos, te comprometes a seguir estas reglas.');
        }

        // Verificar si hay usuario logueado al cargar la página
        window.addEventListener('load', function() {
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                showAlert('Ya tienes una sesión activa. Redirigiendo...', 'success');
                setTimeout(() => {
                    window.location.href = 'directorio.html';
                }, 1500);
            }
        });