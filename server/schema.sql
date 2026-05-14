-- =====================================================================
-- SCRIPT DE CREACION DE BASE DE DATOS: CLYRO_DB
-- EQUIPO: Koffengenieers
-- PROYECTO MARKETPLACE 
-- MOTOR: MariaDB 
-- =====================================================================

-- 1. Crear y usar la base de datos
CREATE DATABASE IF NOT EXISTS clyro_db;
USE clyro_db;

-- 2. Limpieza de tablas (Salvavidas para reiniciar rapido)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS detalles_pedido, pedidos, carrito, metodos_envio, productos, categorias, usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- CREACION DE TABLAS
-- =====================================================================

-- 3. Tabla de Usuarios (Soporta Roles y Hash de Contrasenas)
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'cliente') DEFAULT 'cliente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Categorias
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- 5. Tabla de Productos (Catalogo y Stock)
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    imagen_url VARCHAR(255),
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE RESTRICT
);

-- 6. Tabla de Metodos de Envio (Cumple con el requisito de 2 modalidades)
CREATE TABLE metodos_envio (
    id_metodo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    costo DECIMAL(10,2) NOT NULL,
    tiempo_estimado VARCHAR(50)
);

-- 7. Tabla del Carrito (Para persistencia de datos)
CREATE TABLE carrito (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
);

-- 8. Tabla de Pedidos (Checkout y Datos de Envio)
CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_metodo_envio INT NOT NULL,
    direccion_calle VARCHAR(255) NOT NULL, 
    ciudad VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    telefono_contacto VARCHAR(20) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente', 'pagado', 'enviado', 'entregado') DEFAULT 'pendiente',
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    FOREIGN KEY (id_metodo_envio) REFERENCES metodos_envio(id_metodo) ON DELETE RESTRICT
);

-- 9. Tabla de Detalles del Pedido
CREATE TABLE detalles_pedido (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE RESTRICT
);

-- =====================================================================
-- DATOS SEMILLA (Informacion precargada y pruebas previas)
-- =====================================================================

-- Categorias base AGREGAR MAS 
INSERT INTO categorias (nombre) 
VALUES ('Tecnologia'), ('Ropa y Accesorios'), ('Hogar');

-- Los 2 metodos de envio requeridos:
INSERT INTO metodos_envio (nombre, costo, tiempo_estimado) 
VALUES ('Envio Estandar', 99.00, '3 a 5 dias habiles'), 
       ('Envio Expres', 199.00, 'Mismo dia');

-- Usuarios de prueba
INSERT INTO usuarios (nombre_completo, correo, contrasena_hash, rol) VALUES 
('adminangel', 'adminangel@gmail.com', 'kofeengineers', 'admin'),
('Jose Juarez', 'josej2@gmail.com', '123', 'cliente');

-- Productos de prueba
INSERT INTO productos (id_categoria, nombre, descripcion, precio, stock, imagen_url) VALUES 
(1, 'Laptop Pro 14', 'Procesador de ultima generacion, 16GB RAM', 25000.00, 10, 'https://cityshop.mx/assets/imagenes/productos/cityshop-pv14250_i5rplr16512pwps_1w-2v2pw-nb-dell-pro-14-pv14250_i5rplr16512pwps_1w_0.webp'),
(1, 'Audifonos Wireless', 'Cancelacion de ruido activa', 3500.00, 25, 'https://m.media-amazon.com/images/I/41VEMU8feUL._AC_SX300_SY300_QL70_ML2_.jpg');

-- Simulación de Carrito (Jose Juarez tiene la Laptop en su carrito)
INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (2, 1, 1);
