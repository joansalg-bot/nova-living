from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from database import obtener_conexion


router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"]
)


class Cliente(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    telefono: str | None = None
    direccion: str | None = None
    ciudad: str | None = None


@router.get("/")
def obtener_clientes():

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            id,
            nombre,
            apellido,
            email,
            telefono,
            direccion,
            ciudad,
            fecha_registro
        FROM clientes
        ORDER BY id DESC
    """)

    clientes = cursor.fetchall()

    conexion.close()

    return {
        "clientes": [
            dict(cliente)
            for cliente in clientes
        ]
    }


@router.get("/{cliente_id}")
def obtener_cliente(cliente_id: int):

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            id,
            nombre,
            apellido,
            email,
            telefono,
            direccion,
            ciudad,
            fecha_registro
        FROM clientes
        WHERE id = ?
    """, (cliente_id,))

    cliente = cursor.fetchone()

    conexion.close()

    if cliente is None:
        raise HTTPException(
            status_code=404,
            detail="Cliente no encontrado"
        )

    return dict(cliente)


@router.post("/")
def crear_cliente(cliente: Cliente):

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute(
        "SELECT id FROM clientes WHERE email = ?",
        (cliente.email,)
    )

    cliente_existente = cursor.fetchone()

    if cliente_existente is not None:
        conexion.close()

        raise HTTPException(
            status_code=400,
            detail="Ya existe un cliente registrado con este correo electrónico"
        )

    cursor.execute("""
        INSERT INTO clientes (
            nombre,
            apellido,
            email,
            telefono,
            direccion,
            ciudad
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        cliente.nombre,
        cliente.apellido,
        cliente.email,
        cliente.telefono,
        cliente.direccion,
        cliente.ciudad
    ))

    conexion.commit()

    nuevo_id = cursor.lastrowid

    conexion.close()

    return {
        "mensaje": "Cliente creado correctamente",
        "cliente_id": nuevo_id
    }


@router.put("/{cliente_id}")
def modificar_cliente(
    cliente_id: int,
    cliente: Cliente
):

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute(
        "SELECT id FROM clientes WHERE id = ?",
        (cliente_id,)
    )

    cliente_existente = cursor.fetchone()

    if cliente_existente is None:
        conexion.close()

        raise HTTPException(
            status_code=404,
            detail="Cliente no encontrado"
        )

    cursor.execute(
        """
        SELECT id
        FROM clientes
        WHERE email = ?
        AND id != ?
        """,
        (
            cliente.email,
            cliente_id
        )
    )

    email_existente = cursor.fetchone()

    if email_existente is not None:
        conexion.close()

        raise HTTPException(
            status_code=400,
            detail="El correo electrónico ya pertenece a otro cliente"
        )

    cursor.execute("""
        UPDATE clientes
        SET
            nombre = ?,
            apellido = ?,
            email = ?,
            telefono = ?,
            direccion = ?,
            ciudad = ?
        WHERE id = ?
    """, (
        cliente.nombre,
        cliente.apellido,
        cliente.email,
        cliente.telefono,
        cliente.direccion,
        cliente.ciudad,
        cliente_id
    ))

    conexion.commit()

    conexion.close()

    return {
        "mensaje": "Cliente actualizado correctamente",
        "cliente_id": cliente_id
    }


@router.delete("/{cliente_id}")
def eliminar_cliente(cliente_id: int):

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute(
        "SELECT id FROM clientes WHERE id = ?",
        (cliente_id,)
    )

    cliente = cursor.fetchone()

    if cliente is None:
        conexion.close()

        raise HTTPException(
            status_code=404,
            detail="Cliente no encontrado"
        )

    cursor.execute(
        "DELETE FROM clientes WHERE id = ?",
        (cliente_id,)
    )

    conexion.commit()

    conexion.close()

    return {
        "mensaje": "Cliente eliminado correctamente",
        "cliente_id": cliente_id
    }