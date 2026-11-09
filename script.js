/* =========================================================
   SIMULADOR DE CAÍDA LIBRE
   JAVASCRIPT
========================================================= */


/* =========================================================
   1. OBTENER ELEMENTOS DEL HTML
========================================================= */

// Variables de entrada
const inputMasa = document.getElementById("masa");
const inputAltura = document.getElementById("alturaInicial");
const inputGravedad = document.getElementById("gravedad");
const inputFriccion = document.getElementById("friccion");

// Botones
const btnIniciar = document.getElementById("btnIniciar");
const btnPausar = document.getElementById("btnPausar");
const btnReiniciar = document.getElementById("btnReiniciar");

// Objeto y zona de caída
const objeto = document.getElementById("objeto");
const zonaCaida = document.getElementById("zonaCaida");

// Estado
const estadoSimulacion =
    document.getElementById("estadoSimulacion");

// Datos en pantalla
const tiempoElemento =
    document.getElementById("tiempo");

const alturaElemento =
    document.getElementById("alturaActual");

const velocidadElemento =
    document.getElementById("velocidad");

const energiaPotencialElemento =
    document.getElementById("energiaPotencial");

const energiaCineticaElemento =
    document.getElementById("energiaCinetica");

const energiaMecanicaElemento =
    document.getElementById("energiaMecanica");

// Conservación
const conservacion =
    document.getElementById("conservacion");

// Tabla
const cuerpoTabla =
    document.getElementById("cuerpoTabla");

// Escala
const alturaMaximaElemento =
    document.getElementById("alturaMaxima");

// Canvas de gráficas
const canvasEnergia =
    document.getElementById("graficaEnergia");

const canvasMovimiento =
    document.getElementById("graficaMovimiento");


/* =========================================================
   2. VARIABLES DE LA SIMULACIÓN
========================================================= */

let simulando = false;

let pausado = false;

let animationFrame = null;

let tiempo = 0;

let tiempoAnterior = null;

let alturaInicial = 20;

let alturaActual = 20;

let velocidadActual = 0;

let masa = 2;

let gravedad = 9.81;

let friccion = 0;


/* =========================================================
   3. DATOS PARA LAS GRÁFICAS
========================================================= */

let datosTiempo = [];

let datosAltura = [];

let datosVelocidad = [];

let datosEp = [];

let datosEc = [];

let datosEm = [];


/* =========================================================
   4. CONTROL DE REGISTRO DE TABLA
========================================================= */

let ultimoSegundoRegistrado = -1;


/* =========================================================
   5. INICIALIZAR SIMULADOR
========================================================= */

function inicializarSimulador() {

    masa = obtenerNumero(inputMasa.value, 2);

    alturaInicial =
        obtenerNumero(inputAltura.value, 20);

    gravedad =
        obtenerNumero(inputGravedad.value, 9.81);

    friccion =
        obtenerNumero(inputFriccion.value, 0);


    // Evitar valores inválidos

    if (masa <= 0) {
        masa = 2;
        inputMasa.value = 2;
    }

    if (alturaInicial <= 0) {
        alturaInicial = 20;
        inputAltura.value = 20;
    }

    if (gravedad <= 0) {
        gravedad = 9.81;
        inputGravedad.value = 9.81;
    }

    if (friccion < 0) {
        friccion = 0;
        inputFriccion.value = 0;
    }

    if (friccion > 100) {
        friccion = 100;
        inputFriccion.value = 100;
    }


    tiempo = 0;

    alturaActual = alturaInicial;

    velocidadActual = 0;


    datosTiempo = [];

    datosAltura = [];

    datosVelocidad = [];

    datosEp = [];

    datosEc = [];

    datosEm = [];


    ultimoSegundoRegistrado = -1;


    // Limpiar tabla

    cuerpoTabla.innerHTML = "";


    // Actualizar escala

    alturaMaximaElemento.textContent =
        `${alturaInicial.toFixed(0)} m`;


    // Actualizar datos iniciales

    actualizarPantalla();


    // Dibujar objeto arriba

    moverObjeto();


    // Registrar el instante inicial

    registrarDatos();


    // Dibujar gráficas vacías/iniciales

    dibujarGraficaEnergia();

    dibujarGraficaMovimiento();


    // Estado

    estadoSimulacion.innerHTML =
        "🟢 Listo para iniciar";

    estadoSimulacion.style.background =
        "#f0fdf4";

    estadoSimulacion.style.color =
        "#166534";


    // Conservación

    actualizarConservacion();

}


