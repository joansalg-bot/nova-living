# ============================================================
# NOVA LIVING
# CARGADOR INICIAL DEL CATÁLOGO
# ============================================================

from database import (
    obtener_conexion,
    crear_tabla_categorias,
    crear_tabla_subcategorias,
    crear_tabla_productos,
    crear_tabla_configuracion
)


CATEGORIAS = [
    {
        "nombre": "Sala",
        "descripcion": "Sofás, poltronas y mesas para crear espacios acogedores.",
        "imagen": "images/sofa-oslo.jpg"
    },
    {
        "nombre": "Dormitorio",
        "descripcion": "Muebles pensados para crear dormitorios cómodos y elegantes.",
        "imagen": "images/cama-aurora.jpg"
    },
    {
        "nombre": "Comedor",
        "descripcion": "Mesas y sillas para compartir momentos especiales.",
        "imagen": "images/mesa-comedor-nordic.jpg"
    },
    {
        "nombre": "Oficina",
        "descripcion": "Soluciones funcionales para estudiar, trabajar y organizar.",
        "imagen": "images/escritorio-lyon.jpg"
    },
    {
        "nombre": "Decoración",
        "descripcion": "Detalles que aportan personalidad y estilo a cada espacio.",
        "imagen": "images/lampara-torre.jpg"
    },
    {
        "nombre": "Exterior",
        "descripcion": "Muebles para terrazas, balcones y espacios exteriores.",
        "imagen": "images/silla-terra.jpg"
    }
]


SUBCATEGORIAS = [
    ("Sofás", "Sala"),
    ("Poltronas", "Sala"),
    ("Mesas de centro", "Sala"),

    ("Camas", "Dormitorio"),
    ("Mesas de noche", "Dormitorio"),
    ("Cómodas", "Dormitorio"),

    ("Mesas", "Comedor"),
    ("Sillas", "Comedor"),
    ("Juegos de comedor", "Comedor"),

    ("Escritorios", "Oficina"),
    ("Sillas", "Oficina"),
    ("Estanterías", "Oficina"),

    ("Lámparas", "Decoración"),
    ("Espejos", "Decoración"),
    ("Cuadros", "Decoración"),
    ("Alfombras", "Decoración"),
    ("Plantas decorativas", "Decoración"),

    ("Sillas", "Exterior"),
    ("Mesas", "Exterior"),
    ("Muebles para terraza", "Exterior")
]


PRODUCTOS = [
    {
        "nombre": "Sofá Oslo",
        "subcategoria": "Sofás",
        "categoria": "Sala",
        "precio": 1899000,
        "stock": 5,
        "descripcion": "Sofá moderno de tres puestos para espacios contemporáneos.",
        "imagen": "sofa-oslo.jpg"
    },
    {
        "nombre": "Mesa de Centro Roma",
        "subcategoria": "Mesas de centro",
        "categoria": "Sala",
        "precio": 649000,
        "stock": 8,
        "descripcion": "Mesa de centro de diseño moderno para complementar tu sala.",
        "imagen": "mesa-centro-roma.jpg"
    },
    {
        "nombre": "Sillón Valencia",
        "subcategoria": "Poltronas",
        "categoria": "Sala",
        "precio": 899000,
        "stock": 6,
        "descripcion": "Poltrona elegante y confortable para espacios contemporáneos.",
        "imagen": "sillon-valencia.jpg"
    },

    {
        "nombre": "Cama Aurora",
        "subcategoria": "Camas",
        "categoria": "Dormitorio",
        "precio": 1599000,
        "stock": 5,
        "descripcion": "Cama de diseño moderno para transformar tu dormitorio.",
        "imagen": "cama-aurora.jpg"
    },
    {
        "nombre": "Cómoda Milano",
        "subcategoria": "Cómodas",
        "categoria": "Dormitorio",
        "precio": 1199000,
        "stock": 7,
        "descripcion": "Cómoda amplia y elegante para mantener tus espacios organizados.",
        "imagen": "comoda-milano.jpg"
    },
    {
        "nombre": "Mesa de Noche Siena",
        "subcategoria": "Mesas de noche",
        "categoria": "Dormitorio",
        "precio": 459000,
        "stock": 10,
        "descripcion": "Mesa de noche compacta con diseño contemporáneo.",
        "imagen": "mesa-noche-siena.jpg"
    },

    {
        "nombre": "Mesa Comedor Nordic",
        "subcategoria": "Mesas",
        "categoria": "Comedor",
        "precio": 1399000,
        "stock": 5,
        "descripcion": "Mesa de comedor de estilo nórdico para compartir en familia.",
        "imagen": "mesa-comedor-nordic.jpg"
    },
    {
        "nombre": "Silla Nordic",
        "subcategoria": "Sillas",
        "categoria": "Comedor",
        "precio": 329000,
        "stock": 18,
        "descripcion": "Silla de comedor cómoda con diseño nórdico.",
        "imagen": "silla-nordic.jpg"
    },

    {
        "nombre": "Escritorio Lyon",
        "subcategoria": "Escritorios",
        "categoria": "Oficina",
        "precio": 879000,
        "stock": 9,
        "descripcion": "Escritorio funcional y elegante para trabajar o estudiar.",
        "imagen": "escritorio-lyon.jpg"
    },
    {
        "nombre": "Estantería Milo",
        "subcategoria": "Estanterías",
        "categoria": "Oficina",
        "precio": 749000,
        "stock": 7,
        "descripcion": "Estantería moderna para organizar libros y objetos.",
        "imagen": "estanteria-milo.jpg"
    },

    {
        "nombre": "Lámpara Torre",
        "subcategoria": "Lámparas",
        "categoria": "Decoración",
        "precio": 389000,
        "stock": 12,
        "descripcion": "Lámpara decorativa de diseño elegante para interiores.",
        "imagen": "lampara-torre.jpg"
    },
    {
        "nombre": "Alfombra Lisboa",
        "subcategoria": "Alfombras",
        "categoria": "Decoración",
        "precio": 529000,
        "stock": 8,
        "descripcion": "Alfombra decorativa para aportar calidez y personalidad.",
        "imagen": "alfombra-lisboa.jpg"
    },
    {
        "nombre": "Planta Decorativa",
        "subcategoria": "Plantas decorativas",
        "categoria": "Decoración",
        "precio": 189000,
        "stock": 15,
        "descripcion": "Planta decorativa para complementar espacios modernos.",
        "imagen": "planta-decorativa.jpg"
    },

    {
        "nombre": "Silla Terra",
        "subcategoria": "Sillas",
        "categoria": "Exterior",
        "precio": 429000,
        "stock": 10,
        "descripcion": "Silla resistente y elegante para espacios exteriores.",
        "imagen": "silla-terra.jpg"
    },
    {
        "nombre": "Mesa Terra",
        "subcategoria": "Mesas",
        "categoria": "Exterior",
        "precio": 1199000,
        "stock": 6,
        "descripcion": "Mesa para exteriores con diseño moderno y funcional.",
        "imagen": "mesa-terra.jpg"
    },
    {
        "nombre": "Mueble Terraza Nova",
        "subcategoria": "Muebles para terraza",
        "categoria": "Exterior",
        "precio": 2599000,
        "stock": 4,
        "descripcion": "Mueble completo para crear un espacio exterior confortable.",
        "imagen": "mueble-terraza-nova.jpg"
    }
]


