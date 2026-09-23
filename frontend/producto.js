// ============================================================
// NOVA LIVING
// SCRIPT PRINCIPAL
// ============================================================


// ============================================================
// CONFIGURACIÓN DE LA API
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8000";


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
// OBTENER IMAGEN DE CATEGORÍA
// ============================================================

function obtenerImagenCategoria(
    categoria
) {

    // ========================================================
    // IMAGEN PRINCIPAL DE CADA CATEGORÍA
    // ========================================================
    // Usamos fotografías reales de productos de Nova Living
    // como portada de cada categoría.

    const imagenesCategorias = {
        "sala": "images/sofa-oslo.jpg",
        "dormitorio": "images/cama-aurora.jpg",
        "comedor": "images/mesa-comedor-nordic.jpg",
        "oficina": "images/escritorio-lyon.jpg",
        "decoracion": "images/lampara-torre.jpg",
        "exterior": "images/silla-terra.jpg"
    };

    const nombreCategoria = String(
        categoria.nombre || ""
    )
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\\u0300-\\u036f]/g, "");

    if (imagenesCategorias[nombreCategoria]) {
        return imagenesCategorias[nombreCategoria];
    }

    // Si en el futuro se asigna una imagen desde la base de datos,
    // también la aceptamos.
    if (
        categoria.imagen &&
        categoria.imagen.trim() !== ""
    ) {
        const imagen = categoria.imagen.trim();

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

        const imagen = producto.imagen.trim();

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
            "catalog"
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

function iniciarCheckout() {

    if (
        carrito.length === 0
    ) {

        alert(
            "Tu carrito está vacío."
        );

        return;

    }


    let total =
        0;


    carrito.forEach(
        item => {

            total +=
                Number(
                    item.producto.precio
                ) *
                item.cantidad;

        }
    );


    alert(

        "Checkout de Nova Living\n\n" +

        "Total del pedido: " +

        formatearPrecio(
            total
        ) +

        "\n\n" +

        "Esta función será conectada " +

        "posteriormente al sistema de clientes, " +

        "pedidos y pagos."

    );

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