/* =========================================================
   6. OBTENER NÚMERO
========================================================= */

function obtenerNumero(valor, valorPorDefecto) {

    const numero = parseFloat(valor);

    if (isNaN(numero)) {
        return valorPorDefecto;
    }

    return numero;
}


/* =========================================================
   7. CALCULAR ENERGÍA POTENCIAL
========================================================= */

function calcularEnergiaPotencial() {

    return masa * gravedad * alturaActual;

}


/* =========================================================
   8. CALCULAR ENERGÍA CINÉTICA
========================================================= */

function calcularEnergiaCinetica() {

    return 0.5 *
        masa *
        Math.pow(velocidadActual, 2);

}


/* =========================================================
   9. CALCULAR ENERGÍA MECÁNICA
========================================================= */

function calcularEnergiaMecanica() {

    return calcularEnergiaPotencial()
        +
        calcularEnergiaCinetica();

}


/* =========================================================
   10. ACTUALIZAR DATOS EN PANTALLA
========================================================= */

function actualizarPantalla() {

    const energiaPotencial =
        calcularEnergiaPotencial();

    const energiaCinetica =
        calcularEnergiaCinetica();

    const energiaMecanica =
        calcularEnergiaMecanica();


    tiempoElemento.textContent =
        tiempo.toFixed(2);

    alturaElemento.textContent =
        Math.max(0, alturaActual).toFixed(2);

    velocidadElemento.textContent =
        Math.max(0, velocidadActual).toFixed(2);

    energiaPotencialElemento.textContent =
        Math.max(0, energiaPotencial).toFixed(2);

    energiaCineticaElemento.textContent =
        Math.max(0, energiaCinetica).toFixed(2);

    energiaMecanicaElemento.textContent =
        Math.max(0, energiaMecanica).toFixed(2);


    actualizarConservacion();

}


/* =========================================================
   11. MOVER EL OBJETO EN LA PANTALLA
========================================================= */

function moverObjeto() {

    const alturaZona =
        zonaCaida.clientHeight;

    const alturaObjeto =
        objeto.offsetHeight;

    const alturaSuelo = 55;


    const espacioMovimiento =
        alturaZona -
        alturaObjeto -
        alturaSuelo;


    let porcentajeCaida = 0;


    if (alturaInicial > 0) {

        porcentajeCaida =
            1 -
            (alturaActual / alturaInicial);

    }


    porcentajeCaida =
        Math.max(
            0,
            Math.min(1, porcentajeCaida)
        );


    const posicion =
        porcentajeCaida *
        espacioMovimiento;


    objeto.style.top =
        `${posicion}px`;

}


/* =========================================================
   12. REGISTRAR DATOS
========================================================= */

function registrarDatos() {

    const energiaPotencial =
        calcularEnergiaPotencial();

    const energiaCinetica =
        calcularEnergiaCinetica();

    const energiaMecanica =
        calcularEnergiaMecanica();


    datosTiempo.push(tiempo);

    datosAltura.push(alturaActual);

    datosVelocidad.push(velocidadActual);

    datosEp.push(energiaPotencial);

    datosEc.push(energiaCinetica);

    datosEm.push(energiaMecanica);


    agregarFilaTabla(
        tiempo,
        alturaActual,
        velocidadActual,
        energiaPotencial,
        energiaCinetica,
        energiaMecanica
    );


    dibujarGraficaEnergia();

    dibujarGraficaMovimiento();

}


/* =========================================================
   13. AGREGAR FILA A LA TABLA
========================================================= */

function agregarFilaTabla(
    tiempoDato,
    alturaDato,
    velocidadDato,
    epDato,
    ecDato,
    emDato
) {

    const fila =
        document.createElement("tr");


    fila.innerHTML = `

        <td>
            ${tiempoDato.toFixed(2)}
        </td>

        <td>
            ${Math.max(0, alturaDato).toFixed(2)}
        </td>

        <td>
            ${Math.max(0, velocidadDato).toFixed(2)}
        </td>

        <td>
            ${Math.max(0, epDato).toFixed(2)}
        </td>

        <td>
            ${Math.max(0, ecDato).toFixed(2)}
        </td>

        <td>
            ${Math.max(0, emDato).toFixed(2)}
        </td>

    `;


    cuerpoTabla.appendChild(fila);

}


