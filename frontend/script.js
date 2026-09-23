// ============================================================
// NOVA LIVING
// SCRIPT PRINCIPAL
// ============================================================


// ============================================================
// CONFIGURACIÓN DE LA API
// ============================================================

const API_BASE_URL = "https://nova-living-rein.onrender.com";

// ============================================================
// VARIABLES GLOBALES
// ============================================================

let todosLosProductos = [];

let productosMostrados = [];

let todasLasCategorias = [];

let todasLasSubcategorias = [];

let carrito = [];


// ============================================================
// ELEMENTOS DEL DOM
// ============================================================

const categoriesGrid =
    document.getElementById("categoriesGrid");

const productsGrid =
    document.getElementById("productsGrid");

const emptyProducts =
    document.getElementById("emptyProducts");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const subcategoryFilter =
    document.getElementById("subcategoryFilter");

const cartButton =
    document.getElementById("cartButton");


// ============================================================
// INICIO DE LA APLICACIÓN
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarAplicacion
);


async function iniciarAplicacion() {

    console.log(
        "Nova Living iniciando..."
    );


    try {

        await cargarCategorias();

        await cargarProductos();

        configurarEventos();

        actualizarCarrito();

        console.log(
            "Nova Living cargado correctamente."
        );

    } catch (error) {

        console.error(
            "Error al iniciar Nova Living:",
            error
        );

    }

}


// ============================================================
// CARGAR CATEGORÍAS
// ============================================================

async function cargarCategorias() {

    try {

        const respuesta = await fetch(
            `${API_BASE_URL}/categorias/`
        );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener las categorías."
            );

        }


        const datos =
            await respuesta.json();


        todasLasCategorias =
            datos.categorias || [];


        mostrarCategorias();

        cargarCategoriasEnFiltro();


    } catch (error) {

        console.error(
            "Error cargando categorías:",
            error
        );

    }

}


// ============================================================
// MOSTRAR CATEGORÍAS
// ============================================================

function mostrarCategorias() {

    if (!categoriesGrid) {

        return;

    }


    categoriesGrid.innerHTML = "";


    if (
        todasLasCategorias.length === 0
    ) {

        categoriesGrid.innerHTML = `

            <p class="empty-message">

                No hay categorías disponibles.

            </p>

        `;

        return;

    }


    todasLasCategorias.forEach(
        categoria => {

            const tarjeta =
                document.createElement(
                    "article"
                );


            tarjeta.className =
                "category-card";


            tarjeta.dataset.categoryId =
                categoria.id;


            const imagenCategoria =
                obtenerImagenCategoria(
                    categoria
                );


            tarjeta.innerHTML = `

                <div class="category-image">

                    <img
                        src="${imagenCategoria}"
                        alt="${escapeHTML(
                            categoria.nombre
                        )}"
                        loading="lazy"
                    >

                </div>


                <div class="category-content">

                    <h3>

                        ${escapeHTML(
                            categoria.nombre
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            categoria.descripcion ||
                            "Descubre nuestra selección."
                        )}

                    </p>


                    <button
                        type="button"
                        class="category-button"
                        data-category-id="${categoria.id}"
                    >

                        Ver productos

                    </button>

                </div>

            `;


            categoriesGrid.appendChild(
                tarjeta
            );


            // ------------------------------------------------
            // FALLBACK DE IMAGEN
            // ------------------------------------------------

            const imagen =
                tarjeta.querySelector(
                    ".category-image img"
                );


            if (imagen) {

                imagen.addEventListener(
                    "error",
                    () => {

                        imagen.src =
                            generarPlaceholder(
                                categoria.nombre
                            );

                        imagen.onerror =
                            null;

                    }
                );

            }

        }
    );


    // ========================================================
    // BOTONES DE CATEGORÍA
    // ========================================================

    const botonesCategoria =
        categoriesGrid.querySelectorAll(
            ".category-button"
        );


    botonesCategoria.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    const categoriaId =
                        Number(
                            boton.dataset.categoryId
                        );


                    seleccionarCategoria(
                        categoriaId
                    );

                }
            );

        }
    );

}


// ============================================================
// RUTA DE IMÁGENES
// ============================================================

function obtenerRutaImagen(nombreImagen) {

    if (!nombreImagen || String(nombreImagen).trim() === "") {
        return generarPlaceholder("Nova Living");
    }

    const imagen = String(nombreImagen).trim();

    if (
        imagen.startsWith("http://") ||
        imagen.startsWith("https://") ||
        imagen.startsWith("data:")
    ) {
        return imagen;
    }

    if (imagen.startsWith("images/")) {
        return imagen;
    }

    return `images/${imagen}`;
}


// ============================================================
// OBTENER IMAGEN DE CATEGORÍA
// ============================================================

function obtenerImagenCategoria(
    categoria
) {

    if (
        categoria.imagen &&
        categoria.imagen.trim() !== ""
    ) {

        return obtenerRutaImagen(categoria.imagen);

    }


    return generarPlaceholder(
        categoria.nombre
    );

}


// ============================================================
// GENERAR PLACEHOLDER
// ============================================================

function generarPlaceholder(
    texto
) {

    const textoSeguro =
        String(
            texto || "Nova Living"
        )
        .substring(0, 24);


    const svg = `

        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="800"
            height="600"
            viewBox="0 0 800 600"
        >

            <rect
                width="800"
                height="600"
                fill="#e8e1d7"
            />

            <circle
                cx="680"
                cy="100"
                r="150"
                fill="#d9cebd"
                opacity="0.7"
            />

            <text
                x="400"
                y="285"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="#555555"
                font-family="Arial, sans-serif"
                font-size="38"
            >
                ${textoSeguro}
            </text>


            <text
                x="400"
                y="340"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="#777777"
                font-family="Arial, sans-serif"
                font-size="18"
                letter-spacing="3"
            >
                NOVA LIVING
            </text>

        </svg>

    `;


    return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(svg)
    );

}


// ============================================================
// CARGAR CATEGORÍAS EN EL FILTRO
// ============================================================

function cargarCategoriasEnFiltro() {

    if (!categoryFilter) {

        return;

    }


    categoryFilter.innerHTML = `

        <option value="">

            Todas las categorías

        </option>

    `;


    todasLasCategorias.forEach(
        categoria => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                categoria.id;


            option.textContent =
                categoria.nombre;


            categoryFilter.appendChild(
                option
            );

        }
    );

}


// ============================================================
// CARGAR SUBCATEGORÍAS
// ============================================================

async function cargarSubcategorias(
    categoriaId
) {

    if (!subcategoryFilter) {

        return;

    }


    subcategoryFilter.innerHTML = `

        <option value="">

            Todas las subcategorías

        </option>

    `;


    subcategoryFilter.disabled =
        true;


    if (!categoriaId) {

        todasLasSubcategorias = [];

        return;

    }


    try {

        const respuesta =
            await fetch(

                `${API_BASE_URL}/categorias/` +
                `${categoriaId}/subcategorias`

            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener las subcategorías."
            );

        }


        const datos =
            await respuesta.json();


        todasLasSubcategorias =
            datos.subcategorias || [];


        todasLasSubcategorias.forEach(
            subcategoria => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    subcategoria.id;


                option.textContent =
                    subcategoria.nombre;


                subcategoryFilter.appendChild(
                    option
                );

            }
        );


        subcategoryFilter.disabled =
            todasLasSubcategorias.length === 0;


    } catch (error) {

        console.error(
            "Error cargando subcategorías:",
            error
        );


        todasLasSubcategorias = [];

    }

}


