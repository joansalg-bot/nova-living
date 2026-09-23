from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import obtener_conexion


router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)


# ============================================================
# MODELOS
# ============================================================

class ProductoPedido(BaseModel):
    producto_id: int
    cantidad: int


class Pedido(BaseModel):
    cliente_id: int
    productos: list[ProductoPedido]
    direccion_entrega: str | None = None
    ciudad_entrega: str | None = None
    observaciones: str | None = None


class EstadoPedido(BaseModel):
    estado: str


# ============================================================
# OBTENER TODOS LOS PEDIDOS
# ============================================================

@router.get("/")
def obtener_pedidos():

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            p.id,
            p.cliente_id,
            c.nombre AS cliente_nombre,
            c.apellido AS cliente_apellido,
            c.email AS cliente_email,
            c.telefono AS cliente_telefono,
            p.fecha,
            p.estado,
            p.total,
            p.direccion_entrega,
            p.ciudad_entrega,
            p.observaciones
        FROM pedidos p
        INNER JOIN clientes c
            ON p.cliente_id = c.id
        ORDER BY p.id DESC
    """)

    pedidos = cursor.fetchall()

    resultado = []

    for pedido in pedidos:

        pedido_dict = dict(pedido)

        cursor.execute("""
            SELECT
                d.id,
                d.producto_id,
                pr.nombre AS producto_nombre,
                pr.imagen AS producto_imagen,
                d.cantidad,
                d.precio_unitario,
                d.subtotal
            FROM detalle_pedido d
            INNER JOIN productos pr
                ON d.producto_id = pr.id
            WHERE d.pedido_id = ?
            ORDER BY d.id
        """, (pedido["id"],))

        detalles = cursor.fetchall()

        pedido_dict["productos"] = [
            dict(detalle)
            for detalle in detalles
        ]

        resultado.append(pedido_dict)

    conexion.close()

    return {
        "pedidos": resultado
    }


# ============================================================
# OBTENER UN PEDIDO
# ============================================================

@router.get("/{pedido_id}")
def obtener_pedido(pedido_id: int):

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            p.id,
            p.cliente_id,
            c.nombre AS cliente_nombre,
            c.apellido AS cliente_apellido,
            c.email AS cliente_email,
            c.telefono AS cliente_telefono,
            p.fecha,
            p.estado,
            p.total,
            p.direccion_entrega,
            p.ciudad_entrega,
            p.observaciones
        FROM pedidos p
        INNER JOIN clientes c
            ON p.cliente_id = c.id
        WHERE p.id = ?
    """, (pedido_id,))

    pedido = cursor.fetchone()

    if pedido is None:
        conexion.close()

        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado"
        )

    cursor.execute("""
        SELECT
            d.id,
            d.producto_id,
            pr.nombre AS producto_nombre,
            pr.imagen AS producto_imagen,
            d.cantidad,
            d.precio_unitario,
            d.subtotal
        FROM detalle_pedido d
        INNER JOIN productos pr
            ON d.producto_id = pr.id
        WHERE d.pedido_id = ?
        ORDER BY d.id
    """, (pedido_id,))

    detalles = cursor.fetchall()

    resultado = dict(pedido)

    resultado["productos"] = [
        dict(detalle)
        for detalle in detalles
    ]

    conexion.close()

    return resultado


# ============================================================
# CREAR PEDIDO
# ============================================================