/* =========================================================
   14. INICIAR SIMULACIÓN
========================================================= */

function iniciarSimulacion() {

    if (simulando && !pausado) {
        return;
    }


    // Si estaba pausado

    if (pausado) {

        pausado = false;

        simulando = true;

        tiempoAnterior = performance.now();

        estadoSimulacion.innerHTML =
            "🔵 Simulación reanudada";

        ejecutarSimulacion();

        return;
    }


    // Nueva simulación

    inicializarSimulador();


    simulando = true;

    pausado = false;

    tiempoAnterior = performance.now();


    estadoSimulacion.innerHTML =
        "🔵 Simulación en progreso...";


    estadoSimulacion.style.background =
        "#eff6ff";

    estadoSimulacion.style.color =
        "#1d4ed8";


    ejecutarSimulacion();

}


/* =========================================================
   15. EJECUTAR ANIMACIÓN
========================================================= */

function ejecutarSimulacion() {

    if (!simulando || pausado) {
        return;
    }


    const ahora =
        performance.now();


    if (tiempoAnterior === null) {

        tiempoAnterior = ahora;

    }


    let deltaTiempo =
        (ahora - tiempoAnterior) / 1000;


    tiempoAnterior = ahora;


    // Evitar saltos demasiado grandes

    if (deltaTiempo > 0.05) {
        deltaTiempo = 0.05;
    }


    // Tiempo

    tiempo += deltaTiempo;


    /* =====================================================
       FÍSICA
    ====================================================== */


    /*
       Sin fricción:

       a = g

       Con fricción simplificada:

       a = g × (1 - fricción)

       La fricción se interpreta como un porcentaje
       de reducción de la aceleración.
    */

    const factorFriccion =
        Math.max(
            0,
            1 - friccion / 100
        );


    const aceleracion =
        gravedad *
        factorFriccion;


    // Actualizar velocidad

    velocidadActual +=
        aceleracion *
        deltaTiempo;


    // Actualizar altura

    alturaActual -=
        velocidadActual *
        deltaTiempo;


    /* =====================================================
       EVITAR QUE BAJE DE CERO
    ====================================================== */

    if (alturaActual <= 0) {

        alturaActual = 0;

        // Velocidad final aproximada

        if (friccion === 0) {

            velocidadActual =
                Math.sqrt(
                    2 *
                    gravedad *
                    alturaInicial
                );

        }


        actualizarPantalla();

        moverObjeto();

        registrarDatos();


        finalizarSimulacion();

        return;
    }


    /* =====================================================
       ACTUALIZAR PANTALLA
    ====================================================== */

    actualizarPantalla();

    moverObjeto();


    /* =====================================================
       REGISTRAR DATOS CADA SEGUNDO
    ====================================================== */

    const segundoActual =
        Math.floor(tiempo);


    if (
        segundoActual >
        ultimoSegundoRegistrado
    ) {

        ultimoSegundoRegistrado =
            segundoActual;

        registrarDatos();

    }


    /* =====================================================
       CONTINUAR ANIMACIÓN
    ====================================================== */

    animationFrame =
        requestAnimationFrame(
            ejecutarSimulacion
        );

}


/* =========================================================
   16. FINALIZAR SIMULACIÓN
========================================================= */

function finalizarSimulacion() {

    simulando = false;

    pausado = false;

    animationFrame = null;

    tiempoAnterior = null;


    estadoSimulacion.innerHTML =
        "🏁 El objeto llegó al suelo";


    estadoSimulacion.style.background =
        "#fef3c7";

    estadoSimulacion.style.color =
        "#92400e";


    actualizarConservacion();


    // Asegurar que aparezca el dato final

    const ultimoDato =
        datosTiempo.length - 1;


    if (
        ultimoDato >= 0 &&
        datosTiempo[ultimoDato] !== tiempo
    ) {

        registrarDatos();

    }

}


/* =========================================================
   17. PAUSAR
========================================================= */

