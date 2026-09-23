from pydantic import BaseModel


class Producto(BaseModel):
    nombre: str
    subcategoria_id: int
    precio: float
    stock: int
    descripcion: str | None = None
    imagen: str | None = None