def cargar_catalogo():
    """
    Crea las tablas y carga el catálogo únicamente
    cuando la base de datos todavía está vacía.
    """

    crear_tabla_categorias()
    crear_tabla_subcategorias()
    crear_tabla_productos()
    crear_tabla_configuracion()

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    # --------------------------------------------------------
    # COMPROBAR SI YA EXISTE EL CATÁLOGO
    # --------------------------------------------------------

    cursor.execute("SELECT COUNT(*) AS cantidad FROM productos")
    cantidad_productos = cursor.fetchone()["cantidad"]

    if cantidad_productos > 0:
        conexion.close()
        print("Nova Living: el catálogo ya existe.")
        return

    # --------------------------------------------------------
    # CATEGORÍAS
    # --------------------------------------------------------

    categoria_ids = {}

    for categoria in CATEGORIAS:

        cursor.execute("""
            INSERT OR IGNORE INTO categorias (
                nombre,
                descripcion,
                imagen
            )
            VALUES (?, ?, ?)
        """, (
            categoria["nombre"],
            categoria["descripcion"],
            categoria["imagen"]
        ))

        cursor.execute("""
            SELECT id
            FROM categorias
            WHERE nombre = ?
        """, (categoria["nombre"],))

        categoria_id = cursor.fetchone()["id"]

        categoria_ids[categoria["nombre"]] = categoria_id

    # --------------------------------------------------------
    # SUBCATEGORÍAS
    # --------------------------------------------------------

    subcategoria_ids = {}

    for nombre, categoria_nombre in SUBCATEGORIAS:

        categoria_id = categoria_ids[categoria_nombre]

        cursor.execute("""
            INSERT OR IGNORE INTO subcategorias (
                nombre,
                categoria_id,
                descripcion,
                imagen
            )
            VALUES (?, ?, ?, ?)
        """, (
            nombre,
            categoria_id,
            f"Productos de {nombre.lower()} de Nova Living.",
            None
        ))

        cursor.execute("""
            SELECT id
            FROM subcategorias
            WHERE nombre = ?
              AND categoria_id = ?
        """, (
            nombre,
            categoria_id
        ))

        subcategoria_id = cursor.fetchone()["id"]

        subcategoria_ids[
            (categoria_nombre, nombre)
        ] = subcategoria_id

    # --------------------------------------------------------
    # PRODUCTOS
    # --------------------------------------------------------

    for producto in PRODUCTOS:

        subcategoria_id = subcategoria_ids[
            (
                producto["categoria"],
                producto["subcategoria"]
            )
        ]

        cursor.execute("""
            INSERT INTO productos (
                nombre,
                subcategoria_id,
                precio,
                stock,
                descripcion,
                imagen
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            producto["nombre"],
            subcategoria_id,
            producto["precio"],
            producto["stock"],
            producto["descripcion"],
            producto["imagen"]
        ))

    conexion.commit()
    conexion.close()

    print("============================================")
    print("NOVA LIVING")
    print("Catálogo cargado correctamente.")
    print(f"Categorías: {len(CATEGORIAS)}")
    print(f"Subcategorías: {len(SUBCATEGORIAS)}")
    print(f"Productos: {len(PRODUCTOS)}")
    print("============================================")


if __name__ == "__main__":
    cargar_catalogo()