function pausarSimulacion() {

    if (!simulando) {

        return;

    }


    pausado = true;

    simulando = false;


    if (animationFrame !== null) {

        cancelAnimationFrame(
            animationFrame
        );

    }


    animationFrame = null;

    tiempoAnterior = null;


    estadoSimulacion.innerHTML =
        "⏸️ Simulación pausada";


    estadoSimulacion.style.background =
        "#fef3c7";

    estadoSimulacion.style.color =
        "#92400e";

}


/* =========================================================
   18. REINICIAR
========================================================= */

function reiniciarSimulacion() {

    if (animationFrame !== null) {

        cancelAnimationFrame(
            animationFrame
        );

    }


    simulando = false;

    pausado = false;

    animationFrame = null;

    tiempoAnterior = null;


    inicializarSimulador();


    estadoSimulacion.innerHTML =
        "🟢 Simulación reiniciada";


    estadoSimulacion.style.background =
        "#f0fdf4";

    estadoSimulacion.style.color =
        "#166534";

}


/* =========================================================
   19. INDICADOR DE CONSERVACIÓN
========================================================= */

function actualizarConservacion() {

    if (!conservacion) {
        return;
    }


    /*
       Energía mecánica inicial
    */

    const energiaInicial =
        masa *
        gravedad *
        alturaInicial;


    const energiaActual =
        calcularEnergiaMecanica();


    if (energiaInicial <= 0) {
        return;
    }


    const diferencia =
        Math.abs(
            energiaActual -
            energiaInicial
        );


    const porcentaje =
        (diferencia /
            energiaInicial) *
        100;


    if (friccion === 0) {

        conservacion.innerHTML = `

            <span class="conservation-icon">
                ✓
            </span>

            <div>

                <strong>
                    Energía mecánica conservada
                </strong>

                <p>
                    La energía mecánica permanece aproximadamente constante.
                    Diferencia: ${porcentaje.toFixed(2)}%
                </p>

            </div>

        `;

        conservacion.style.background =
            "#f0fdf4";

        conservacion.style.borderColor =
            "#bbf7d0";

        conservacion.style.color =
            "#166534";

    } else {

        conservacion.innerHTML = `

            <span class="conservation-icon">
                !
            </span>

            <div>

                <strong>
                    Hay pérdida de energía por fricción
                </strong>

                <p>
                    La fricción está reduciendo la aceleración del objeto.
                    Fricción: ${friccion.toFixed(1)}%
                </p>

            </div>

        `;

        conservacion.style.background =
            "#fff7ed";

        conservacion.style.borderColor =
            "#fed7aa";

        conservacion.style.color =
            "#9a3412";

    }

}


/* =========================================================
   20. GRÁFICA DE ENERGÍA
========================================================= */