// ============================================================
// CARGAR PRODUCTOS
// ============================================================

async function cargarProductos(
    categoriaId = null,
    subcategoriaId = null
) {

    try {

        let url =
            `${API_BASE_URL}/productos/`;


        const parametros = [];


        if (categoriaId) {

            parametros.push(
                `categoria_id=${categoriaId}`
            );

        }


        if (subcategoriaId) {

            parametros.push(
                `subcategoria_id=${subcategoriaId}`
            );

        }


        if (
            parametros.length > 0
        ) {

            url +=
                "?" +
                parametros.join("&");

        }


        const respuesta =
            await fetch(url);


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener los productos."
            );

        }


        const datos =
            await respuesta.json();


        if (
            !categoriaId &&
            !subcategoriaId
        ) {

            todosLosProductos =
                datos.productos || [];

        }


        productosMostrados =
            datos.productos || [];


        mostrarProductos(
            productosMostrados
        );


    } catch (error) {

        console.error(
            "Error cargando productos:",
            error
        );


        if (productsGrid) {

            productsGrid.innerHTML = `

                <div class="empty-message">

                    <h3>

                        No fue posible cargar
                        los productos.

                    </h3>


                    <p>

                        Comprueba que la API de
                        Nova Living esté funcionando.

                    </p>

                </div>

            `;

        }

    }

}


// ============================================================
// MOSTRAR PRODUCTOS
// ============================================================

function mostrarProductos(
    productos
) {

    if (!productsGrid) {

        return;

    }


    productsGrid.innerHTML = "";


    if (
        !productos ||
        productos.length === 0
    ) {

        mostrarMensajeProductosVacios();

        return;

    }


    if (emptyProducts) {

        emptyProducts.style.display =
            "none";

    }


    productos.forEach(
        producto => {

            const tarjeta =
                crearTarjetaProducto(
                    producto
                );


            productsGrid.appendChild(
                tarjeta
            );

        }
    );

}


// ============================================================
// CREAR TARJETA DE PRODUCTO
// ============================================================

function crearTarjetaProducto(
    producto
) {

    const tarjeta =
        document.createElement(
            "article"
        );


    tarjeta.className =
        "product-card";


    tarjeta.dataset.productId =
        producto.id;


    const imagen =
        obtenerImagenProducto(
            producto
        );


    const stock =
        Number(
            producto.stock || 0
        );


    const disponible =
        stock > 0;


    const precio =
        formatearPrecio(
            producto.precio
        );


    tarjeta.innerHTML = `

        <div class="product-image">

            <img
                src="${imagen}"
                alt="${escapeHTML(
                    producto.nombre
                )}"
                loading="lazy"
            >

        </div>


        <div class="product-content">

            <span class="product-category">

                ${escapeHTML(
                    producto.categoria || ""
                )}

            </span>


            <h3 class="product-name">

                ${escapeHTML(
                    producto.nombre
                )}

            </h3>


            <p class="product-subcategory">

                ${escapeHTML(
                    producto.subcategoria || ""
                )}

            </p>


            <p class="product-description">

                ${escapeHTML(
                    producto.descripcion ||
                    "Producto Nova Living."
                )}

            </p>


            <div class="product-bottom">

                <strong class="product-price">

                    ${precio}

                </strong>


                <span class="product-stock">

                    ${
                        disponible
                        ? `Disponible: ${stock}`
                        : "Agotado"
                    }

                </span>

            </div>


            <button
                type="button"
                class="add-to-cart"
                data-product-id="${producto.id}"
                ${disponible ? "" : "disabled"}
            >

                ${
                    disponible
                    ? "Añadir al carrito"
                    : "Agotado"
                }

            </button>

        </div>

    `;


    // ========================================================
    // FALLBACK DE IMAGEN DEL PRODUCTO
    // ========================================================

    const imagenElemento =
        tarjeta.querySelector(
            ".product-image img"
        );


    if (imagenElemento) {

        imagenElemento.addEventListener(
            "error",
            () => {

                imagenElemento.src =
                    generarPlaceholder(
                        producto.nombre
                    );

                imagenElemento.onerror =
                    null;

            }
        );

    }


    // ========================================================
    // BOTÓN AÑADIR AL CARRITO
    // ========================================================

    const botonCarrito =
        tarjeta.querySelector(
            ".add-to-cart"
        );


    if (botonCarrito) {

        botonCarrito.addEventListener(
            "click",
            () => {

                agregarAlCarrito(
                    producto
                );

            }
        );

    }


    return tarjeta;

}


// ============================================================
// OBTENER IMAGEN DEL PRODUCTO
// ============================================================

function obtenerImagenProducto(
    producto
) {

    if (
        producto.imagen &&
        producto.imagen.trim() !== ""
    ) {

        return obtenerRutaImagen(producto.imagen);

    }


    return generarPlaceholder(
        producto.nombre
    );

}


// ============================================================
// MENSAJE SIN PRODUCTOS
// ============================================================

function mostrarMensajeProductosVacios() {

    if (emptyProducts) {

        emptyProducts.style.display =
            "block";

    }


    if (productsGrid) {

        productsGrid.innerHTML = `

            <div class="empty-message">

                <h3>

                    No encontramos productos

                </h3>


                <p>

                    Prueba cambiando los filtros
                    o realizando otra búsqueda.

                </p>

            </div>

        `;

    }

}


// ============================================================
// CONFIGURAR EVENTOS
// ============================================================

function configurarEventos() {


    // ========================================================
    // FILTRO DE CATEGORÍA
    // ========================================================

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            async () => {

                const categoriaId =
                    categoryFilter.value;


                if (subcategoryFilter) {

                    subcategoryFilter.value =
                        "";

                }


                await cargarSubcategorias(
                    categoriaId
                );


                await cargarProductos(
                    categoriaId || null,
                    null
                );


                aplicarBusqueda();

            }
        );

    }


    // ========================================================
    // FILTRO DE SUBCATEGORÍA
    // ========================================================

    if (subcategoryFilter) {

        subcategoryFilter.addEventListener(
            "change",
            async () => {

                const categoriaId =
                    categoryFilter
                    ? categoryFilter.value
                    : "";


                const subcategoriaId =
                    subcategoryFilter.value;


                await cargarProductos(
                    categoriaId || null,
                    subcategoriaId || null
                );


                aplicarBusqueda();

            }
        );

    }


    // ========================================================
    // BUSCADOR
    // ========================================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                aplicarBusqueda();

            }
        );

    }


    // ========================================================
    // CARRITO
    // ========================================================

    if (cartButton) {

        cartButton.addEventListener(
            "click",
            mostrarCarrito
        );

    }


    // ========================================================
    // NAVEGACIÓN
    // ========================================================

    configurarNavegacion();

}


// ============================================================
// SELECCIONAR CATEGORÍA
// ============================================================

