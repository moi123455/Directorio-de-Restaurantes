const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
};

async function initializeDatabase() {
    let connection;
    
    try {
        console.log('Conectando a MySQL...');
        connection = await mysql.createConnection(dbConfig);
        
        // Crear la base de datos si no existe
        console.log('Creando base de datos...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'directorio_restaurantes'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        
        // Seleccionar la base de datos
        await connection.query(`USE \`${process.env.DB_NAME || 'directorio_restaurantes'}\``);
        
        // Crear tabla de restaurantes
        console.log('Creando tabla de restaurantes...');
        const createRestaurantesTable = `
            CREATE TABLE IF NOT EXISTS restaurantes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                propietario VARCHAR(255) NOT NULL,
                telefono VARCHAR(50) NOT NULL,
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
                activo BOOLEAN DEFAULT true,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_slug (slug),
                INDEX idx_ciudad (ciudad),
                INDEX idx_tipo_comida (tipo_comida),
                INDEX idx_activo (activo)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        await connection.query(createRestaurantesTable);

        // Crear tabla de reservas
        console.log('Creando tabla de reservas...');
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
                fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id) ON DELETE CASCADE,
                INDEX idx_restaurante (restaurante_id),
                INDEX idx_fecha (fecha_reserva),
                INDEX idx_estado (estado)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        await connection.query(createReservasTable);

        // Crear tabla de administradores
        console.log('Creando tabla de administradores...');
        const createAdminTable = `
            CREATE TABLE IF NOT EXISTS administradores (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                nombre_completo VARCHAR(255) NOT NULL,
                activo BOOLEAN DEFAULT true,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_ultimo_acceso TIMESTAMP NULL,
                INDEX idx_username (username),
                INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        await connection.query(createAdminTable);

        // Limpiar tabla de restaurantes antes de insertar
        console.log('Limpiando tabla de restaurantes...');
        await connection.query('TRUNCATE TABLE restaurantes');



        // Insertar restaurantes default
        console.log('Insertando restaurantes por defecto...');
        const insertDefaultRestaurants = `
            INSERT INTO restaurantes (
                nombre, propietario, telefono, email, direccion, ciudad, tipo_comida,
                descripcion, platos_especiales, horario_apertura, horario_cierre,
                dias_atencion, rango_precios, slug, redes_sociales, comentarios
            ) VALUES 
            (
                'Restaurante Sicilia',
                'Moises Rojas',
                '+58 49 247 67434 / +58 49 214 258740',
                'RestSicilia@gmail.com',
                'Calle 5B, Circunvalación 2, Zulia',
                'Zulia',
                'Gastronomia Zuliana y fiestera',
                'Somos excelencia Gourmet: una mezcla de exquisitos aromas y sabores que harán derretir tu paladar. Desde la tradición y excelencia se fusionan en cada plato, ofreciendo un ambiente distinguido, atención excepcional y sabores inolvidables.',
                'Pasticho, Pabellón criollo, Pollo a la brasa',
                '08:00:00',
                '09:00:00',
                'Lunes a Viernes, Sábados y Domingos',
                'moderado',
                'sicilia',
                'Facebook, Instagram',
                'Pago: Efectivo, transferencia o débito/crédito. Cancelaciones: 50% de cargo con anticipación. Alergias: informar al personal.'
            ),
            (
                'Sabor Zuliano',
                'Daniel Sandoval',
                '+58 587 456 8743',
                'saborzuliano@gmail.com',
                'Calle #1',
                'Maracaibo',
                'zuliana tradicional',
                'Disfruta de la auténtica cocina Zuliana, donde te transportaremos a los recuerdos de tu infancia con nuestra deliciosa comida.',
                'Patacón Especial, Chivo guisado en coco, Mandocas Especiales, Pescado Frito',
                '10:00:00',
                '10:00:00',
                'Lunes, Martes a Domingo',
                'alto',
                'sabor-zuliano',
                'Facebook, Twitter, WhatsApp',
                'Pago solo en efectivo. No se sirven bebidas alcohólicas. No se aceptan mascotas ni reservas. No se ofrece delivery. No se permite fumar ni la entrada de menores de 12 años.'
            )
        `;
        await connection.query(insertDefaultRestaurants);

        console.log('✅ Base de datos inicializada exitosamente!');
        console.log('📊 Tablas creadas: restaurantes, reservas, administradores');
        console.log('🏪 Restaurantes por defecto insertados: 2');
        
    } catch (error) {
        console.error('❌ Error inicializando la base de datos:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión a la base de datos cerrada');
        }
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };
