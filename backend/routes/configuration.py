from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import obtener_conexion


router = APIRouter(
    prefix="/configuracion",
    tags=["Configuración"]
)


class Configuracion(BaseModel):
    nombre_tienda: str
    correo: str | None = None
    telefono: str | None = None
    whatsapp: str | None = None
    direccion: str | None = None
    ciudad: str | None = None
    horario: str | None = None
    informacion_entregas: str | None = None
    mensaje_tienda: str | None = None


@router.get("/")
def obtener_configuracion():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            id,
            nombre_tienda,
            correo,
            telefono,
            whatsapp,
            direccion,
            ciudad,
            horario,
            informacion_entregas,
            mensaje_tienda
        FROM configuracion
        ORDER BY id
        LIMIT 1
    """)

    configuracion = cursor.fetchone()

    conexion.close()

    if configuracion is None:
        raise HTTPException(
            status_code=404,
            detail="No existe una configuración registrada"
        )

    return dict(configuracion)


@router.put("/")
def actualizar_configuracion(
    configuracion: Configuracion
):
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT id
        FROM configuracion
        ORDER BY id
        LIMIT 1
    """)

    configuracion_existente = cursor.fetchone()

    if configuracion_existente is None:

        cursor.execute("""
            INSERT INTO configuracion (
                nombre_tienda,
                correo,
                telefono,
                whatsapp,
                direccion,
                ciudad,
                horario,
                informacion_entregas,
                mensaje_tienda
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            configuracion.nombre_tienda,
            configuracion.correo,
            configuracion.telefono,
            configuracion.whatsapp,
            configuracion.direccion,
            configuracion.ciudad,
            configuracion.horario,
            configuracion.informacion_entregas,
            configuracion.mensaje_tienda
        ))

        configuracion_id = cursor.lastrowid

    else:

        configuracion_id = configuracion_existente["id"]

        cursor.execute("""
            UPDATE configuracion
            SET
                nombre_tienda = ?,
                correo = ?,
                telefono = ?,
                whatsapp = ?,
                direccion = ?,
                ciudad = ?,
                horario = ?,
                informacion_entregas = ?,
                mensaje_tienda = ?
            WHERE id = ?
        """, (
            configuracion.nombre_tienda,
            configuracion.correo,
            configuracion.telefono,
            configuracion.whatsapp,
            configuracion.direccion,
            configuracion.ciudad,
            configuracion.horario,
            configuracion.informacion_entregas,
            configuracion.mensaje_tienda,
            configuracion_id
        ))

    conexion.commit()
    conexion.close()

    return {
        "mensaje": "Configuración actualizada correctamente",
        "configuracion_id": configuracion_id
    }