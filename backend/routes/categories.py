from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import obtener_conexion


router = APIRouter(
    prefix="/categorias",
    tags=["Categorías"]
)


# -----------------------------------------
# MODELO DE CATEGORÍA
# -----------------------------------------

class Categoria(BaseModel):
    nombre: str
    descripcion: str | None = None
    imagen: str | None = None


# -----------------------------------------
# OBTENER TODAS LAS CATEGORÍAS
# -----------------------------------------

@router.get("/")
def obtener_categorias():

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            id,
            nombre,
            descripcion,
            imagen
        FROM categorias
        ORDER BY id
    """)

    categorias = cursor.fetchall()

    conexion.close()

    return {
        "categorias": [dict(categoria) for categoria in categorias]
    }


# -----------------------------------------
# OBTENER SUBCATEGORÍAS DE UNA CATEGORÍA
# -----------------------------------------

@router.get("/{categoria_id}/subcategorias")
def obtener_subcategorias_por_categoria(categoria_id: int):

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    # -----------------------------------------
    # COMPROBAR QUE LA CATEGORÍA EXISTE
    # -----------------------------------------

    cursor.execute("""
        SELECT
            id,
            nombre
        FROM categorias
        WHERE id = ?
    """, (categoria_id,))

    categoria = cursor.fetchone()

    if categoria is None:

        conexion.close()

        raise HTTPException(
            status_code=404,
            detail="Categoría no encontrada"
        )

    # -----------------------------------------
    # OBTENER SUBCATEGORÍAS
    # -----------------------------------------

    cursor.execute("""
        SELECT
            id,
            nombre,
            descripcion,
            imagen
        FROM subcategorias
        WHERE categoria_id = ?
        ORDER BY id
    """, (categoria_id,))

    subcategorias = cursor.fetchall()

    conexion.close()

    return {
        "categoria": dict(categoria),
        "subcategorias": [
            dict(subcategoria)
            for subcategoria in subcategorias
        ]
    }


# -----------------------------------------
# OBTENER UNA CATEGORÍA
# -----------------------------------------

@router.get("/{categoria_id}")
def obtener_categoria(categoria_id: int):

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            id,
            nombre,
            descripcion,
            imagen
        FROM categorias
        WHERE id = ?
    """, (categoria_id,))

    categoria = cursor.fetchone()

    conexion.close()

    if categoria is None:
        raise HTTPException(
            status_code=404,
            detail="Categoría no encontrada"
        )

    return dict(categoria)


# -----------------------------------------
# CREAR CATEGORÍA
# -----------------------------------------

@router.post("/")
def crear_categoria(categoria: Categoria):

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    try:

        cursor.execute("""
            INSERT INTO categorias (
                nombre,
                descripcion,
                imagen
            )
            VALUES (?, ?, ?)
        """, (
            categoria.nombre,
            categoria.descripcion,
            categoria.imagen
        ))

        conexion.commit()

        nueva_id = cursor.lastrowid

    except Exception:

        conexion.close()

        raise HTTPException(
            status_code=400,
            detail="La categoría ya existe"
        )

    conexion.close()

    return {
        "mensaje": "Categoría creada correctamente",
        "categoria_id": nueva_id
    }


# -----------------------------------------
# MODIFICAR CATEGORÍA
# -----------------------------------------

@router.put("/{categoria_id}")
def modificar_categoria(
    categoria_id: int,
    categoria: Categoria
):

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute(
        "SELECT id FROM categorias WHERE id = ?",
        (categoria_id,)
    )

    categoria_existente = cursor.fetchone()

    if categoria_existente is None:

        conexion.close()

        raise HTTPException(
            status_code=404,
            detail="Categoría no encontrada"
        )

    try:

        cursor.execute("""
            UPDATE categorias
            SET
                nombre = ?,
                descripcion = ?,
                imagen = ?
            WHERE id = ?
        """, (
            categoria.nombre,
            categoria.descripcion,
            categoria.imagen,
            categoria_id
        ))

        conexion.commit()

    except Exception:

        conexion.close()

        raise HTTPException(
            status_code=400,
            detail="No se pudo actualizar la categoría"
        )

    conexion.close()

    return {
        "mensaje": "Categoría actualizada correctamente",
        "categoria_id": categoria_id
    }


# -----------------------------------------
# ELIMINAR CATEGORÍA
# -----------------------------------------

@router.delete("/{categoria_id}")
def eliminar_categoria(categoria_id: int):

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute(
        "SELECT id FROM categorias WHERE id = ?",
        (categoria_id,)
    )

    categoria = cursor.fetchone()

    if categoria is None:

        conexion.close()

        raise HTTPException(
            status_code=404,
            detail="Categoría no encontrada"
        )

    cursor.execute(
        "DELETE FROM categorias WHERE id = ?",
        (categoria_id,)
    )

    conexion.commit()
    conexion.close()

    return {
        "mensaje": "Categoría eliminada correctamente",
        "categoria_id": categoria_id
    }