async function seleccionarCategoria(
    categoriaId
) {

    if (!categoryFilter) {

        return;

    }


    categoryFilter.value =
        String(categoriaId);


    if (subcategoryFilter) {

        subcategoryFilter.value =
            "";

    }


    await cargarSubcategorias(
        categoriaId
    );


    await cargarProductos(
        categoriaId,
        null
    );


    if (searchInput) {

        searchInput.value =
            "";

    }


    const catalogo =
        document.getElementById(
            "productos"
        );


    if (catalogo) {

        catalogo.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }

}


// ============================================================
// BUSCADOR
// ============================================================

function aplicarBusqueda() {

    if (!searchInput) {

        return;

    }


    const texto =
        searchInput.value
            .trim()
            .toLowerCase();


    if (texto === "") {

        mostrarProductos(
            productosMostrados
        );

        return;

    }


    const resultados =
        productosMostrados.filter(
            producto => {

                const contenido =

                    `${producto.nombre || ""} ` +
                    `${producto.categoria || ""} ` +
                    `${producto.subcategoria || ""} ` +
                    `${producto.descripcion || ""}`;


                return contenido
                    .toLowerCase()
                    .includes(texto);

            }
        );


    mostrarProductos(
        resultados
    );

}


// ============================================================
// AGREGAR AL CARRITO
// ============================================================

function agregarAlCarrito(
    producto
) {

    const stock =
        Number(
            producto.stock || 0
        );


    if (stock <= 0) {

        alert(
            "Este producto está agotado."
        );

        return;

    }


    const productoExistente =
        carrito.find(
            item =>
                item.producto.id ===
                producto.id
        );


    if (productoExistente) {

        if (
            productoExistente.cantidad <
            stock
        ) {

            productoExistente.cantidad++;

        } else {

            alert(
                "Has alcanzado el stock disponible de este producto."
            );

            return;

        }

    } else {

        carrito.push({

            producto: producto,

            cantidad: 1

        });

    }


    actualizarCarrito();


    mostrarConfirmacionCarrito(
        producto
    );

}


// ============================================================
// ACTUALIZAR CARRITO
// ============================================================

function actualizarCarrito() {

    if (!cartButton) {

        return;

    }


    const cantidadTotal =
        carrito.reduce(
            (
                total,
                item
            ) => {

                return total +
                    item.cantidad;

            },
            0
        );


    // --------------------------------------------------------
    // IMPORTANTE:
    // No usamos el texto anterior del botón.
    // Lo reconstruimos completamente.
    // --------------------------------------------------------

    cartButton.innerHTML = `

        <span class="cart-icon">
            🛒
        </span>

        <span class="cart-text">
            Carrito
        </span>

        <span class="cart-count">
            ${cantidadTotal}
        </span>

    `;

}


// ============================================================
// NOTIFICACIÓN DE PRODUCTO AGREGADO
// ============================================================

function mostrarConfirmacionCarrito(
    producto
) {

    const mensaje =
        document.createElement(
            "div"
        );


    mensaje.className =
        "cart-notification";


    mensaje.textContent =
        `${producto.nombre} añadido al carrito.`;


    document.body.appendChild(
        mensaje
    );


    setTimeout(
        () => {

            mensaje.classList.add(
                "show"
            );

        },
        10
    );


    setTimeout(
        () => {

            mensaje.classList.remove(
                "show"
            );


            setTimeout(
                () => {

                    mensaje.remove();

                },
                300
            );

        },
        2200
    );

}


// ============================================================
// MOSTRAR CARRITO
// ============================================================

