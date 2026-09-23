from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import obtener_conexion


router = APIRouter(
    prefix="/subcategorias",
    tags=["Subcategorías"]
)


# -----------------------------------------
# MODELO DE SUBCATEGORÍA
# -----------------------------------------

class Subcategoria(BaseModel):
    nombre: str
    categoria_id: int
    descripcion: str | None = None
    imagen: str | None = None


# -----------------------------------------
# OBTENER TODAS LAS SUBCATEGORÍAS
# -----------------------------------------

@router.get("/")
def obtener_subcategorias():

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            s.id,
            s.nombre,
            s.categoria_id,
            c.nombre AS categoria,
            s.descripcion,
            s.imagen
        FROM subcategorias s
        INNER JOIN categorias c
            ON s.categoria_id = c.id
        ORDER BY s.categoria_id, s.id
    """)

    subcategorias = cursor.fetchall()

    conexion.close()

    return {
        "subcategorias": [dict(subcategoria) for subcategoria in subcategorias]
    }


# -----------------------------------------
# OBTENER UNA SUBCATEGORÍA
# -----------------------------------------

@router.get("/{subcategoria_id}")
def obtener_subcategoria(subcategoria_id: int):

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            s.id,
            s.nombre,
            s.categoria_id,
            c.nombre AS categoria,
            s.descripcion,
            s.imagen
        FROM subcategorias s
        INNER JOIN categorias c
            ON s.categoria_id = c.id
        WHERE s.id = ?
    """, (subcategoria_id,))

    subcategoria = cursor.fetchone()

    conexion.close()

    if subcategoria is None:
        raise HTTPException(
            status_code=404,
            detail="Subcategoría no encontrada"
        )

    return dict(subcategoria)


# -----------------------------------------
# CREAR SUBCATEGORÍA
# -----------------------------------------

@router.post("/")
def crear_subcategoria(subcategoria: Subcategoria):

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    # Comprobar que la categoría existe
    cursor.execute(
        "SELECT id FROM categorias WHERE id = ?",
        (subcategoria.categoria_id,)
    )

    categoria = cursor.fetchone()

    if categoria is None:

        conexion.close()

        raise HTTPException(
            status_code=404,
            detail="La categoría indicada no existe"
        )

    try:

        cursor.execute("""
            INSERT INTO subcategorias (
                nombre,
                categoria_id,
                descripcion,
                imagen
            )
            VALUES (?, ?, ?, ?)
        """, (
            subcategoria.nombre,
            subcategoria.categoria_id,
            subcategoria.descripcion,
            subcategoria.imagen
        ))

        conexion.commit()

        nueva_id = cursor.lastrowid

    except Exception:

        conexion.close()

        raise HTTPException(
            status_code=400,
            detail="La subcategoría ya existe dentro de esta categoría"
        )

    conexion.close()

    return {
        "mensaje": "Subcategoría creada correctamente",
        "subcategoria_id": nueva_id
    }


# -----------------------------------------
# MODIFICAR SUBCATEGORÍA
# -----------------------------------------

@router.put("/{subcategoria_id}")
def modificar_subcategoria(
    subcategoria_id: int,
    subcategoria: Subcategoria
):

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    # Comprobar que existe la subcategoría
    cursor.execute(
        "SELECT id FROM subcategorias WHERE id = ?",
        (subcategoria_id,)
    )

    subcategoria_existente = cursor.fetchone()

    if subcategoria_existente is None:

        conexion.close()

        raise HTTPException(
            status_code=404,
            detail="Subcategoría no encontrada"
        )

    # Comprobar que existe la categoría
    cursor.execute(
        "SELECT id FROM categorias WHERE id = ?",
        (subcategoria.categoria_id,)
    )

    categoria = cursor.fetchone()

    if categoria is None:

        conexion.close()

        raise HTTPException(
            status_code=404,
            detail="La categoría indicada no existe"
        )

    try:

        cursor.execute("""
            UPDATE subcategorias
            SET
                nombre = ?,
                categoria_id = ?,
                descripcion = ?,
                imagen = ?
            WHERE id = ?
        """, (
            subcategoria.nombre,
            subcategoria.categoria_id,
            subcategoria.descripcion,
            subcategoria.imagen,
            subcategoria_id
        ))

        conexion.commit()

    except Exception:

        conexion.close()

        raise HTTPException(
            status_code=400,
            detail="No se pudo actualizar la subcategoría"
        )

    conexion.close()

    return {
        "mensaje": "Subcategoría actualizada correctamente",
        "subcategoria_id": subcategoria_id
    }


# -----------------------------------------
# ELIMINAR SUBCATEGORÍA
# -----------------------------------------

@router.delete("/{subcategoria_id}")
def eliminar_subcategoria(subcategoria_id: int):

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute(
        "SELECT id FROM subcategorias WHERE id = ?",
        (subcategoria_id,)
    )

    subcategoria = cursor.fetchone()

    if subcategoria is None:

        conexion.close()

        raise HTTPException(
            status_code=404,
            detail="Subcategoría no encontrada"
        )

    cursor.execute(
        "DELETE FROM subcategorias WHERE id = ?",
        (subcategoria_id,)
    )

    conexion.commit()
    conexion.close()

    return {
        "mensaje": "Subcategoría eliminada correctamente",
        "subcategoria_id": subcategoria_id
    }