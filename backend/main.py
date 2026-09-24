from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import (
    crear_tabla_productos,
    crear_tabla_categorias,
    crear_tabla_subcategorias,
    crear_tabla_clientes,
    crear_tabla_pedidos,
    crear_tabla_detalle_pedido,
    crear_tabla_configuracion,
    crear_tabla_pagos
)

from routes.products import router as products_router
from routes.categories import router as categories_router
from routes.subcategories import router as subcategories_router
from routes.customers import router as customers_router
from routes.orders import router as orders_router
from routes.configuration import router as configuration_router
from routes.payments import router as payments_router
from routes.auth import router as auth_router


app = FastAPI(
    title="Nova Living API",
    description="API para la tienda de muebles y decoración Nova Living",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:8000",
        "http://localhost:8000",

        # GitHub Pages
        "https://joansalg-bot.github.io"
    ],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# CREACIÓN DE TABLAS
# ============================================================

crear_tabla_categorias()
crear_tabla_subcategorias()
crear_tabla_productos()
crear_tabla_clientes()
crear_tabla_pedidos()
crear_tabla_detalle_pedido()
crear_tabla_configuracion()
crear_tabla_pagos()


# ============================================================
# RUTAS
# ============================================================

app.include_router(products_router)
app.include_router(categories_router)
app.include_router(subcategories_router)
app.include_router(customers_router)
app.include_router(orders_router)
app.include_router(configuration_router)
app.include_router(payments_router)
app.include_router(auth_router)


# ============================================================
# RUTA PRINCIPAL
# ============================================================

@app.get("/")
def inicio():

    return {
        "mensaje": "Bienvenido a Nova Living",
        "estado": "API funcionando correctamente"
    }