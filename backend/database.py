import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_DIR = BASE_DIR / "database"
DATABASE_FILE = DATABASE_DIR / "nova_living.db"


def obtener_conexion():
    DATABASE_DIR.mkdir(exist_ok=True)

    conexion = sqlite3.connect(DATABASE_FILE)
    conexion.row_factory = sqlite3.Row

    conexion.execute("PRAGMA foreign_keys = ON")

    return conexion


def crear_tabla_categorias():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE,
            descripcion TEXT,
            imagen TEXT
        )
    """)

    conexion.commit()
    conexion.close()


def crear_tabla_subcategorias():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS subcategorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            categoria_id INTEGER NOT NULL,
            descripcion TEXT,
            imagen TEXT,
            FOREIGN KEY (categoria_id)
                REFERENCES categorias(id)
                ON DELETE CASCADE,
            UNIQUE(nombre, categoria_id)
        )
    """)

    conexion.commit()
    conexion.close()


def crear_tabla_productos():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            subcategoria_id INTEGER NOT NULL,
            precio REAL NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            descripcion TEXT,
            imagen TEXT,
            FOREIGN KEY (subcategoria_id)
                REFERENCES subcategorias(id)
                ON DELETE RESTRICT
        )
    """)

    conexion.commit()
    conexion.close()


def crear_tabla_clientes():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            apellido TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            telefono TEXT,
            direccion TEXT,
            ciudad TEXT,
            fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conexion.commit()
    conexion.close()


def crear_tabla_pedidos():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id INTEGER NOT NULL,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            estado TEXT NOT NULL DEFAULT 'pendiente',
            total REAL NOT NULL DEFAULT 0,
            direccion_entrega TEXT,
            ciudad_entrega TEXT,
            observaciones TEXT,
            FOREIGN KEY (cliente_id)
                REFERENCES clientes(id)
                ON DELETE RESTRICT
        )
    """)

    conexion.commit()
    conexion.close()


def crear_tabla_detalle_pedido():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS detalle_pedido (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER NOT NULL,
            producto_id INTEGER NOT NULL,
            cantidad INTEGER NOT NULL,
            precio_unitario REAL NOT NULL,
            subtotal REAL NOT NULL,
            FOREIGN KEY (pedido_id)
                REFERENCES pedidos(id)
                ON DELETE CASCADE,
            FOREIGN KEY (producto_id)
                REFERENCES productos(id)
                ON DELETE RESTRICT
        )
    """)

    conexion.commit()
    conexion.close()


def crear_tabla_configuracion():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS configuracion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_tienda TEXT NOT NULL,
            correo TEXT,
            telefono TEXT,
            whatsapp TEXT,
            direccion TEXT,
            ciudad TEXT,
            horario TEXT,
            informacion_entregas TEXT,
            mensaje_tienda TEXT
        )
    """)

    cursor.execute("""
        SELECT COUNT(*) AS cantidad
        FROM configuracion
    """)

    resultado = cursor.fetchone()

    if resultado["cantidad"] == 0:
        cursor.execute("""
            INSERT INTO configuracion (
                nombre_tienda,
                correo,
                telefono,
                whatsapp,
                direccion,
                ciudad,
                horario,
                informacion_entregas,
                mensaje_tienda
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "Nova Living",
            "contacto@novaliving.com",
            "300 000 0000",
            "300 000 0000",
            "Dirección de demostración",
            "Cali",
            "Lunes a sábado · 8:00 a.m. - 6:00 p.m.",
            "Realizamos entregas según cobertura y disponibilidad.",
            "Muebles y decoración para transformar tu hogar."
        ))

    conexion.commit()
    conexion.close()


def crear_tabla_pagos():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pagos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER NOT NULL UNIQUE,
            metodo TEXT NOT NULL,
            estado TEXT NOT NULL DEFAULT 'pendiente',
            referencia TEXT,
            monto REAL NOT NULL DEFAULT 0,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            observaciones TEXT,
            FOREIGN KEY (pedido_id)
                REFERENCES pedidos(id)
                ON DELETE CASCADE
        )
    """)

    conexion.commit()
    conexion.close()