-- =====================================================
-- BASE DE DATOS: DIRECTORIO DE RESTAURANTES
-- SISTEMA DE AUTENTICACIÓN Y GESTIÓN DE USUARIOS
-- =====================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS directorio_restaurantes;
USE directorio_restaurantes;

-- =====================================================
-- TABLA: usuarios
-- Almacena información básica de usuarios registrados
-- =====================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Contraseña hasheada (usar bcrypt)
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    genero ENUM('masculino', 'femenino', 'otro', 'prefiero_no_decir'),
    estado ENUM('activo', 'inactivo', 'suspendido', 'eliminado') DEFAULT 'activo',
    email_verificado BOOLEAN DEFAULT FALSE,
    acepta_newsletter BOOLEAN DEFAULT FALSE,
    acepta_terminos BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    intentos_fallidos INT DEFAULT 0,
    bloqueado_hasta TIMESTAMP NULL,
    
    -- Índices para optimizar consultas
    INDEX idx_email (email),
    INDEX idx_estado (estado),
    INDEX idx_fecha_creacion (fecha_creacion)
);

-- =====================================================
-- TABLA: perfiles_usuario
-- Información adicional del perfil del usuario
-- =====================================================
CREATE TABLE perfiles_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    ciudad VARCHAR(100),
    pais VARCHAR(100) DEFAULT 'Venezuela',
    preferencias_culinarias JSON, -- Ejemplo: ["italiana", "venezolana", "asiática"]
    restricciones_alimentarias JSON, -- Ejemplo: ["vegetariano", "sin_gluten", "halal"]
    presupuesto_promedio DECIMAL(10,2),
    puntuacion_promedio DECIMAL(3,2) DEFAULT 0.00,
    total_reseñas INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_ciudad (ciudad)
);

-- =====================================================
-- TABLA: proveedores_oauth
-- Para login social (Google, Facebook, etc.)
-- =====================================================
CREATE TABLE proveedores_oauth (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    proveedor ENUM('google', 'facebook', 'twitter', 'apple') NOT NULL,
    proveedor_id VARCHAR(100) NOT NULL, -- ID del usuario en el proveedor
    email_proveedor VARCHAR(150),
    nombre_proveedor VARCHAR(100),
    avatar_proveedor VARCHAR(500),
    token_acceso TEXT,
    token_refresh TEXT,
    fecha_expiracion TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_proveedor_usuario (proveedor, proveedor_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_proveedor (proveedor)
);

-- =====================================================
-- TABLA: sesiones
-- Gestión de sesiones activas
-- =====================================================
CREATE TABLE sesiones (
    id VARCHAR(128) PRIMARY KEY, -- Session ID
    usuario_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    recordar_sesion BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activa BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_expiracion (fecha_expiracion),
    INDEX idx_activa (activa)
);

-- =====================================================
-- TABLA: tokens_recuperacion
-- Para recuperación de contraseñas
-- =====================================================
CREATE TABLE tokens_recuperacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    email VARCHAR(150) NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    ip_solicitante VARCHAR(45),
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_token (token),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_token (token),
    INDEX idx_fecha_expiracion (fecha_expiracion)
);

-- =====================================================
-- TABLA: tokens_verificacion
-- Para verificación de email
-- =====================================================
CREATE TABLE tokens_verificacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    email VARCHAR(150) NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_token (token),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_token (token)
);

-- =====================================================
-- TABLA: logs_acceso
-- Registro de intentos de login y actividad
-- =====================================================
CREATE TABLE logs_acceso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT, -- Puede ser NULL si el login falló
    email_intentado VARCHAR(150),
    ip_address VARCHAR(45),
    user_agent TEXT,
    tipo_evento ENUM('login_exitoso', 'login_fallido', 'logout', 'bloqueo_cuenta', 'desbloqueo_cuenta') NOT NULL,
    exitoso BOOLEAN NOT NULL,
    mensaje TEXT,
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_email_intentado (email_intentado),
    INDEX idx_ip_address (ip_address),
    INDEX idx_tipo_evento (tipo_evento),
    INDEX idx_fecha_evento (fecha_evento)
);

