import sqlite3
from pathlib import Path


# -----------------------------------------
# RUTA DE LA BASE DE DATOS
# -----------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_FILE = BASE_DIR / "database" / "nova_living.db"


# -----------------------------------------
# CONECTAR CON LA BASE DE DATOS
# -----------------------------------------

conexion = sqlite3.connect(DATABASE_FILE)

conexion.row_factory = sqlite3.Row

cursor = conexion.cursor()

cursor.execute("PRAGMA foreign_keys = ON")


# -----------------------------------------
# MOSTRAR PRODUCTOS ACTUALES
# -----------------------------------------

cursor.execute("""
    SELECT
        id,
        nombre,
        categoria,
        subcategoria,
        precio,
        stock,
        descripcion,
        imagen
    FROM productos
""")

productos = cursor.fetchall()


print("\nProductos encontrados:")

for producto in productos:
    print(
        f"ID: {producto['id']} | "
        f"{producto['nombre']} | "
        f"{producto['categoria']} | "
        f"{producto['subcategoria']}"
    )


# -----------------------------------------
# COMPROBAR QUE EXISTE SOFÁS
# -----------------------------------------

cursor.execute("""
    SELECT id
    FROM subcategorias
    WHERE nombre = 'Sofás'
      AND categoria_id = 1
""")

subcategoria = cursor.fetchone()


if subcategoria is None:

    conexion.close()

    raise Exception(
        "No se encontró la subcategoría 'Sofás'. "
        "La migración fue detenida."
    )


sofas_id = subcategoria["id"]


print(f"\nSubcategoría 'Sofás' encontrada. ID: {sofas_id}")


# -----------------------------------------
# CREAR NUEVA TABLA DE PRODUCTOS
# -----------------------------------------

cursor.execute("""
    CREATE TABLE productos_nueva (
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


# -----------------------------------------
# MIGRAR PRODUCTOS
# -----------------------------------------

for producto in productos:

    cursor.execute("""
        SELECT id
        FROM subcategorias
        WHERE nombre = ?
          AND categoria_id = (
              SELECT id
              FROM categorias
              WHERE nombre = ?
          )
    """, (
        producto["subcategoria"],
        producto["categoria"]
    ))

    subcategoria_producto = cursor.fetchone()

    if subcategoria_producto is None:

        conexion.rollback()
        conexion.close()

        raise Exception(
            f"No se encontró la relación "
            f"{producto['categoria']} → "
            f"{producto['subcategoria']} "
            f"para el producto '{producto['nombre']}'. "
            f"La migración fue detenida."
        )

    cursor.execute("""
        INSERT INTO productos_nueva (
            id,
            nombre,
            subcategoria_id,
            precio,
            stock,
            descripcion,
            imagen
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        producto["id"],
        producto["nombre"],
        subcategoria_producto["id"],
        producto["precio"],
        producto["stock"],
        producto["descripcion"],
        producto["imagen"]
    ))


# -----------------------------------------
# REEMPLAZAR TABLA ANTIGUA
# -----------------------------------------

cursor.execute("""
    DROP TABLE productos
""")

cursor.execute("""
    ALTER TABLE productos_nueva
    RENAME TO productos
""")


# -----------------------------------------
# GUARDAR CAMBIOS
# -----------------------------------------

conexion.commit()


# -----------------------------------------
# VERIFICAR MIGRACIÓN
# -----------------------------------------

cursor.execute("""
    SELECT
        p.id,
        p.nombre,
        p.subcategoria_id,
        s.nombre AS subcategoria,
        c.nombre AS categoria,
        p.precio,
        p.stock
    FROM productos p
    INNER JOIN subcategorias s
        ON p.subcategoria_id = s.id
    INNER JOIN categorias c
        ON s.categoria_id = c.id
    ORDER BY p.id
""")

productos_migrados = cursor.fetchall()


print("\n-----------------------------------------")
print("MIGRACIÓN COMPLETADA")
print("-----------------------------------------")

for producto in productos_migrados:

    print(
        f"ID: {producto['id']} | "
        f"{producto['nombre']} | "
        f"{producto['categoria']} → "
        f"{producto['subcategoria']} | "
        f"Subcategoría ID: {producto['subcategoria_id']} | "
        f"Precio: {producto['precio']} | "
        f"Stock: {producto['stock']}"
    )


conexion.close()

print("\nBase de datos actualizada correctamente.")