function mostrarCarrito() {

    const existente =
        document.getElementById(
            "cartModal"
        );


    if (existente) {

        existente.remove();

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "cartModal";


    modal.className =
        "cart-modal";


    modal.innerHTML = `

        <div
            class="cart-overlay"
            data-close-cart
        ></div>


        <div
            class="cart-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cartTitle"
        >

            <div class="cart-header">

                <div>

                    <span class="cart-label">

                        NOVA LIVING

                    </span>


                    <h2 id="cartTitle">

                        Tu carrito

                    </h2>

                </div>


                <button
                    type="button"
                    class="cart-close"
                    aria-label="Cerrar carrito"
                    data-close-cart
                >

                    ×

                </button>

            </div>


            <div class="cart-body">

                ${generarContenidoCarrito()}

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const botonesCerrar =
        modal.querySelectorAll(
            "[data-close-cart]"
        );


    botonesCerrar.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    modal.remove();

                }
            );

        }
    );


    configurarEventosCarrito(
        modal
    );

}


// ============================================================
// CONTENIDO DEL CARRITO
// ============================================================

function generarContenidoCarrito() {

    if (
        carrito.length === 0
    ) {

        return `

            <div class="cart-empty">

                <div class="cart-empty-icon">

                    🛋️

                </div>


                <h3>

                    Tu carrito está vacío

                </h3>


                <p>

                    Explora nuestra colección
                    y encuentra algo para tu hogar.

                </p>

            </div>

        `;

    }


    let total =
        0;


    const productosHTML =
        carrito.map(
            item => {

                const producto =
                    item.producto;


                const subtotal =
                    Number(
                        producto.precio
                    ) *
                    item.cantidad;


                total +=
                    subtotal;


                return `

                    <div
                        class="cart-item"
                        data-cart-product="${producto.id}"
                    >

                        <div class="cart-item-info">

                            <h3>

                                ${escapeHTML(
                                    producto.nombre
                                )}

                            </h3>


                            <p>

                                ${formatearPrecio(
                                    producto.precio
                                )}

                            </p>

                        </div>


                        <div class="cart-item-controls">

                            <button
                                type="button"
                                class="cart-quantity-button"
                                data-cart-action="decrease"
                                data-product-id="${producto.id}"
                            >

                                −

                            </button>


                            <span>

                                ${item.cantidad}

                            </span>


                            <button
                                type="button"
                                class="cart-quantity-button"
                                data-cart-action="increase"
                                data-product-id="${producto.id}"
                            >

                                +

                            </button>

                        </div>


                        <strong class="cart-item-subtotal">

                            ${formatearPrecio(
                                subtotal
                            )}

                        </strong>


                        <button
                            type="button"
                            class="cart-remove"
                            data-cart-action="remove"
                            data-product-id="${producto.id}"
                        >

                            Eliminar

                        </button>

                    </div>

                `;

            }
        ).join("");


    return `

        <div class="cart-products">

            ${productosHTML}

        </div>


        <div class="cart-summary">

            <span>

                Total

            </span>


            <strong>

                ${formatearPrecio(total)}

            </strong>

        </div>


        <button
            type="button"
            class="cart-checkout"
            id="checkoutButton"
        >

            Continuar con la compra

        </button>

    `;

}


// ============================================================
// EVENTOS DEL CARRITO
// ============================================================

function configurarEventosCarrito(
    modal
) {

    const botones =
        modal.querySelectorAll(
            "[data-cart-action]"
        );


    botones.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    const accion =
                        boton.dataset.cartAction;


                    const productoId =
                        Number(
                            boton.dataset.productId
                        );


                    modificarCarrito(
                        productoId,
                        accion
                    );


                    modal.remove();


                    mostrarCarrito();

                }
            );

        }
    );


    const checkoutButton =
        modal.querySelector(
            "#checkoutButton"
        );


    if (checkoutButton) {

        checkoutButton.addEventListener(
            "click",
            iniciarCheckout
        );

    }

}


// ============================================================
// MODIFICAR CARRITO
// ============================================================

function modificarCarrito(
    productoId,
    accion
) {

    const indice =
        carrito.findIndex(
            item =>
                item.producto.id ===
                productoId
        );


    if (indice === -1) {

        return;

    }


    const item =
        carrito[indice];


    const stock =
        Number(
            item.producto.stock || 0
        );


    if (
        accion === "increase"
    ) {

        if (
            item.cantidad <
            stock
        ) {

            item.cantidad++;

        } else {

            alert(
                "No hay más unidades disponibles."
            );

        }

    }


    if (
        accion === "decrease"
    ) {

        item.cantidad--;


        if (
            item.cantidad <= 0
        ) {

            carrito.splice(
                indice,
                1
            );

        }

    }


    if (
        accion === "remove"
    ) {

        carrito.splice(
            indice,
            1
        );

    }


    actualizarCarrito();

}


// ============================================================
// CHECKOUT
// ============================================================

async function iniciarCheckout() {

    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    const existente = document.getElementById("checkoutModal");

    if (existente) {
        existente.remove();
    }

    const total = carrito.reduce(
        (suma, item) =>
            suma +
            Number(item.producto.precio) * item.cantidad,
        0
    );

    const modal = document.createElement("div");

    modal.id = "checkoutModal";
    modal.className = "checkout-modal";

    modal.innerHTML = `
        <div class="checkout-overlay" data-close-checkout></div>

        <div
            class="checkout-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkoutTitle"
        >
            <div class="checkout-header">
                <div>
                    <span class="checkout-label">NOVA LIVING</span>
                    <h2 id="checkoutTitle">Finaliza tu pedido</h2>
                    <p>Completa tus datos para registrar la compra.</p>
                </div>

                <button
                    type="button"
                    class="checkout-close"
                    aria-label="Cerrar"
                    data-close-checkout
                >
                    ×
                </button>
            </div>

            <div class="checkout-body">

                <div class="checkout-order-summary">
                    <div>
                        <span>Productos</span>
                        <strong>${carrito.reduce(
                            (totalCantidad, item) =>
                                totalCantidad + item.cantidad,
                            0
                        )}</strong>
                    </div>

                    <div>
                        <span>Total</span>
                        <strong>${formatearPrecio(total)}</strong>
                    </div>
                </div>

                <form id="checkoutForm" class="checkout-form">

                    <div class="checkout-section-title">
                        Datos del cliente
                    </div>

                    <div class="checkout-grid">

                        <div class="checkout-field">
                            <label for="checkoutNombre">
                                Nombre *
                            </label>
                            <input
                                id="checkoutNombre"
                                name="nombre"
                                type="text"
                                required
                                autocomplete="given-name"
                                placeholder="Juan"
                            >
                        </div>

                        <div class="checkout-field">
                            <label for="checkoutApellido">
                                Apellido *
                            </label>
                            <input
                                id="checkoutApellido"
                                name="apellido"
                                type="text"
                                required
                                autocomplete="family-name"
                                placeholder="Pérez"
                            >
                        </div>

                        <div class="checkout-field">
                            <label for="checkoutEmail">
                                Correo electrónico *
                            </label>
                            <input
                                id="checkoutEmail"
                                name="email"
                                type="email"
                                required
                                autocomplete="email"
                                placeholder="correo@ejemplo.com"
                            >
                        </div>

                        <div class="checkout-field">
                            <label for="checkoutTelefono">
                                Teléfono
                            </label>
                            <input
                                id="checkoutTelefono"
                                name="telefono"
                                type="tel"
                                autocomplete="tel"
                                placeholder="3001234567"
                            >
                        </div>

                        <div class="checkout-field checkout-field-full">
                            <label for="checkoutDireccion">
                                Dirección de entrega
                            </label>
                            <input
                                id="checkoutDireccion"
                                name="direccion"
                                type="text"
                                autocomplete="street-address"
                                placeholder="Calle 20 # 15-30"
                            >
                        </div>

                        <div class="checkout-field">
                            <label for="checkoutCiudad">
                                Ciudad
                            </label>
                            <input
                                id="checkoutCiudad"
                                name="ciudad"
                                type="text"
                                autocomplete="address-level2"
                                placeholder="Cali"
                            >
                        </div>

                        <div class="checkout-field">
                            <label for="checkoutObservaciones">
                                Observaciones
                            </label>
                            <input
                                id="checkoutObservaciones"
                                name="observaciones"
                                type="text"
                                placeholder="Información adicional"
                            >
                        </div>

                    </div>

                    <div
                        id="checkoutError"
                        class="checkout-message checkout-error"
                        hidden
                    ></div>

                    <div
                        id="checkoutLoading"
                        class="checkout-loading"
                        hidden
                    >
                        Registrando tu pedido...
                    </div>

                    <button
                        type="submit"
                        class="checkout-submit"
                        id="confirmOrderButton"
                    >
                        Confirmar pedido · ${formatearPrecio(total)}
                    </button>

                    <p class="checkout-demo-note">
                        Demo de Nova Living. El pedido se registra
                        directamente en la base de datos local.
                    </p>

                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const botonesCerrar =
        modal.querySelectorAll("[data-close-checkout]");

    botonesCerrar.forEach(boton => {
        boton.addEventListener("click", () => {
            modal.remove();
        });
    });

    const form = modal.querySelector("#checkoutForm");

    if (form) {
        form.addEventListener(
            "submit",
            procesarCheckout
        );
    }

    const primerCampo =
        modal.querySelector("#checkoutNombre");

    if (primerCampo) {
        setTimeout(() => primerCampo.focus(), 50);
    }
}


async function procesarCheckout(evento) {

    evento.preventDefault();

    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    const modal =
        document.getElementById("checkoutModal");

    if (!modal) {
        return;
    }

    const form = evento.currentTarget;

    const errorElemento =
        modal.querySelector("#checkoutError");

    const loadingElemento =
        modal.querySelector("#checkoutLoading");

    const boton =
        modal.querySelector("#confirmOrderButton");

    if (errorElemento) {
        errorElemento.hidden = true;
        errorElemento.textContent = "";
    }

    const datos = new FormData(form);

    const cliente = {
        nombre: String(datos.get("nombre") || "").trim(),
        apellido: String(datos.get("apellido") || "").trim(),
        email: String(datos.get("email") || "").trim(),
        telefono: String(datos.get("telefono") || "").trim() || null,
        direccion: String(datos.get("direccion") || "").trim() || null,
        ciudad: String(datos.get("ciudad") || "").trim() || null
    };

    const direccionEntrega = cliente.direccion;
    const ciudadEntrega = cliente.ciudad;

    if (
        !cliente.nombre ||
        !cliente.apellido ||
        !cliente.email
    ) {
        mostrarErrorCheckout(
            modal,
            "Completa los campos obligatorios: nombre, apellido y correo electrónico."
        );
        return;
    }

    if (boton) {
        boton.disabled = true;
        boton.textContent = "Procesando pedido...";
    }

    if (loadingElemento) {
        loadingElemento.hidden = false;
        loadingElemento.textContent =
            "Registrando tu pedido y preparando el pago...";
    }

    try {

        // --------------------------------------------------------
        // 1. BUSCAR SI YA EXISTE EL CLIENTE
        // --------------------------------------------------------

        let clienteId = null;

        const respuestaClientes =
            await fetch(`${API_BASE_URL}/clientes/`);

        if (!respuestaClientes.ok) {
            throw new Error(
                "No fue posible consultar los clientes."
            );
        }

        const datosClientes =
            await respuestaClientes.json();

        const clientes =
            datosClientes.clientes || [];

        const clienteExistente =
            clientes.find(
                item =>
                    String(item.email).toLowerCase() ===
                    cliente.email.toLowerCase()
            );

        // --------------------------------------------------------
        // 2. CREAR O REUTILIZAR CLIENTE
        // --------------------------------------------------------

        if (clienteExistente) {

            clienteId = clienteExistente.id;

        } else {

            const respuestaCliente =
                await fetch(
                    `${API_BASE_URL}/clientes/`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(cliente)
                    }
                );

            const datosCliente =
                await respuestaCliente.json();

            if (!respuestaCliente.ok) {
                throw new Error(
                    datosCliente.detail ||
                    "No fue posible registrar el cliente."
                );
            }

            clienteId =
                datosCliente.cliente_id;
        }

        // --------------------------------------------------------
        // 3. PREPARAR PRODUCTOS DEL PEDIDO
        // --------------------------------------------------------

        const productosPedido =
            carrito.map(item => ({
                producto_id: Number(item.producto.id),
                cantidad: Number(item.cantidad)
            }));

        const observaciones =
            String(
                datos.get("observaciones") || ""
            ).trim() || null;

        // --------------------------------------------------------
        // 4. CREAR PEDIDO
        // --------------------------------------------------------

        const respuestaPedido =
            await fetch(
                `${API_BASE_URL}/pedidos/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        cliente_id: clienteId,
                        productos: productosPedido,
                        direccion_entrega: direccionEntrega,
                        ciudad_entrega: ciudadEntrega,
                        observaciones: observaciones
                    })
                }
            );

        const datosPedido =
            await respuestaPedido.json();

        if (!respuestaPedido.ok) {
            throw new Error(
                datosPedido.detail ||
                "No fue posible crear el pedido."
            );
        }

        // --------------------------------------------------------
        // 5. GUARDAR INFORMACIÓN DEL PEDIDO
        // --------------------------------------------------------

        const pedidoId =
            datosPedido.pedido_id;

        const totalPedido =
            Number(datosPedido.total || 0);

        if (!pedidoId || totalPedido <= 0) {
            throw new Error(
                "El pedido fue creado, pero no se recibió un total válido."
            );
        }

        // --------------------------------------------------------
        // 6. CREAR PAGO DEMO
        // --------------------------------------------------------

        const respuestaPago =
            await fetch(
                `${API_BASE_URL}/pagos/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        pedido_id: Number(pedidoId),
                        metodo: "nequi_demo",
                        monto: totalPedido,
                        referencia: null,
                        observaciones:
                            "Pago de demostración de Nova Living."
                    })
                }
            );

        const datosPago =
            await respuestaPago.json();

        if (!respuestaPago.ok) {
            throw new Error(
                datosPago.detail ||
                "El pedido fue creado, pero no fue posible registrar el pago."
            );
        }

        const pagoId =
            datosPago.pago_id;

        if (!pagoId) {
            throw new Error(
                "No se recibió el identificador del pago."
            );
        }

        // --------------------------------------------------------
        // 7. OCULTAR CARGA Y MOSTRAR PANTALLA DE PAGO
        // --------------------------------------------------------

        if (loadingElemento) {
            loadingElemento.hidden = true;
        }

        mostrarPantallaPago(
            pedidoId,
            pagoId,
            totalPedido,
            cliente
        );

    } catch (error) {

        console.error(
            "Error procesando checkout:",
            error
        );

        mostrarErrorCheckout(
            modal,
            error.message ||
            "Ocurrió un error al registrar el pedido."
        );

        if (loadingElemento) {
            loadingElemento.hidden = true;
        }

        if (boton) {
            boton.disabled = false;
            boton.textContent =
                `Confirmar pedido · ${formatearPrecio(
                    carrito.reduce(
                        (suma, item) =>
                            suma +
                            Number(item.producto.precio) *
                            item.cantidad,
                        0
                    )
                )}`;
        }
    }
}


