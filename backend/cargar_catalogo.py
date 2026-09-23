import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_FILE = BASE_DIR / "database" / "nova_living.db"

productos = [
    # SALA
    {
        "nombre": "Mesa de Centro Roma",
        "subcategoria_id": 3,
        "precio": 649000,
        "stock": 8,
        "descripcion": "Mesa de centro de diseño contemporáneo con acabado en madera natural.",
        "imagen": "mesa-centro-roma.jpg"
    },
    {
        "nombre": "Sillón Valencia",
        "subcategoria_id": 2,
        "precio": 899000,
        "stock": 6,
        "descripcion": "Sillón tapizado de líneas suaves, ideal para complementar espacios modernos.",
        "imagen": "sillon-valencia.jpg"
    },

    # DORMITORIO
    {
        "nombre": "Cama Aurora",
        "subcategoria_id": 4,
        "precio": 1599000,
        "stock": 5,
        "descripcion": "Cama de estilo contemporáneo pensada para crear un dormitorio cálido y elegante.",
        "imagen": "cama-aurora.jpg"
    },
    {
        "nombre": "Cómoda Milano",
        "subcategoria_id": 6,
        "precio": 1199000,
        "stock": 7,
        "descripcion": "Cómoda de madera con amplio espacio de almacenamiento y diseño minimalista.",
        "imagen": "comoda-milano.jpg"
    },
    {
        "nombre": "Mesa de Noche Siena",
        "subcategoria_id": 5,
        "precio": 459000,
        "stock": 10,
        "descripcion": "Mesa de noche compacta con acabado cálido para complementar cualquier dormitorio.",
        "imagen": "mesa-noche-siena.jpg"
    },

    # COMEDOR
    {
        "nombre": "Mesa Comedor Nordic",
        "subcategoria_id": 7,
        "precio": 1399000,
        "stock": 5,
        "descripcion": "Mesa de comedor de inspiración nórdica para reuniones familiares y sociales.",
        "imagen": "mesa-comedor-nordic.jpg"
    },
    {
        "nombre": "Silla Nordic",
        "subcategoria_id": 8,
        "precio": 329000,
        "stock": 18,
        "descripcion": "Silla tapizada de inspiración nórdica, cómoda y versátil para el comedor.",
        "imagen": "silla-nordic.jpg"
    },

    # OFICINA
    {
        "nombre": "Escritorio Lyon",
        "subcategoria_id": 10,
        "precio": 879000,
        "stock": 9,
        "descripcion": "Escritorio contemporáneo diseñado para oficinas y espacios de trabajo en casa.",
        "imagen": "escritorio-lyon.jpg"
    },
    {
        "nombre": "Estantería Milo",
        "subcategoria_id": 12,
        "precio": 749000,
        "stock": 7,
        "descripcion": "Estantería abierta de estructura ligera para organizar libros y objetos decorativos.",
        "imagen": "estanteria-milo.jpg"
    },

    # DECORACIÓN
    {
        "nombre": "Lámpara Torre",
        "subcategoria_id": 13,
        "precio": 389000,
        "stock": 12,
        "descripcion": "Lámpara de pie de diseño elegante para aportar iluminación cálida al ambiente.",
        "imagen": "lampara-torre.jpg"
    }
]

conexion = sqlite3.connect(DATABASE_FILE)
cursor = conexion.cursor()

# Crear subcategorías adicionales de decoración
nuevas_subcategorias = [
    (
        "Alfombras",
        5,
        "Alfombras decorativas para complementar los espacios.",
        None
    ),
    (
        "Plantas decorativas",
        5,
        "Elementos decorativos inspirados en la naturaleza.",
        None
    )
]

for nombre, categoria_id, descripcion, imagen in nuevas_subcategorias:

    cursor.execute(
        """
        SELECT id
        FROM subcategorias
        WHERE nombre = ?
        AND categoria_id = ?
        """,
        (nombre, categoria_id)
    )

    if cursor.fetchone() is None:

        cursor.execute(
            """
            INSERT INTO subcategorias
            (
                nombre,
                categoria_id,
                descripcion,
                imagen
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                nombre,
                categoria_id,
                descripcion,
                imagen
            )
        )

conexion.commit()

# Obtener IDs de las nuevas subcategorías

cursor.execute(
    """
    SELECT id
    FROM subcategorias
    WHERE nombre = 'Alfombras'
    AND categoria_id = 5
    """
)

alfombras = cursor.fetchone()

cursor.execute(
    """
    SELECT id
    FROM subcategorias
    WHERE nombre = 'Plantas decorativas'
    AND categoria_id = 5
    """
)

plantas = cursor.fetchone()

# Agregar productos de decoración

if alfombras:

    productos.append(
        {
            "nombre": "Alfombra Lisboa",
            "subcategoria_id": alfombras[0],
            "precio": 529000,
            "stock": 8,
            "descripcion": "Alfombra decorativa de textura suave para completar ambientes contemporáneos.",
            "imagen": "alfombra-lisboa.jpg"
        }
    )

if plantas:

    productos.append(
        {
            "nombre": "Planta Decorativa",
            "subcategoria_id": plantas[0],
            "precio": 189000,
            "stock": 15,
            "descripcion": "Elemento decorativo inspirado en la naturaleza para aportar frescura al hogar.",
            "imagen": "planta-decorativa.jpg"
        }
    )

# Insertar productos sin duplicarlos

insertados = 0
existentes = 0

for producto in productos:

    cursor.execute(
        """
        SELECT id
        FROM productos
        WHERE nombre = ?
        """,
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

# Mostrar catálogo final

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
    ORDER BY p.id
    """
)

productos_db = cursor.fetchall()

conexion.close()

print()
print("=" * 110)
print("                 CATÁLOGO NOVA LIVING")
print("=" * 110)
print()

for producto in productos_db:

    print(
        f"ID: {producto[0]:<3} | "
        f"{producto[1]:<28} | "
        f"{producto[2]:<12} | "
        f"{producto[3]:<22} | "
        f"${producto[4]:>10,.0f} | "
        f"Stock: {producto[5]:<3} | "
        f"{producto[6]}"
    )

print()
print("=" * 110)
print(f"Productos nuevos insertados: {insertados}")
print(f"Productos que ya existían: {existentes}")
print(f"Total de productos: {len(productos_db)}")
print("=" * 110)
print()