-- =====================================================
-- TABLA: roles
-- Sistema de roles para usuarios
-- =====================================================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    permisos JSON, -- Ejemplo: ["leer_restaurantes", "escribir_reseñas", "moderar_contenido"]
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: usuario_roles
-- Relación muchos a muchos entre usuarios y roles
-- =====================================================
CREATE TABLE usuario_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    rol_id INT NOT NULL,
    asignado_por INT, -- ID del usuario que asignó el rol
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NULL, -- Para roles temporales
    activo BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    UNIQUE KEY unique_usuario_rol (usuario_id, rol_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_rol_id (rol_id)
);

-- =====================================================
-- TABLA: configuracion_seguridad
-- Configuraciones de seguridad del sistema
-- =====================================================
CREATE TABLE configuracion_seguridad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- INSERTS INICIALES
-- =====================================================

-- Insertar roles básicos
INSERT INTO roles (nombre, descripcion, permisos) VALUES
('usuario', 'Usuario básico del sistema', '["leer_restaurantes", "escribir_reseñas", "editar_perfil"]'),
('moderador', 'Moderador de contenido', '["leer_restaurantes", "escribir_reseñas", "editar_perfil", "moderar_reseñas", "suspender_usuarios"]'),
('administrador', 'Administrador del sistema', '["all"]'),
('restaurador', 'Propietario de restaurante', '["leer_restaurantes", "escribir_reseñas", "editar_perfil", "gestionar_restaurante"]'),
('invitado', 'Usuario invitado temporal', '["leer_restaurantes"]');

-- Insertar configuraciones de seguridad
INSERT INTO configuracion_seguridad (clave, valor, descripcion) VALUES
('max_intentos_login', '5', 'Máximo número de intentos de login fallidos antes del bloqueo'),
('tiempo_bloqueo_minutos', '15', 'Tiempo de bloqueo en minutos después de exceder intentos'),
('duracion_sesion_horas', '24', 'Duración de sesión en horas para usuarios normales'),
('duracion_sesion_recordar_dias', '30', 'Duración de sesión en días cuando se selecciona "recordar"'),
('longitud_minima_password', '8', 'Longitud mínima requerida para contraseñas'),
('requerir_mayuscula', 'true', 'Requerir al menos una letra mayúscula'),
('requerir_minuscula', 'true', 'Requerir al menos una letra minúscula'),
('requerir_numero', 'true', 'Requerir al menos un número'),
('requerir_caracter_especial', 'true', 'Requerir al menos un carácter especial'),
('token_expiracion_minutos', '60', 'Tiempo de expiración para tokens de recuperación'),
('verificacion_email_requerida', 'true', 'Requerir verificación de email para nuevos usuarios');

-- Insertar usuarios de ejemplo (contraseñas hasheadas con bcrypt)
-- Nota: En producción, usar bcrypt para hashear contraseñas
INSERT INTO usuarios (nombre, email, password_hash, telefono, estado, email_verificado, acepta_newsletter) VALUES
('Administrador Sistema', 'admin@directorio.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8HjIRZm4ne', '+58414123456', 'activo', TRUE, FALSE),
('María González', 'maria.gonzalez@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8HjIRZm4ne', '+58412345678', 'activo', TRUE, TRUE),
('Carlos Rodríguez', 'carlos.rodriguez@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8HjIRZm4ne', '+58416789012', 'activo', TRUE, FALSE),
('Ana Pérez', 'ana.perez@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8HjIRZm4ne', '+58424567890', 'activo', FALSE, TRUE),
('Luis Herrera', 'luis.herrera@restaurante.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8HjIRZm4ne', '+58426789012', 'activo', TRUE, FALSE);