function mostrarPantallaPago(
    pedidoId,
    pagoId,
    total,
    cliente
) {

    const modal =
        document.getElementById("checkoutModal");

    if (!modal) {
        return;
    }

    modal.innerHTML = `

        <div class="checkout-overlay"></div>

        <div
            class="checkout-panel checkout-payment-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paymentTitle"
        >

            <div class="checkout-header">

                <div>

                    <span class="checkout-label">
                        NOVA LIVING
                    </span>

                    <h2 id="paymentTitle">
                        Finaliza tu pago
                    </h2>

                    <p>
                        Tu pedido ya fue registrado.
                        Ahora selecciona tu medio de pago
                        para completar la demostración.
                    </p>

                </div>

            </div>


            <div class="checkout-body">

                <div class="payment-order-card">

                    <div>
                        <span>Pedido</span>
                        <strong>#${escapeHTML(pedidoId)}</strong>
                    </div>

                    <div>
                        <span>Cliente</span>
                        <strong>
                            ${escapeHTML(
                                `${cliente.nombre} ${cliente.apellido}`
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Total a pagar</span>
                        <strong>
                            ${formatearPrecio(total)}
                        </strong>
                    </div>

                </div>


                <div class="checkout-section-title">
                    Método de pago
                </div>


                <div class="payment-methods">

                    <div class="payment-method active">

                        <div class="payment-method-icon">
                            N
                        </div>

                        <div>

                            <strong>
                                Nequi Demo
                            </strong>

                            <span>
                                Número: 300 000 0000
                            </span>

                        </div>

                    </div>


                    <div class="payment-method">

                        <div class="payment-method-icon">
                            B
                        </div>

                        <div>

                            <strong>
                                Bancolombia Demo
                            </strong>

                            <span>
                                Cuenta: 000-000000-00
                            </span>

                        </div>

                    </div>

                </div>


                <div class="payment-demo-warning">

                    <strong>Modo demostración</strong>

                    <p>
                        Los datos de pago mostrados son
                        completamente ficticios. No realices
                        transferencias reales a estos datos.
                    </p>

                </div>


                <div class="payment-total-box">

                    <span>
                        Total del pedido
                    </span>

                    <strong>
                        ${formatearPrecio(total)}
                    </strong>

                </div>


                <button
                    type="button"
                    class="checkout-submit"
                    id="confirmDemoPaymentButton"
                >
                    Ya realicé el pago
                </button>


                <button
                    type="button"
                    class="payment-cancel-button"
                    id="cancelDemoPaymentButton"
                >
                    Volver a la tienda
                </button>


                <p class="checkout-demo-note">
                    Pago de demostración conectado al backend
                    de Nova Living.
                </p>

                <div
                    id="paymentError"
                    class="checkout-message checkout-error"
                    hidden
                ></div>

            </div>

        </div>
    `;

    const confirmar =
        modal.querySelector(
            "#confirmDemoPaymentButton"
        );

    const cancelar =
        modal.querySelector(
            "#cancelDemoPaymentButton"
        );

    if (confirmar) {
        confirmar.addEventListener(
            "click",
            () => {
                confirmarPagoDemo(
                    pedidoId,
                    pagoId,
                    total,
                    cliente,
                    confirmar
                );
            }
        );
    }

    if (cancelar) {
        cancelar.addEventListener(
            "click",
            () => {

                modal.remove();

                mostrarNotificacionSimple(
                    "El pedido quedó pendiente de pago."
                );

            }
        );
    }
}


