import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_FILE = BASE_DIR / "database" / "nova_living.db"

conexion = sqlite3.connect(DATABASE_FILE)
cursor = conexion.cursor()

productos = [
    {
        "nombre": "Silla Terra",
        "subcategoria_id": 16,
        "precio": 429000,
        "stock": 10,
        "descripcion": "Silla de exterior con diseño contemporáneo, ideal para terrazas y jardines.",
        "imagen": "silla-terra.jpg"
    },
    {
        "nombre": "Mesa Terra",
        "subcategoria_id": 17,
        "precio": 1199000,
        "stock": 6,
        "descripcion": "Mesa de exterior en madera sintética con estructura metálica, perfecta para compartir grandes momentos.",
        "imagen": "mesa-terra.jpg"
    },
    {
        "nombre": "Mueble Terraza Nova",
        "subcategoria_id": 18,
        "precio": 2599000,
        "stock": 4,
        "descripcion": "Sala de exterior modular, cómoda y elegante, ideal para disfrutar al aire libre.",
        "imagen": "mueble-terraza-nova.jpg"
    }
]

insertados = 0
existentes = 0

for producto in productos:

    cursor.execute(
        "SELECT id FROM productos WHERE nombre = ?",
        (producto["nombre"],)
    )

    if cursor.fetchone() is not None:
        existentes += 1
        continue

    cursor.execute(
        """
        INSERT INTO productos
        (
            nombre,
            subcategoria_id,
            precio,
            stock,
            descripcion,
            imagen
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            producto["nombre"],
            producto["subcategoria_id"],
            producto["precio"],
            producto["stock"],
            producto["descripcion"],
            producto["imagen"]
        )
    )

    insertados += 1

conexion.commit()

cursor.execute(
    """
    SELECT
        p.id,
        p.nombre,
        c.nombre AS categoria,
        s.nombre AS subcategoria,
        p.precio,
        p.stock,
        p.imagen
    FROM productos p
    INNER JOIN subcategorias s
        ON p.subcategoria_id = s.id
    INNER JOIN categorias c
        ON s.categoria_id = c.id
    WHERE c.id = 6
    ORDER BY p.id
    """
)

productos_exterior = cursor.fetchall()

conexion.close()

print()
print("=" * 100)
print("                 PRODUCTOS DE EXTERIOR")
print("=" * 100)
print()

for producto in productos_exterior:
    print(
        f"ID: {producto[0]:<3} | "
        f"{producto[1]:<25} | "
        f"{producto[3]:<22} | "
        f"${producto[4]:>10,.0f} | "
        f"Stock: {producto[5]:<3} | "
        f"{producto[6]}"
    )

print()
print("=" * 100)
print(f"Productos nuevos insertados: {insertados}")
print(f"Productos que ya existían: {existentes}")
print(f"Total de productos de Exterior: {len(productos_exterior)}")
print("=" * 100)
print()