-- Insertar perfiles de usuario
INSERT INTO perfiles_usuario (usuario_id, bio, ciudad, pais, preferencias_culinarias, restricciones_alimentarias, presupuesto_promedio) VALUES
(1, 'Administrador del sistema de directorio de restaurantes', 'Caracas', 'Venezuela', '["todas"]', '[]', 0.00),
(2, 'Amante de la gastronomía venezolana y crítica culinaria', 'Caracas', 'Venezuela', '["venezolana", "italiana", "asiática"]', '["vegetariano"]', 150.00),
(3, 'Explorador gastronómico y food blogger', 'Maracaibo', 'Venezuela', '["internacional", "fusión", "tradicional"]', '[]', 200.00),
(4, 'Estudiante universitaria apasionada por la cocina', 'Valencia', 'Venezuela', '["venezolana", "mediterránea"]', '["sin_gluten"]', 80.00),
(5, 'Propietario de restaurante especializado en comida criolla', 'Barquisimeto', 'Venezuela', '["venezolana", "criolla"]', '[]', 100.00);

-- Asignar roles a usuarios
INSERT INTO usuario_roles (usuario_id, rol_id, asignado_por) VALUES
(1, 3, 1), -- Administrador
(2, 1, 1), -- Usuario normal
(3, 2, 1), -- Moderador
(4, 1, 1), -- Usuario normal
(5, 4, 1); -- Restaurador

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- =====================================================

DELIMITER //

-- Procedimiento para autenticar usuario
CREATE PROCEDURE AutenticarUsuario(
    IN p_email VARCHAR(150),
    IN p_password_hash VARCHAR(255),
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT
)
BEGIN
    DECLARE v_usuario_id INT;
    DECLARE v_intentos_fallidos INT;
    DECLARE v_bloqueado_hasta TIMESTAMP;
    DECLARE v_estado VARCHAR(20);
    DECLARE v_email_verificado BOOLEAN;
    
    -- Obtener información del usuario
    SELECT id, intentos_fallidos, bloqueado_hasta, estado, email_verificado
    INTO v_usuario_id, v_intentos_fallidos, v_bloqueado_hasta, v_estado, v_email_verificado
    FROM usuarios 
    WHERE email = p_email;
    
    -- Verificar si el usuario existe
    IF v_usuario_id IS NULL THEN
        INSERT INTO logs_acceso (email_intentado, ip_address, user_agent, tipo_evento, exitoso, mensaje)
        VALUES (p_email, p_ip_address, p_user_agent, 'login_fallido', FALSE, 'Email no encontrado');
        
        SELECT 'ERROR' as resultado, 'Credenciales inválidas' as mensaje;
    
    -- Verificar si la cuenta está bloqueada
    ELSEIF v_bloqueado_hasta IS NOT NULL AND v_bloqueado_hasta > NOW() THEN
        INSERT INTO logs_acceso (usuario_id, email_intentado, ip_address, user_agent, tipo_evento, exitoso, mensaje)
        VALUES (v_usuario_id, p_email, p_ip_address, p_user_agent, 'login_fallido', FALSE, 'Cuenta bloqueada');
        
        SELECT 'ERROR' as resultado, 'Cuenta temporalmente bloqueada' as mensaje;
    
    -- Verificar si la cuenta está activa
    ELSEIF v_estado != 'activo' THEN
        INSERT INTO logs_acceso (usuario_id, email_intentado, ip_address, user_agent, tipo_evento, exitoso, mensaje)
        VALUES (v_usuario_id, p_email, p_ip_address, p_user_agent, 'login_fallido', FALSE, 'Cuenta inactiva');
        
        SELECT 'ERROR' as resultado, 'Cuenta inactiva' as mensaje;
    
    -- Verificar contraseña
    ELSEIF (SELECT password_hash FROM usuarios WHERE id = v_usuario_id) != p_password_hash THEN
        -- Incrementar intentos fallidos
        UPDATE usuarios 
        SET intentos_fallidos = intentos_fallidos + 1,
            bloqueado_hasta = CASE 
                WHEN intentos_fallidos + 1 >= 5 THEN DATE_ADD(NOW(), INTERVAL 15 MINUTE)
                ELSE NULL
            END
        WHERE id = v_usuario_id;
        
        INSERT INTO logs_acceso (usuario_id, email_intentado, ip_address, user_agent, tipo_evento, exitoso, mensaje)
        VALUES (v_usuario_id, p_email, p_ip_address, p_user_agent, 'login_fallido', FALSE, 'Contraseña incorrecta');
        
        SELECT 'ERROR' as resultado, 'Credenciales inválidas' as mensaje;
    
    -- Login exitoso
    ELSE
        -- Resetear intentos fallidos y actualizar último acceso
        UPDATE usuarios 
        SET intentos_fallidos = 0, 
            bloqueado_hasta = NULL,
            ultimo_acceso = NOW()
        WHERE id = v_usuario_id;
        
        INSERT INTO logs_acceso (usuario_id, email_intentado, ip_address, user_agent, tipo_evento, exitoso, mensaje)
        VALUES (v_usuario_id, p_email, p_ip_address, p_user_agent, 'login_exitoso', TRUE, 'Login exitoso');
        
        -- Retornar información del usuario
        SELECT 'SUCCESS' as resultado, 
               'Login exitoso' as mensaje,
               u.id, u.nombre, u.email, u.email_verificado,
               p.avatar_url, p.ciudad, p.pais
        FROM usuarios u
        LEFT JOIN perfiles_usuario p ON u.id = p.usuario_id
        WHERE u.id = v_usuario_id;
    END IF;
