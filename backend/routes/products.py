from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from database import obtener_conexion
from schemas import Producto

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)


class StockActualizacion(BaseModel):
    stock: int


@router.get("/")
def obtener_productos(
    categoria_id: int | None = Query(
        default=None,
        description="Filtrar productos por categoría"
    ),
    subcategoria_id: int | None = Query(
        default=None,
        description="Filtrar productos por subcategoría"
    )
):
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    consulta = """
        SELECT
            p.id,
            p.nombre,
            p.subcategoria_id,
            s.nombre AS subcategoria,
            s.categoria_id,
            c.nombre AS categoria,
            p.precio,
            p.stock,
            p.descripcion,
            p.imagen
        FROM productos p
        INNER JOIN subcategorias s
            ON p.subcategoria_id = s.id
        INNER JOIN categorias c
            ON s.categoria_id = c.id
    """

    condiciones = []
    parametros = []

    if categoria_id is not None:
        condiciones.append("s.categoria_id = ?")
        parametros.append(categoria_id)

    if subcategoria_id is not None:
        condiciones.append("p.subcategoria_id = ?")
        parametros.append(subcategoria_id)

    if condiciones:
        consulta += " WHERE " + " AND ".join(condiciones)

    consulta += " ORDER BY p.id"

    cursor.execute(consulta, parametros)
    productos = cursor.fetchall()

    conexion.close()

    return {
        "productos": [dict(producto) for producto in productos]
    }


@router.get("/{producto_id}")
def obtener_producto(producto_id: int):
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            p.id,
            p.nombre,
            p.subcategoria_id,
            s.nombre AS subcategoria,
            s.categoria_id,
            c.nombre AS categoria,
            p.precio,
            p.stock,
            p.descripcion,
            p.imagen
        FROM productos p
        INNER JOIN subcategorias s
            ON p.subcategoria_id = s.id
        INNER JOIN categorias c
            ON s.categoria_id = c.id
        WHERE p.id = ?
    """, (producto_id,))

    producto = cursor.fetchone()
    conexion.close()

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    return dict(producto)


@router.post("/")
def crear_producto(producto: Producto):
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute(
        "SELECT id FROM subcategorias WHERE id = ?",
        (producto.subcategoria_id,)
    )

    subcategoria = cursor.fetchone()

    if subcategoria is None:
        conexion.close()
        raise HTTPException(
            status_code=404,
            detail="La subcategoría indicada no existe"
        )

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
        producto.nombre,
        producto.subcategoria_id,
        producto.precio,
        producto.stock,
        producto.descripcion,
        producto.imagen
    ))

    conexion.commit()
    nuevo_id = cursor.lastrowid
    conexion.close()

    return {
        "mensaje": "Producto creado correctamente",
        "producto_id": nuevo_id
    }


@router.put("/{producto_id}")
def modificar_producto(
    producto_id: int,
    producto: Producto
):
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute(
        "SELECT id FROM productos WHERE id = ?",
        (producto_id,)
    )

    producto_existente = cursor.fetchone()

    if producto_existente is None:
        conexion.close()
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    cursor.execute(
        "SELECT id FROM subcategorias WHERE id = ?",
        (producto.subcategoria_id,)
    )

    subcategoria = cursor.fetchone()

    if subcategoria is None:
        conexion.close()
        raise HTTPException(
            status_code=404,
            detail="La subcategoría indicada no existe"
        )

    cursor.execute("""
        UPDATE productos
        SET
            nombre = ?,
            subcategoria_id = ?,
            precio = ?,
            stock = ?,
            descripcion = ?,
            imagen = ?
        WHERE id = ?
    """, (
        producto.nombre,
        producto.subcategoria_id,
        producto.precio,
        producto.stock,
        producto.descripcion,
        producto.imagen,
        producto_id
    ))

    conexion.commit()
    conexion.close()

    return {
        "mensaje": "Producto actualizado correctamente",
        "producto_id": producto_id
    }


@router.put("/{producto_id}/stock")
def actualizar_stock(
    producto_id: int,
    actualizacion: StockActualizacion
):
    if actualizacion.stock < 0:
        raise HTTPException(
            status_code=400,
            detail="El stock no puede ser negativo"
        )

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute(
        "SELECT id FROM productos WHERE id = ?",
        (producto_id,)
    )

    producto = cursor.fetchone()

    if producto is None:
        conexion.close()
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    cursor.execute("""
        UPDATE productos
        SET stock = ?
        WHERE id = ?
    """, (
        actualizacion.stock,
        producto_id
    ))

    conexion.commit()
    conexion.close()

    return {
        "mensaje": "Stock actualizado correctamente",
        "producto_id": producto_id,
        "stock": actualizacion.stock
    }


@router.delete("/{producto_id}")
def eliminar_producto(producto_id: int):
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute(
        "SELECT id FROM productos WHERE id = ?",
        (producto_id,)
    )

    producto = cursor.fetchone()

    if producto is None:
        conexion.close()
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    cursor.execute(
        "DELETE FROM productos WHERE id = ?",
        (producto_id,)
    )

    conexion.commit()
    conexion.close()

    return {
        "mensaje": "Producto eliminado correctamente",
        "producto_id": producto_id
    }
