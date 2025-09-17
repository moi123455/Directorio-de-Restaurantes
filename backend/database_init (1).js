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
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'directorio_restaurantes'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        
        // Seleccionar la base de datos
        await connection.execute(`USE ${process.env.DB_NAME || 'directorio_restaurantes'}`);
        
        // Crear tabla de restaurantes
        console.log('Creando tabla de restaurantes...');
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
                