END //

-- Procedimiento para crear sesión
CREATE PROCEDURE CrearSesion(
    IN p_session_id VARCHAR(128),
    IN p_usuario_id INT,
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT,
    IN p_recordar_sesion BOOLEAN
)
BEGIN
    DECLARE v_duracion_horas INT;
    
    -- Obtener duración de sesión de configuración
    SELECT CAST(valor AS UNSIGNED) INTO v_duracion_horas
    FROM configuracion_seguridad 
    WHERE clave = CASE 
        WHEN p_recordar_sesion THEN 'duracion_sesion_recordar_dias'
        ELSE 'duracion_sesion_horas'
    END;
    
    -- Insertar nueva sesión
    INSERT INTO sesiones (id, usuario_id, ip_address, user_agent, recordar_sesion, fecha_expiracion)
    VALUES (
        p_session_id, 
        p_usuario_id, 
        p_ip_address, 
        p_user_agent, 
        p_recordar_sesion,
        CASE 
            WHEN p_recordar_sesion THEN DATE_ADD(NOW(), INTERVAL v_duracion_horas DAY)
            ELSE DATE_ADD(NOW(), INTERVAL v_duracion_horas HOUR)
        END
    );
    
    SELECT 'SUCCESS' as resultado, 'Sesión creada correctamente' as mensaje;
END //

-- Procedimiento para validar sesión
CREATE PROCEDURE ValidarSesion(
    IN p_session_id VARCHAR(128)
)
BEGIN
    DECLARE v_usuario_id INT;
    DECLARE v_fecha_expiracion TIMESTAMP;
    DECLARE v_activa BOOLEAN;
    
    -- Obtener información de la sesión
    SELECT usuario_id, fecha_expiracion, activa
    INTO v_usuario_id, v_fecha_expiracion, v_activa
    FROM sesiones 
    WHERE id = p_session_id;
    
    -- Verificar si la sesión existe y está activa
    IF v_usuario_id IS NULL OR v_activa = FALSE THEN
        SELECT 'ERROR' as resultado, 'Sesión no válida' as mensaje;
    
    -- Verificar si la sesión ha expirado
    ELSEIF v_fecha_expiracion < NOW() THEN
        -- Marcar sesión como inactiva
        UPDATE sesiones SET activa = FALSE WHERE id = p_session_id;
        
        SELECT 'ERROR' as resultado, 'Sesión expirada' as mensaje;
    
    -- Sesión válida
    ELSE
        -- Actualizar última actividad
        UPDATE sesiones SET ultima_actividad = NOW() WHERE id = p_session_id;
        
        -- Retornar información del usuario
        SELECT 'SUCCESS' as resultado, 
               'Sesión válida' as mensaje,
               u.id, u.nombre, u.email, u.estado,
               p.avatar_url, p.ciudad, p.pais
        FROM usuarios u
        LEFT JOIN perfiles_usuario p ON u.id = p.usuario_id
        WHERE u.id = v_usuario_id;
    END IF;