async function confirmarPagoDemo(
    pedidoId,
    pagoId,
    total,
    cliente,
    boton
) {

    const modal =
        document.getElementById("checkoutModal");

    if (!modal) {
        return;
    }

    const errorElemento =
        modal.querySelector("#paymentError");

    if (errorElemento) {
        errorElemento.hidden = true;
        errorElemento.textContent = "";
    }

    if (boton) {
        boton.disabled = true;
        boton.textContent =
            "Confirmando pago...";
    }

    try {

        // --------------------------------------------------------
        // 1. MARCAR PAGO COMO PAGADO
        // --------------------------------------------------------

        const respuestaPago =
            await fetch(
                `${API_BASE_URL}/pagos/${pagoId}/estado`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        estado: "pagado",
                        referencia:
                            `DEMO-${pedidoId}`,
                        observaciones:
                            "Pago confirmado en modo demostración."
                    })
                }
            );

        const datosPago =
            await respuestaPago.json();

        if (!respuestaPago.ok) {
            throw new Error(
                datosPago.detail ||
                datosPago.mensaje ||
                "No fue posible confirmar el pago."
            );
        }

        // --------------------------------------------------------
        // 2. CONFIRMAR PEDIDO
        // --------------------------------------------------------

        const respuestaPedido =
            await fetch(
                `${API_BASE_URL}/pedidos/${pedidoId}/estado`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        estado: "confirmado"
                    })
                }
            );

        const datosPedido =
            await respuestaPedido.json();

        if (!respuestaPedido.ok) {
            throw new Error(
                datosPedido.detail ||
                datosPedido.mensaje ||
                "El pago fue registrado, pero no fue posible confirmar el pedido."
            );
        }

        // --------------------------------------------------------
        // 3. AHORA SÍ VACIAMOS EL CARRITO
        // --------------------------------------------------------

        carrito = [];

        actualizarCarrito();

        // --------------------------------------------------------
        // 4. ACTUALIZAMOS PRODUCTOS Y STOCK
        // --------------------------------------------------------

        await cargarProductos();

        // --------------------------------------------------------
        // 5. MOSTRAMOS CONFIRMACIÓN FINAL
        // --------------------------------------------------------

        mostrarPedidoExitoso(
            pedidoId,
            total,
            cliente
        );

    } catch (error) {

        console.error(
            "Error confirmando pago:",
            error
        );

        if (errorElemento) {
            errorElemento.textContent =
                error.message ||
                "No fue posible confirmar el pago.";

            errorElemento.hidden = false;
        }

        if (boton) {
            boton.disabled = false;
            boton.textContent =
                "Ya realicé el pago";
        }
    }
}


function mostrarNotificacionSimple(
    mensaje
) {

    const existente =
        document.getElementById(
            "novaSimpleNotification"
        );

    if (existente) {
        existente.remove();
    }

    const elemento =
        document.createElement("div");

    elemento.id =
        "novaSimpleNotification";

    elemento.className =
        "cart-notification";

    elemento.textContent =
        mensaje;

    document.body.appendChild(
        elemento
    );

    setTimeout(
        () => {
            elemento.classList.add("show");
        },
        10
    );

    setTimeout(
        () => {

            elemento.classList.remove(
                "show"
            );

            setTimeout(
                () => {
                    elemento.remove();
                },
                300
            );

        },
        3200
    );
}


