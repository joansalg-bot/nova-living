from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)


class LoginRequest(BaseModel):
    usuario: str
    contrasena: str


@router.post("/login")
def iniciar_sesion(datos: LoginRequest):

    usuario_correcto = "admin"
    contrasena_correcta = "NovaLiving2026"

    if datos.usuario != usuario_correcto or datos.contrasena != contrasena_correcta:
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña incorrectos"
        )

    return {
        "mensaje": "Inicio de sesión correcto",
        "autenticado": True,
        "usuario": datos.usuario
    }