END //

DELIMITER ;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de usuarios con su información completa
CREATE VIEW vista_usuarios_completa AS
SELECT 
    u.id,
    u.nombre,
    u.email,
    u.telefono,
    u.estado,
    u.email_verificado,
    u.acepta_newsletter,
    u.fecha_creacion,
    u.ultimo_acceso,
    p.avatar_url,
    p.bio,
    p.ciudad,
    p.pais,
    p.preferencias_culinarias,
    p.restricciones_alimentarias,
    p.presupuesto_promedio,
    p.puntuacion_promedio,
    p.total_reseñas,
    GROUP_CONCAT(r.nombre) as roles
FROM usuarios u
LEFT JOIN perfiles_usuario p ON u.id = p.usuario_id
LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
LEFT JOIN roles r ON ur.rol_id = r.id
WHERE ur.activo = TRUE OR ur.activo IS NULL
GROUP BY u.id;

-- Vista de estadísticas de acceso
CREATE VIEW vista_estadisticas_acceso AS
SELECT 
    DATE(fecha_evento) as fecha,
    COUNT(*) as total_eventos,
    SUM(CASE WHEN tipo_evento = 'login_exitoso' THEN 1 ELSE 0 END) as logins_exitosos,
    SUM(CASE WHEN tipo_evento = 'login_fallido' THEN 1 ELSE 0 END) as logins_fallidos,
    COUNT(DISTINCT usuario_id) as usuarios_unicos,
    COUNT(DISTINCT ip_address) as ips_unicas
FROM logs_acceso
GROUP BY DATE(fecha_evento)
ORDER BY fecha DESC;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX idx_email_estado ON usuarios(email, estado);
CREATE INDEX idx_usuario_fecha_acceso ON logs_acceso(usuario_id, fecha_evento);
CREATE INDEX idx_sesion_activa_expiracion ON sesiones(activa, fecha_expiracion);

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

/*
Esta base de datos incluye:

1. TABLAS PRINCIPALES:
   - usuarios: Información básica de usuarios
   - perfiles_usuario: Información extendida del perfil
   - sesiones: Gestión de sesiones activas
   - roles y usuario_roles: Sistema de permisos
   - proveedores_oauth: Login social
   - tokens_*: Recuperación y verificación
   - logs_acceso: Auditoría de accesos
   - configuracion_seguridad: Configuraciones del sistema

2. CARACTERÍSTICAS DE SEGURIDAD:
   - Contraseñas hasheadas
   - Bloqueo temporal por intentos fallidos
   - Gestión de sesiones con expiración
   - Tokens seguros para recuperación
   - Auditoría completa de accesos
   - Sistema de roles y permisos

3. PROCEDIMIENTOS ALMACENADOS:
   - AutenticarUsuario: Manejo completo de autenticación
   - CrearSesion: Creación de sesiones seguras
   - ValidarSesion: Validación de sesiones activas

4. VISTAS:
   - vista_usuarios_completa: Información completa de usuarios
   - vista_estadisticas_acceso: Estadísticas de uso

5. OPTIMIZACIONES:
   - Índices apropiados para consultas frecuentes
   - Claves foráneas para integridad referencial
   - Configuración flexible de seguridad

Para usar en producción:
- Cambiar contraseñas de ejemplo
- Configurar respaldos automáticos
- Implementar rotación de logs
- Configurar monitoreo de seguridad
*/