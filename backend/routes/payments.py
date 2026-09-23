from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import obtener_conexion


router = APIRouter(
    prefix="/pagos",
    tags=["Pagos"]
)


class PagoCrear(BaseModel):
    pedido_id: int
    metodo: str
    monto: float
    referencia: str | None = None
    observaciones: str | None = None


class EstadoPago(BaseModel):
    estado: str
    referencia: str | None = None
    observaciones: str | None = None


@router.get("/")
def obtener_pagos():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            p.id,
            p.pedido_id,
            p.metodo,
            p.estado,
            p.referencia,
            p.monto,
            p.fecha,
            p.observaciones,
            c.nombre || ' ' || c.apellido AS cliente,
            c.email
        FROM pagos p
        INNER JOIN pedidos pe
            ON p.pedido_id = pe.id
        INNER JOIN clientes c
            ON pe.cliente_id = c.id
        ORDER BY p.id DESC
    """)

    pagos = cursor.fetchall()

    conexion.close()

    return {
        "pagos": [dict(pago) for pago in pagos]
    }


@router.get("/{pago_id}")
def obtener_pago(pago_id: int):
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            p.id,
            p.pedido_id,
            p.metodo,
            p.estado,
            p.referencia,
            p.monto,
            p.fecha,
            p.observaciones,
            c.nombre || ' ' || c.apellido AS cliente,
            c.email
        FROM pagos p
        INNER JOIN pedidos pe
            ON p.pedido_id = pe.id
        INNER JOIN clientes c
            ON pe.cliente_id = c.id
        WHERE p.id = ?
    """, (pago_id,))

    pago = cursor.fetchone()

    conexion.close()

    if pago is None:
        raise HTTPException(
            status_code=404,
            detail="Pago no encontrado"
        )

    return dict(pago)


@router.get("/pedido/{pedido_id}")
def obtener_pago_por_pedido(pedido_id: int):
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            id,
            pedido_id,
            metodo,
            estado,
            referencia,
            monto,
            fecha,
            observaciones
        FROM pagos
        WHERE pedido_id = ?
    """, (pedido_id,))

    pago = cursor.fetchone()

    conexion.close()

    if pago is None:
        raise HTTPException(
            status_code=404,
            detail="Este pedido todavía no tiene un pago registrado"
        )

    return dict(pago)


@router.post("/")
def crear_pago(pago: PagoCrear):
    if pago.monto <= 0:
        raise HTTPException(
            status_code=400,
            detail="El monto del pago debe ser mayor que cero"
        )

    metodos_permitidos = [
        "nequi_demo",
        "bancolombia_demo",
        "transferencia_demo"
    ]

    if pago.metodo not in metodos_permitidos:
        raise HTTPException(
            status_code=400,
            detail="Método de pago no válido"
        )

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            id,
            total
        FROM pedidos
        WHERE id = ?
    """, (pago.pedido_id,))

    pedido = cursor.fetchone()

    if pedido is None:
        conexion.close()

        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado"
        )

    cursor.execute("""
        SELECT id
        FROM pagos
        WHERE pedido_id = ?
    """, (pago.pedido_id,))

    pago_existente = cursor.fetchone()

    if pago_existente is not None:
        conexion.close()

        raise HTTPException(
            status_code=400,
            detail="Este pedido ya tiene un pago registrado"
        )

    if round(pago.monto, 2) != round(pedido["total"], 2):
        conexion.close()

        raise HTTPException(
            status_code=400,
            detail="El monto del pago no coincide con el total del pedido"
        )

    cursor.execute("""
        INSERT INTO pagos (
            pedido_id,
            metodo,
            estado,
            referencia,
            monto,
            observaciones
        )
        VALUES (?, ?, 'pendiente', ?, ?, ?)
    """, (
        pago.pedido_id,
        pago.metodo,
        pago.referencia,
        pago.monto,
        pago.observaciones
    ))

    conexion.commit()

    nuevo_id = cursor.lastrowid

    conexion.close()

    return {
        "mensaje": "Pago registrado correctamente",
        "pago_id": nuevo_id,
        "pedido_id": pago.pedido_id,
        "estado": "pendiente"
    }


@router.put("/{pago_id}/estado")
def actualizar_estado_pago(
    pago_id: int,
    actualizacion: EstadoPago
):
    estados_permitidos = [
        "pendiente",
        "pagado",
        "rechazado",
        "reembolsado"
    ]

    if actualizacion.estado not in estados_permitidos:
        raise HTTPException(
            status_code=400,
            detail="Estado de pago no válido"
        )

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            id,
            pedido_id
        FROM pagos
        WHERE id = ?
    """, (pago_id,))

    pago = cursor.fetchone()

    if pago is None:
        conexion.close()

        raise HTTPException(
            status_code=404,
            detail="Pago no encontrado"
        )

    cursor.execute("""
        UPDATE pagos
        SET
            estado = ?,
            referencia = COALESCE(?, referencia),
            observaciones = COALESCE(?, observaciones)
        WHERE id = ?
    """, (
        actualizacion.estado,
        actualizacion.referencia,
        actualizacion.observaciones,
        pago_id
    ))

    conexion.commit()

    conexion.close()

    return {
        "mensaje": "Estado del pago actualizado correctamente",
        "pago_id": pago_id,
        "pedido_id": pago["pedido_id"],
        "estado": actualizacion.estado
    }


@router.delete("/{pago_id}")
def eliminar_pago(pago_id: int):
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT id
        FROM pagos
        WHERE id = ?
    """, (pago_id,))

    pago = cursor.fetchone()

    if pago is None:
        conexion.close()

        raise HTTPException(
            status_code=404,
            detail="Pago no encontrado"
        )

    cursor.execute("""
        DELETE FROM pagos
        WHERE id = ?
    """, (pago_id,))

    conexion.commit()

    conexion.close()

    return {
        "mensaje": "Pago eliminado correctamente",
        "pago_id": pago_id
    }