function dibujarGraficaEnergia() {

    const canvas =
        canvasEnergia;

    const ctx =
        canvas.getContext("2d");


    prepararCanvas(canvas);


    const ancho =
        canvas.width;

    const alto =
        canvas.height;


    // Escala del dispositivo

    const dpr =
        window.devicePixelRatio || 1;


    const anchoLogico =
        ancho / dpr;

    const altoLogico =
        alto / dpr;


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    ctx.clearRect(
        0,
        0,
        anchoLogico,
        altoLogico
    );


    dibujarFondoGrafica(
        ctx,
        anchoLogico,
        altoLogico
    );


    if (datosTiempo.length < 1) {

        dibujarTextoCentro(
            ctx,
            "Inicia la simulación para ver la gráfica",
            anchoLogico,
            altoLogico
        );

        return;

    }


    const margenIzquierdo = 65;

    const margenDerecho = 25;

    const margenSuperior = 35;

    const margenInferior = 50;


    const graficaAncho =
        anchoLogico -
        margenIzquierdo -
        margenDerecho;


    const graficaAlto =
        altoLogico -
        margenSuperior -
        margenInferior;


    const tiempoMax =
        Math.max(
            1,
            datosTiempo[datosTiempo.length - 1]
        );


    const valores =
        [
            ...datosEp,
            ...datosEc,
            ...datosEm
        ];


    let maxEnergia =
        Math.max(...valores);


    if (maxEnergia <= 0) {
        maxEnergia = 1;
    }


    maxEnergia *= 1.1;


    // Ejes

    dibujarEjes(
        ctx,
        margenIzquierdo,
        margenSuperior,
        graficaAncho,
        graficaAlto
    );


    // Líneas horizontales

    dibujarLineasGuia(
        ctx,
        margenIzquierdo,
        margenSuperior,
        graficaAncho,
        graficaAlto,
        maxEnergia
    );


    // Etiquetas

    dibujarEtiquetasEjeX(
        ctx,
        margenIzquierdo,
        margenSuperior,
        graficaAncho,
        graficaAlto,
        tiempoMax
    );


    dibujarEtiquetasEjeY(
        ctx,
        margenIzquierdo,
        margenSuperior,
        graficaAlto,
        maxEnergia
    );


    // Dibujar las tres energías

    dibujarLinea(
        ctx,
        datosTiempo,
        datosEp,
        margenIzquierdo,
        margenSuperior,
        graficaAncho,
        graficaAlto,
        tiempoMax,
        maxEnergia,
        "#2563eb"
    );


    dibujarLinea(
        ctx,
        datosTiempo,
        datosEc,
        margenIzquierdo,
        margenSuperior,
        graficaAncho,
        graficaAlto,
        tiempoMax,
        maxEnergia,
        "#16a34a"
    );


    dibujarLinea(
        ctx,
        datosTiempo,
        datosEm,
        margenIzquierdo,
        margenSuperior,
        graficaAncho,
        graficaAlto,
        tiempoMax,
        maxEnergia,
        "#f97316"
    );


    // Leyenda

    dibujarLeyenda(
        ctx,
        anchoLogico,
        [
            {
                texto: "Energía potencial",
                color: "#2563eb"
            },
            {
                texto: "Energía cinética",
                color: "#16a34a"
            },
            {
                texto: "Energía mecánica",
                color: "#f97316"
            }
        ]
    );

}


/* =========================================================
   21. GRÁFICA DEL MOVIMIENTO
========================================================= */

function dibujarGraficaMovimiento() {

    const canvas =
        canvasMovimiento;

    const ctx =
        canvas.getContext("2d");


    prepararCanvas(canvas);


    const dpr =
        window.devicePixelRatio || 1;


    const anchoLogico =
        canvas.width / dpr;

    const altoLogico =
        canvas.height / dpr;


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    ctx.clearRect(
        0,
        0,
        anchoLogico,
        altoLogico
    );


    dibujarFondoGrafica(
        ctx,
        anchoLogico,
        altoLogico
    );


    if (datosTiempo.length < 1) {

        dibujarTextoCentro(
            ctx,
            "Inicia la simulación para ver la gráfica",
            anchoLogico,
            altoLogico
        );

        return;

    }


    const margenIzquierdo = 65;

    const margenDerecho = 25;

    const margenSuperior = 35;

    const margenInferior = 50;


    const graficaAncho =
        anchoLogico -
        margenIzquierdo -
        margenDerecho;


    const graficaAlto =
        altoLogico -
        margenSuperior -
        margenInferior;


    const tiempoMax =
        Math.max(
            1,
            datosTiempo[datosTiempo.length - 1]
        );


    const valores =
        [
            ...datosAltura,
            ...datosVelocidad
        ];


    let maxValor =
        Math.max(...valores);


    if (maxValor <= 0) {
        maxValor = 1;
    }


    maxValor *= 1.1;


    // Ejes

    dibujarEjes(
        ctx,
        margenIzquierdo,
        margenSuperior,
        graficaAncho,
        graficaAlto
    );


    dibujarLineasGuia(
        ctx,
        margenIzquierdo,
        margenSuperior,
        graficaAncho,
        graficaAlto,
        maxValor
    );


    dibujarEtiquetasEjeX(
        ctx,
        margenIzquierdo,
        margenSuperior,
        graficaAncho,
        graficaAlto,
        tiempoMax
    );


    dibujarEtiquetasEjeY(
        ctx,
        margenIzquierdo,
        margenSuperior,
        graficaAlto,
        maxValor
    );


    // Altura

    dibujarLinea(
        ctx,
        datosTiempo,
        datosAltura,
        margenIzquierdo,
        margenSuperior,
        graficaAncho,
        graficaAlto,
        tiempoMax,
        maxValor,
        "#2563eb"
    );


    // Velocidad

    dibujarLinea(
        ctx,
        datosTiempo,
        datosVelocidad,
        margenIzquierdo,
        margenSuperior,
        graficaAncho,
        graficaAlto,
        tiempoMax,
        maxValor,
        "#dc2626"
    );


    dibujarLeyenda(
        ctx,
        anchoLogico,
        [
            {
                texto: "Altura",
                color: "#2563eb"
            },
            {
                texto: "Velocidad",
                color: "#dc2626"
            }
        ]
    );

}


