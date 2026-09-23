from database import obtener_conexion

imagenes = {
    "Sala": "images/sofa-oslo.jpg",
    "Dormitorio": "images/cama-aurora.jpg",
    "Comedor": "images/mesa-comedor-nordic.jpg",
    "Oficina": "images/escritorio-lyon.jpg",
    "Decoración": "images/lampara-torre.jpg",
    "Exterior": "images/silla-terra.jpg"
}

conexion = obtener_conexion()
cursor = conexion.cursor()

for categoria, imagen in imagenes.items():
    cursor.execute(
        """
        UPDATE categorias
        SET imagen = ?
        WHERE nombre = ?
        """,
        (imagen, categoria)
    )

conexion.commit()

print()
print("IMAGENES DE CATEGORIAS ACTUALIZADAS")
print()

cursor.execute("""
    SELECT id, nombre, imagen
    FROM categorias
    ORDER BY id
""")

categorias = cursor.fetchall()

for categoria in categorias:
    print(
        f"ID: {categoria['id']} | "
        f"{categoria['nombre']} | "
        f"{categoria['imagen']}"
    )

conexion.close()

print()
print("Proceso terminado correctamente.")