function mostrarErrorCheckout(
    modal,
    mensaje
) {

    const errorElemento =
        modal.querySelector("#checkoutError");

    if (!errorElemento) {
        alert(mensaje);
        return;
    }

    errorElemento.textContent =
        mensaje;

    errorElemento.hidden =
        false;

    errorElemento.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


function mostrarPedidoExitoso(
    pedidoId,
    total,
    cliente
) {

    const modal =
        document.getElementById("checkoutModal");

    if (!modal) {
        return;
    }

    modal.innerHTML = `

        <div class="checkout-overlay"></div>

        <div
            class="checkout-panel checkout-success-panel"
            role="dialog"
            aria-modal="true"
        >

            <div class="checkout-success">

                <div class="checkout-success-icon">
                    ✓
                </div>

                <span class="checkout-label">
                    NOVA LIVING
                </span>

                <h2>
                    ¡Pedido registrado!
                </h2>

                <p class="checkout-success-main">
                    Gracias,
                    <strong>${escapeHTML(cliente.nombre)}</strong>.
                    Tu pedido fue registrado correctamente.
                </p>

                <div class="checkout-success-card">

                    <div>
                        <span>Número de pedido</span>
                        <strong>#${pedidoId}</strong>
                    </div>

                    <div>
                        <span>Total</span>
                        <strong>${formatearPrecio(total)}</strong>
                    </div>

                    <div>
                        <span>Estado</span>
                        <strong>Pendiente</strong>
                    </div>

                </div>

                <p class="checkout-success-note">
                    En esta versión demo, el pedido ya quedó
                    guardado en la base de datos de Nova Living.
                </p>

                <button
                    type="button"
                    class="checkout-submit"
                    id="closeSuccessButton"
                >
                    Volver a la tienda
                </button>

            </div>

        </div>
    `;

    const boton =
        modal.querySelector("#closeSuccessButton");

    if (boton) {
        boton.addEventListener(
            "click",
            () => modal.remove()
        );
    }
}


// ============================================================
// NAVEGACIÓN

// ============================================================

function configurarNavegacion() {

    const enlaces =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    enlaces.forEach(
        enlace => {

            enlace.addEventListener(
                "click",
                evento => {

                    const destino =
                        enlace.getAttribute(
                            "href"
                        );


                    if (
                        !destino ||
                        destino === "#"
                    ) {

                        return;

                    }


                    const elemento =
                        document.querySelector(
                            destino
                        );


                    if (!elemento) {

                        return;

                    }


                    evento.preventDefault();


                    elemento.scrollIntoView({

                        behavior: "smooth",

                        block: "start"

                    });

                }
            );

        }
    );

}


// ============================================================
// FORMATEAR PRECIO
// ============================================================

function formatearPrecio(
    precio
) {

    const valor =
        Number(precio);


    if (
        Number.isNaN(valor)
    ) {

        return "$0";

    }


    return new Intl.NumberFormat(
        "es-CO",
        {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0
        }
    ).format(valor);

}


// ============================================================
// ESCAPAR HTML
// ============================================================

function escapeHTML(
    texto
) {

    const elemento =
        document.createElement(
            "div"
        );


    elemento.textContent =
        String(
            texto ?? ""
        );


    return elemento.innerHTML;

}


// ============================================================
// ESTILOS DINÁMICOS DEL CARRITO
// ============================================================

function agregarEstilosCarrito() {

    if (
        document.getElementById(
            "novaCartStyles"
        )
    ) {

        return;

    }


    const estilos =
        document.createElement(
            "style"
        );


    estilos.id =
        "novaCartStyles";


    estilos.textContent = `

        .cart-icon {

            display: inline-flex;

            align-items: center;

        }


        .cart-text {

            display: inline-flex;

            align-items: center;

        }


        .cart-count {

            display: inline-flex;

            align-items: center;

            justify-content: center;

            min-width: 22px;

            height: 22px;

            margin-left: 7px;

            padding: 0 6px;

            border-radius: 50px;

            background: #1f1f1f;

            color: #ffffff;

            font-size: 12px;

            font-weight: 700;

        }


        .cart-notification {

            position: fixed;

            right: 24px;

            bottom: 24px;

            z-index: 9999;

            padding: 14px 20px;

            background: #1f1f1f;

            color: #ffffff;

            border-radius: 8px;

            box-shadow:
                0 12px 35px
                rgba(0,0,0,0.18);

            opacity: 0;

            transform:
                translateY(15px);

            transition:
                opacity .3s ease,
                transform .3s ease;

            pointer-events: none;

        }


        .cart-notification.show {

            opacity: 1;

            transform:
                translateY(0);

        }


        .cart-modal {

            position: fixed;

            inset: 0;

            z-index: 10000;

        }


        .cart-overlay {

            position: absolute;

            inset: 0;

            background:
                rgba(0,0,0,0.48);

        }


        .cart-panel {

            position: absolute;

            top: 0;

            right: 0;

            width: min(
                520px,
                100%
            );

            height: 100%;

            background: #ffffff;

            box-shadow:
                -10px 0 35px
                rgba(0,0,0,0.15);

            display: flex;

            flex-direction: column;

            overflow: hidden;

        }


        .cart-header {

            display: flex;

            align-items: flex-start;

            justify-content:
                space-between;

            gap: 20px;

            padding: 28px;

            border-bottom:
                1px solid #e8e4df;

        }


        .cart-label {

            font-size: 11px;

            letter-spacing: 2px;

            font-weight: 700;

            color: #8a8178;

        }


        .cart-header h2 {

            margin:
                6px 0 0;

            font-size: 28px;

            color: #222222;

        }


        .cart-close {

            width: 40px;

            height: 40px;

            border: 0;

            border-radius: 50%;

            background: #f1eee9;

            color: #222222;

            font-size: 25px;

            cursor: pointer;

        }


        .cart-body {

            flex: 1;

            overflow-y: auto;

            padding: 24px;

        }


        .cart-empty {

            min-height: 65vh;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            text-align: center;

            padding: 30px;

        }


        .cart-empty-icon {

            font-size: 50px;

            margin-bottom: 15px;

        }


        .cart-empty h3 {

            margin:
                0 0 10px;

            color: #222222;

        }


        .cart-empty p {

            margin: 0;

            color: #777777;

            line-height: 1.6;

        }


        .cart-item {

            display: grid;

            grid-template-columns:
                1fr auto;

            gap: 10px;

            padding:
                18px 0;

            border-bottom:
                1px solid #ebe7e2;

        }


        .cart-item-info h3 {

            margin: 0 0 6px;

            font-size: 16px;

            color: #222222;

        }


        .cart-item-info p {

            margin: 0;

            color: #777777;

            font-size: 14px;

        }


        .cart-item-controls {

            display: flex;

            align-items: center;

            gap: 10px;

        }


        .cart-quantity-button {

            width: 30px;

            height: 30px;

            border:
                1px solid #d8d2cb;

            background: #ffffff;

            border-radius: 50%;

            cursor: pointer;

            font-size: 18px;

        }


        .cart-item-subtotal {

            color: #222222;

        }


        .cart-remove {

            justify-self: start;

            border: 0;

            padding: 0;

            background: transparent;

            color: #8a8178;

            text-decoration: underline;

            cursor: pointer;

            font-size: 13px;

        }


        .cart-summary {

            display: flex;

            align-items: center;

            justify-content:
                space-between;

            gap: 20px;

            margin-top: 25px;

            padding-top: 20px;

            border-top:
                1px solid #dcd6cf;

        }


        .cart-summary span {

            font-size: 16px;

            color: #555555;

        }


        .cart-summary strong {

            font-size: 22px;

            color: #222222;

        }


        .cart-checkout {

            width: 100%;

            margin-top: 20px;

            padding: 15px 20px;

            border: 0;

            border-radius: 7px;

            background: #222222;

            color: #ffffff;

            cursor: pointer;

            font-weight: 700;

            font-size: 15px;

        }


        .cart-checkout:hover {

            background: #444444;

        }


        @media (max-width: 600px) {

            .cart-panel {

                width: 100%;

            }


            .cart-header {

                padding: 20px;

            }


            .cart-body {

                padding: 20px;

            }


            .cart-item {

                grid-template-columns:
                    1fr;

            }


            .cart-item-controls {

                justify-content:
                    flex-start;

            }


            .cart-item-subtotal {

                justify-self:
                    start;

            }


            .cart-notification {

                right: 15px;

                bottom: 15px;

                left: 15px;

                text-align: center;

            }

        }

    `;


    document.head.appendChild(
        estilos
    );

}


// ============================================================
// ACTIVAR ESTILOS DEL CARRITO
// ============================================================

agregarEstilosCarrito();

// ============================================================
// ESTILOS DEL CHECKOUT
// ============================================================

function agregarEstilosCheckout() {

    if (document.getElementById("novaCheckoutStyles")) {
        return;
    }

    const estilos = document.createElement("style");

    estilos.id = "novaCheckoutStyles";

    estilos.textContent = `

        .checkout-modal {
            position: fixed;
            inset: 0;
            z-index: 11000;
            overflow-y: auto;
            padding: 30px 18px;
            box-sizing: border-box;
        }

        .checkout-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.52);
        }

        .checkout-panel {
            position: relative;
            width: min(760px, 100%);
            min-height: 100px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 14px;
            box-shadow: 0 25px 70px rgba(0, 0, 0, 0.22);
            overflow: hidden;
        }

        .checkout-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            padding: 30px;
            border-bottom: 1px solid #e8e4df;
        }

        .checkout-label {
            display: block;
            margin-bottom: 7px;
            color: #8a8178;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 2.5px;
        }

        .checkout-header h2 {
            margin: 0;
            color: #222222;
            font-size: 30px;
            line-height: 1.15;
        }

        .checkout-header p {
            margin: 9px 0 0;
            color: #777777;
            line-height: 1.5;
        }

        .checkout-close {
            flex: 0 0 auto;
            width: 42px;
            height: 42px;
            border: 0;
            border-radius: 50%;
            background: #f1eee9;
            color: #222222;
            font-size: 26px;
            line-height: 1;
            cursor: pointer;
        }

        .checkout-close:hover {
            background: #e6e0d8;
        }

        .checkout-body {
            padding: 30px;
        }

        .checkout-order-summary {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 28px;
        }

        .checkout-order-summary > div {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            padding: 16px 18px;
            border: 1px solid #e4ded7;
            border-radius: 10px;
            background: #faf9f7;
        }

        .checkout-order-summary span {
            color: #777777;
            font-size: 14px;
        }

        .checkout-order-summary strong {
            color: #222222;
            font-size: 17px;
        }

        .checkout-section-title {
            margin-bottom: 17px;
            color: #222222;
            font-size: 18px;
            font-weight: 700;
        }

        .checkout-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 17px;
        }

        .checkout-field {
            min-width: 0;
        }

        .checkout-field-full {
            grid-column: 1 / -1;
        }

        .checkout-field label {
            display: block;
            margin-bottom: 7px;
            color: #444444;
            font-size: 13px;
            font-weight: 600;
        }

        .checkout-field input {
            width: 100%;
            min-height: 46px;
            padding: 12px 13px;
            box-sizing: border-box;
            border: 1px solid #d8d2cb;
            border-radius: 7px;
            outline: none;
            background: #ffffff;
            color: #222222;
            font-family: inherit;
            font-size: 14px;
        }

        .checkout-field input:focus {
            border-color: #8a8178;
            box-shadow: 0 0 0 3px rgba(138, 129, 120, 0.10);
        }

        .checkout-message {
            margin-top: 18px;
            padding: 13px 15px;
            border-radius: 8px;
            font-size: 14px;
            line-height: 1.5;
        }

        .checkout-error {
            border: 1px solid #e4b8b8;
            background: #fff4f4;
            color: #9a2d2d;
        }

        .checkout-loading {
            margin-top: 18px;
            padding: 12px 15px;
            border-radius: 8px;
            background: #f4f1ed;
            color: #555555;
            text-align: center;
            font-size: 14px;
        }

        .checkout-submit {
            width: 100%;
            margin-top: 22px;
            padding: 15px 20px;
            border: 0;
            border-radius: 7px;
            background: #222222;
            color: #ffffff;
            cursor: pointer;
            font-family: inherit;
            font-size: 15px;
            font-weight: 700;
        }

        .checkout-submit:hover {
            background: #444444;
        }

        .checkout-submit:disabled {
            opacity: 0.65;
            cursor: wait;
        }

        .checkout-demo-note {
            margin: 13px 0 0;
            color: #8a8178;
            font-size: 12px;
            line-height: 1.5;
            text-align: center;
        }

        .checkout-success-panel {
            max-width: 560px;
        }

        .checkout-success {
            padding: 42px 32px;
            text-align: center;
        }

        .checkout-success-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            height: 64px;
            margin: 0 auto 20px;
            border-radius: 50%;
            background: #222222;
            color: #ffffff;
            font-size: 31px;
            font-weight: 700;
        }

        .checkout-success h2 {
            margin: 5px 0 12px;
            color: #222222;
            font-size: 30px;
        }

        .checkout-success-main {
            max-width: 440px;
            margin: 0 auto;
            color: #666666;
            line-height: 1.6;
        }

        .checkout-success-card {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 25px;
        }

        .checkout-success-card > div {
            padding: 15px 10px;
            border: 1px solid #e4ded7;
            border-radius: 9px;
            background: #faf9f7;
        }

        .checkout-success-card span {
            display: block;
            margin-bottom: 6px;
            color: #888888;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.7px;
        }

        .checkout-success-card strong {
            display: block;
            color: #222222;
            font-size: 15px;
        }

        .checkout-success-note {
            margin: 22px auto 0;
            color: #777777;
            font-size: 13px;
            line-height: 1.55;
        }

        @media (max-width: 650px) {

            .checkout-modal {
                padding: 12px;
            }

            .checkout-header {
                padding: 22px 20px;
            }

            .checkout-header h2 {
                font-size: 25px;
            }

            .checkout-body {
                padding: 20px;
            }

            .checkout-order-summary {
                grid-template-columns: 1fr;
            }

            .checkout-grid {
                grid-template-columns: 1fr;
            }

            .checkout-field-full {
                grid-column: auto;
            }

            .checkout-success {
                padding: 35px 20px;
            }

            .checkout-success h2 {
                font-size: 25px;
            }

            .checkout-success-card {
                grid-template-columns: 1fr;
            }
        }

    `;

    document.head.appendChild(estilos);
}


agregarEstilosCheckout();

function agregarEstilosPago() {

    if (
        document.getElementById(
            "novaPaymentStyles"
        )
    ) {
        return;
    }

    const estilos =
        document.createElement("style");

    estilos.id =
        "novaPaymentStyles";

    estilos.textContent = `

        .checkout-payment-panel {
            max-width: 760px;
        }

        .payment-order-card {
            display: grid;
            grid-template-columns:
                repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 28px;
        }

        .payment-order-card > div {
            padding: 16px;
            border: 1px solid #e4ded7;
            border-radius: 10px;
            background: #faf9f7;
        }

        .payment-order-card span {
            display: block;
            margin-bottom: 7px;
            color: #888888;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.7px;
        }

        .payment-order-card strong {
            display: block;
            color: #222222;
            font-size: 15px;
            line-height: 1.35;
        }

        .payment-methods {
            display: grid;
            grid-template-columns:
                repeat(2, 1fr);
            gap: 14px;
        }

        .payment-method {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 17px;
            border: 1px solid #e1dbd4;
            border-radius: 10px;
            background: #ffffff;
        }

        .payment-method.active {
            border-color: #222222;
            box-shadow:
                0 0 0 2px
                rgba(34,34,34,0.06);
        }

        .payment-method-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: #222222;
            color: #ffffff;
            font-size: 18px;
            font-weight: 800;
        }

        .payment-method strong {
            display: block;
            margin-bottom: 5px;
            color: #222222;
            font-size: 14px;
        }

        .payment-method span {
            display: block;
            color: #777777;
            font-size: 12px;
            line-height: 1.45;
        }

        .payment-demo-warning {
            margin-top: 20px;
            padding: 15px 17px;
            border: 1px solid #e5d9c8;
            border-radius: 9px;
            background: #fbf7f0;
        }

        .payment-demo-warning strong {
            display: block;
            margin-bottom: 5px;
            color: #5f513e;
            font-size: 14px;
        }

        .payment-demo-warning p {
            margin: 0;
            color: #756b5d;
            font-size: 13px;
            line-height: 1.55;
        }

        .payment-total-box {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-top: 22px;
            padding: 18px;
            border-top: 1px solid #ddd6cf;
            border-bottom: 1px solid #ddd6cf;
        }

        .payment-total-box span {
            color: #555555;
            font-size: 15px;
        }

        .payment-total-box strong {
            color: #222222;
            font-size: 22px;
        }

        .payment-cancel-button {
            width: 100%;
            margin-top: 10px;
            padding: 13px 20px;
            border: 1px solid #d7d0c8;
            border-radius: 7px;
            background: #ffffff;
            color: #444444;
            cursor: pointer;
            font-family: inherit;
            font-size: 14px;
            font-weight: 600;
        }

        .payment-cancel-button:hover {
            background: #f7f5f2;
        }

        @media (max-width: 650px) {

            .payment-order-card {
                grid-template-columns: 1fr;
            }

            .payment-methods {
                grid-template-columns: 1fr;
            }

            .payment-total-box {
                align-items: flex-start;
                flex-direction: column;
                gap: 7px;
            }

        }

    `;

    document.head.appendChild(
        estilos
    );
}

agregarEstilosPago();