/* =========================================================
   22. PREPARAR CANVAS
========================================================= */

function prepararCanvas(canvas) {

    const rect =
        canvas.getBoundingClientRect();


    const dpr =
        window.devicePixelRatio || 1;


    canvas.width =
        Math.max(
            300,
            Math.floor(
                rect.width * dpr
            )
        );


    canvas.height =
        Math.max(
            250,
            Math.floor(
                rect.height * dpr
            )
        );

}


/* =========================================================
   23. FONDO DE GRÁFICA
========================================================= */

function dibujarFondoGrafica(
    ctx,
    ancho,
    alto
) {

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        0,
        0,
        ancho,
        alto
    );

}


/* =========================================================
   24. TEXTO CENTRAL
========================================================= */

function dibujarTextoCentro(
    ctx,
    texto,
    ancho,
    alto
) {

    ctx.fillStyle =
        "#64748b";

    ctx.font =
        "600 15px Segoe UI, Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        texto,
        ancho / 2,
        alto / 2
    );

}


/* =========================================================
   25. EJES
========================================================= */

function dibujarEjes(
    ctx,
    x,
    y,
    ancho,
    alto
) {

    ctx.strokeStyle =
        "#334155";

    ctx.lineWidth = 1.5;


    // Eje Y

    ctx.beginPath();

    ctx.moveTo(
        x,
        y
    );

    ctx.lineTo(
        x,
        y + alto
    );

    ctx.stroke();


    // Eje X

    ctx.beginPath();

    ctx.moveTo(
        x,
        y + alto
    );

    ctx.lineTo(
        x + ancho,
        y + alto
    );

    ctx.stroke();

}


/* =========================================================
   26. LÍNEAS DE GUÍA
========================================================= */

function dibujarLineasGuia(
    ctx,
    x,
    y,
    ancho,
    alto,
    maxValor
) {

    ctx.strokeStyle =
        "#e2e8f0";

    ctx.lineWidth = 1;


    const cantidad =
        5;


    for (
        let i = 0;
        i <= cantidad;
        i++
    ) {

        const posicion =
            y +
            alto -
            (i / cantidad) *
            alto;


        ctx.beginPath();

        ctx.moveTo(
            x,
            posicion
        );

        ctx.lineTo(
            x + ancho,
            posicion
        );

        ctx.stroke();

    }

}


/* =========================================================
   27. ETIQUETAS EJE X
========================================================= */

function dibujarEtiquetasEjeX(
    ctx,
    x,
    y,
    ancho,
    alto,
    maxTiempo
) {

    ctx.fillStyle =
        "#64748b";

    ctx.font =
        "12px Segoe UI, Arial";

    ctx.textAlign =
        "center";


    const cantidad =
        Math.min(
            6,
            Math.max(
                1,
                Math.ceil(maxTiempo)
            )
        );


    for (
        let i = 0;
        i <= cantidad;
        i++
    ) {

        const valor =
            (maxTiempo / cantidad) *
            i;


        const posicionX =
            x +
            (valor / maxTiempo) *
            ancho;


        ctx.fillText(
            `${valor.toFixed(1)} s`,
            posicionX,
            y + alto + 25
        );

    }


    ctx.fillStyle =
        "#334155";

    ctx.font =
        "600 12px Segoe UI, Arial";


    ctx.fillText(
        "Tiempo",
        x + ancho / 2,
        y + alto + 45
    );

}


/* =========================================================
   28. ETIQUETAS EJE Y
========================================================= */