@router.post("/")
def crear_pedido(pedido: Pedido):

    if not pedido.productos:
        raise HTTPException(
            status_code=400,
            detail="El pedido debe contener al menos un producto"
        )

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    # --------------------------------------------------------
    # Verificar cliente
    # --------------------------------------------------------

    cursor.execute("""
        SELECT
            id,
            nombre,
            apellido
        FROM clientes
        WHERE id = ?
    """, (pedido.cliente_id,))

    cliente = cursor.fetchone()

    if cliente is None:
        conexion.close()

        raise HTTPException(
            status_code=404,
            detail="El cliente indicado no existe"
        )

    total = 0

    productos_validos = []

    # --------------------------------------------------------
    # Verificar productos y calcular total
    # --------------------------------------------------------

    for item in pedido.productos:

        if item.cantidad <= 0:
            conexion.close()

            raise HTTPException(
                status_code=400,
                detail="La cantidad de cada producto debe ser mayor que cero"
            )

        cursor.execute("""
            SELECT
                id,
                nombre,
                precio,
                stock
            FROM productos
            WHERE id = ?
        """, (item.producto_id,))

        producto = cursor.fetchone()

        if producto is None:
            conexion.close()

            raise HTTPException(
                status_code=404,
                detail=f"El producto con ID {item.producto_id} no existe"
            )

        if producto["stock"] < item.cantidad:
            conexion.close()

            raise HTTPException(
                status_code=400,
                detail=(
                    f"No hay suficiente stock para '{producto['nombre']}'. "
                    f"Stock disponible: {producto['stock']}"
                )
            )

        subtotal = producto["precio"] * item.cantidad

        total += subtotal

        productos_validos.append({
            "id": producto["id"],
            "nombre": producto["nombre"],
            "precio": producto["precio"],
            "cantidad": item.cantidad,
            "subtotal": subtotal
        })

    # --------------------------------------------------------
    # Crear pedido
    # --------------------------------------------------------

    cursor.execute("""
        INSERT INTO pedidos (
            cliente_id,
            estado,
            total,
            direccion_entrega,
            ciudad_entrega,
            observaciones
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        pedido.cliente_id,
        "pendiente",
        total,
        pedido.direccion_entrega,
        pedido.ciudad_entrega,
        pedido.observaciones
    ))

    pedido_id = cursor.lastrowid

    # --------------------------------------------------------
    # Crear detalles y actualizar inventario
    # --------------------------------------------------------

    for producto in productos_validos:

        cursor.execute("""
            INSERT INTO detalle_pedido (
                pedido_id,
                producto_id,
                cantidad,
                precio_unitario,
                subtotal
            )
            VALUES (?, ?, ?, ?, ?)
        """, (
            pedido_id,
            producto["id"],
            producto["cantidad"],
            producto["precio"],
            producto["subtotal"]
        ))

        cursor.execute("""
            UPDATE productos
            SET stock = stock - ?
            WHERE id = ?
        """, (
            producto["cantidad"],
            producto["id"]
        ))

    conexion.commit()
    conexion.close()

    return {
        "mensaje": "Pedido creado correctamente",
        "pedido_id": pedido_id,
        "cliente_id": pedido.cliente_id,
        "total": total,
        "estado": "pendiente"
    }


# ============================================================
# ACTUALIZAR ESTADO DEL PEDIDO
# ============================================================

@router.put("/{pedido_id}/estado")
def actualizar_estado(
    pedido_id: int,
    estado_pedido: EstadoPedido
):

    estados_validos = [
        "pendiente",
        "confirmado",
        "preparando",
        "enviado",
        "entregado",
        "cancelado"
    ]

    if estado_pedido.estado not in estados_validos:
        raise HTTPException(
            status_code=400,
            detail=(
                "Estado no válido. Estados permitidos: "
                + ", ".join(estados_validos)
            )
        )

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT id, estado
        FROM pedidos
        WHERE id = ?
    """, (pedido_id,))

    pedido = cursor.fetchone()

    if pedido is None:
        conexion.close()

        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado"
        )

    cursor.execute("""
        UPDATE pedidos
        SET estado = ?
        WHERE id = ?
    """, (
        estado_pedido.estado,
        pedido_id
    ))

    conexion.commit()
    conexion.close()

    return {
        "mensaje": "Estado del pedido actualizado correctamente",
        "pedido_id": pedido_id,
        "estado": estado_pedido.estado
    }


# ============================================================
# ELIMINAR PEDIDO
# ============================================================

@router.delete("/{pedido_id}")
def eliminar_pedido(pedido_id: int):

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT id
        FROM pedidos
        WHERE id = ?
    """, (pedido_id,))

    pedido = cursor.fetchone()

    if pedido is None:
        conexion.close()

        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado"
        )

    cursor.execute("""
        DELETE FROM pedidos
        WHERE id = ?
    """, (pedido_id,))

    conexion.commit()
    conexion.close()

    return {
        "mensaje": "Pedido eliminado correctamente",
        "pedido_id": pedido_id
    }