function dibujarEtiquetasEjeY(
    ctx,
    x,
    y,
    alto,
    maxValor
) {

    ctx.fillStyle =
        "#64748b";

    ctx.font =
        "12px Segoe UI, Arial";

    ctx.textAlign =
        "right";

    ctx.textBaseline =
        "middle";


    const cantidad = 5;


    for (
        let i = 0;
        i <= cantidad;
        i++
    ) {

        const valor =
            (maxValor / cantidad) *
            i;


        const posicionY =
            y +
            alto -
            (i / cantidad) *
            alto;


        ctx.fillText(
            valor.toFixed(0),
            x - 10,
            posicionY
        );

    }

}


/* =========================================================
   29. DIBUJAR LÍNEA DE DATOS
========================================================= */

function dibujarLinea(
    ctx,
    tiempos,
    valores,
    x,
    y,
    ancho,
    alto,
    maxTiempo,
    maxValor,
    color
) {

    if (valores.length === 0) {
        return;
    }


    ctx.strokeStyle =
        color;

    ctx.lineWidth = 3;

    ctx.lineJoin =
        "round";

    ctx.lineCap =
        "round";


    ctx.beginPath();


    for (
        let i = 0;
        i < valores.length;
        i++
    ) {

        const posicionX =
            x +
            (tiempos[i] / maxTiempo) *
            ancho;


        const posicionY =
            y +
            alto -
            (valores[i] / maxValor) *
            alto;


        if (i === 0) {

            ctx.moveTo(
                posicionX,
                posicionY
            );

        } else {

            ctx.lineTo(
                posicionX,
                posicionY
            );

        }

    }


    ctx.stroke();


    // Puntos

    ctx.fillStyle =
        color;


    for (
        let i = 0;
        i < valores.length;
        i++
    ) {

        const posicionX =
            x +
            (tiempos[i] / maxTiempo) *
            ancho;


        const posicionY =
            y +
            alto -
            (valores[i] / maxValor) *
            alto;


        ctx.beginPath();

        ctx.arc(
            posicionX,
            posicionY,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

}


/* =========================================================
   30. LEYENDA
========================================================= */

function dibujarLeyenda(
    ctx,
    ancho,
    elementos
) {

    let posicionX = 20;

    const posicionY = 18;


    ctx.font =
        "600 12px Segoe UI, Arial";


    elementos.forEach(
        elemento => {

            // Línea de color

            ctx.strokeStyle =
                elemento.color;

            ctx.lineWidth = 4;

            ctx.beginPath();

            ctx.moveTo(
                posicionX,
                posicionY
            );

            ctx.lineTo(
                posicionX + 25,
                posicionY
            );

            ctx.stroke();


            // Texto

            ctx.fillStyle =
                "#475569";

            ctx.textAlign =
                "left";

            ctx.textBaseline =
                "middle";

            ctx.fillText(
                elemento.texto,
                posicionX + 32,
                posicionY
            );


            posicionX +=
                32 +
                ctx.measureText(
                    elemento.texto
                ).width +
                25;

        }
    );

}


/* =========================================================
   31. EVENTO BOTÓN INICIAR
========================================================= */

btnIniciar.addEventListener(
    "click",
    iniciarSimulacion
);


/* =========================================================
   32. EVENTO BOTÓN PAUSAR
========================================================= */

btnPausar.addEventListener(
    "click",
    pausarSimulacion
);


/* =========================================================
   33. EVENTO BOTÓN REINICIAR
========================================================= */

btnReiniciar.addEventListener(
    "click",
    reiniciarSimulacion
);


/* =========================================================
   34. CAMBIOS EN LOS CAMPOS
========================================================= */

inputMasa.addEventListener(
    "input",
    () => {

        if (!simulando) {

            inicializarSimulador();

        }

    }
);


inputAltura.addEventListener(
    "input",
    () => {

        if (!simulando) {

            inicializarSimulador();

        }

    }
);


inputGravedad.addEventListener(
    "input",
    () => {

        if (!simulando) {

            inicializarSimulador();

        }

    }
);


inputFriccion.addEventListener(
    "input",
    () => {

        if (!simulando) {

            inicializarSimulador();

        }

    }
);


/* =========================================================
   35. REDIBUJAR AL CAMBIAR TAMAÑO
========================================================= */

window.addEventListener(
    "resize",
    () => {

        dibujarGraficaEnergia();

        dibujarGraficaMovimiento();

        moverObjeto();

    }
);


/* =========================================================
   36. INICIALIZACIÓN AL ABRIR LA PÁGINA
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        inicializarSimulador();

    }
);