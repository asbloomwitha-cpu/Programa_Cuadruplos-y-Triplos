// ==============================================================================
// MATERIA: Compiladores / Lenguajes y Autómatas
// TEMA: Generación de Código Intermedio (Triplos y Cuádruplos)
// OBJETIVO: Tomar una expresión matemática sencilla y convertirla a:
//   1. Cuádruplos: Tabla de 4 columnas (operador, arg1, arg2, resultado)
//   2. Triplos: Tabla de 3 columnas (operador, arg1, arg2) usando punteros (0), (1)...
// ==============================================================================

const readline = require('readline'); // Librería estándar de Node.js para leer datos del teclado

/**
 * PASO 1: SEPARACIÓN DE TOKENS (LEXER BÁSICO)
 * Toma el texto ingresado por el usuario y lo divide en elementos individuales.
 * Ejemplo: "a = b + c * d" -> ["a", "=", "b", "+", "c", "*", "d"]
 */
function separarTokens(expresion) {
    let exp = expresion;

    // Lista de símbolos y operadores a reconocer
    const operadores = ['=', '+', '-', '*', '/', '(', ')'];

    // Ponemos espacios antes y después de cada operador para separarlos fácilmente
    for (const op of operadores) {
        exp = exp.split(op).join(` ${op} `);
    }

    // Dividimos por espacios en blanco y eliminamos espacios vacíos
    return exp.trim().split(/\s+/);
}

/**
 * PASO 2: GENERACIÓN DE CÓDIGO INTERMEDIO
 * Evalúa los operadores según su jerarquía (precedencia) matemática:
 * Primero: Multiplicación (*) y División (/)
 * Segundo: Suma (+) y Resta (-)
 */
function generarCodigoIntermedio(tokens) {
    let variableDestino = null;
    let tokensExpr = [];

    // Verificamos si la expresión incluye una asignación inicial (ejemplo: "x = ...")
    if (tokens.length >= 2 && tokens[1] === '=') {
        variableDestino = tokens[0];       // Guardamos la variable donde se guardará el resultado final (ej. 'x')
        tokensExpr = tokens.slice(2);      // Guardamos únicamente la parte matemática después del '='
    } else {
        tokensExpr = [...tokens];          // Si no tiene '=', procesamos toda la expresión tal cual
    }

    // Arreglos donde iremos guardando cada fila de las tablas
    const cuadruplos = [];
    const triplos = [];

    // Creamos dos copias de la expresión para irlas reduciendo paso a paso:
    // - listaCuad: guarda los nombres reales y las variables temporales (T1, T2, etc.)
    // - listaTrip: guarda las referencias/punteros a las posiciones del triplo ((0), (1), etc.)
    let listaCuad = [...tokensExpr];
    let listaTrip = [...tokensExpr];

    let contadorTemp = 1; // Contador para nombrar los temporales: T1, T2, T3...

    // Definición de niveles de precedencia de operadores (de mayor a menor importancia)
    const gruposOperadores = [
        ['*', '/'], // Nivel 1: Se calculan primero
        ['+', '-']  // Nivel 2: Se calculan después
    ];

    // Recorremos nivel por nivel de operadores
    for (const grupo of gruposOperadores) {
        let i = 0;

        while (i < listaCuad.length) {
            const op = listaCuad[i]; // Operador actual que estamos revisando

            // Si el token actual coincide con un operador del nivel que toca resolver:
            if (grupo.includes(op)) {
                // Obtenemos los argumentos a la izquierda y derecha para CUÁDRUPLOS
                const arg1C = listaCuad[i - 1]; // Operando izquierdo (ej. 'c')
                const arg2C = listaCuad[i + 1]; // Operando derecho (ej. 'd')

                // Obtenemos los argumentos a la izquierda y derecha para TRIPLOS
                const arg1T = listaTrip[i - 1];
                const arg2T = listaTrip[i + 1];

                // -------------------------------------------------------------
                // 1. CREACIÓN DEL CUÁDRUPLO
                // Estructura: (operador, argumento1, argumento2, resultado)
                // -------------------------------------------------------------
                const nombreTemporal = `T${contadorTemp}`;
                cuadruplos.push({
                    op: op,
                    arg1: arg1C,
                    arg2: arg2C,
                    resultado: nombreTemporal
                });

                // -------------------------------------------------------------
                // 2. CREACIÓN DEL TRIPLO
                // Estructura: (índice, operador, argumento1, argumento2)
                // En el triplo no existe columna de resultado; se referencia por su índice.
                // -------------------------------------------------------------
                const indiceTriplo = triplos.length; // Posición actual en la tabla: 0, 1, 2...
                triplos.push({
                    indice: `(${indiceTriplo})`,
                    op: op,
                    arg1: arg1T,
                    arg2: arg2T
                });

                // REDUCCIÓN DE LA EXPRESIÓN:
                // Sustituimos los 3 elementos evaluados [arg1, op, arg2] por su resultado
                // En cuádruplos se sustituye por el temporal (ej. 'T1')
                listaCuad.splice(i - 1, 3, nombreTemporal);

                // En triplos se sustituye por la referencia al renglón (ej. '(0)')
                listaTrip.splice(i - 1, 3, `(${indiceTriplo})`);

                contadorTemp++; // Incrementamos el contador para el siguiente temporal (T2, T3...)
                i = 0;          // Reiniciamos el índice para volver a buscar operadores desde el inicio
            } else {
                i++; // Si no coincide, avanzamos al siguiente elemento
            }
        }
    }

    // PASO FINAL: Si había una asignación inicial (ej: "a = ...")
    if (variableDestino !== null) {
        const resultadoFinalCuad = listaCuad[0]; // Último temporal generado
        const resultadoFinalTrip = listaTrip[0]; // Último índice de triplo generado

        // Cuádruplo de asignación final: operador '=', arg1, sin arg2 ('-'), resultado en la variable destino
        cuadruplos.push({
            op: '=',
            arg1: resultadoFinalCuad,
            arg2: '-',
            resultado: variableDestino
        });

        // Triplo de asignación final: operador '=', arg1 es la variable destino, arg2 es la referencia al último triplo
        const indiceTriplo = triplos.length;
        triplos.push({
            indice: `(${indiceTriplo})`,
            op: '=',
            arg1: variableDestino,
            arg2: resultadoFinalTrip
        });
    }

    return { cuadruplos, triplos };
}

/**
 * PASO 3: FUNCIÓN PARA MOSTRAR LAS TABLAS EN PANTALLA
 */
function imprimirTablas(cuadruplos, triplos) {
    console.log('\n' + '='.repeat(55));
    console.log('       TABLA DE CUÁDRUPLOS (CÓDIGO DE 3 DIRECCIONES)');
    console.log('='.repeat(55));
    console.table(cuadruplos);

    console.log('\n' + '='.repeat(55));
    console.log('       TABLA DE TRIPLOS (CON PUNTEROS / REFERENCIAS)');
    console.log('='.repeat(55));
    console.table(triplos);
}

// ------------------------------------------------------------------------------
// PROGRAMA PRINCIPAL: INTERACCIÓN CON EL USUARIO
// ------------------------------------------------------------------------------
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('========================================================');
console.log(' GENERADOR DE TRIPLOS Y CUÁDRUPLOS (VERSIÓN ESTUDIANTE) ');
console.log('========================================================');
console.log('Ejemplos que puedes probar:');
console.log('  1) a = b + c * d');
console.log('  2) x = a * b + c * d');
console.log('  3) res = num1 + num2 - num3\n');

rl.question("Ingresa tu expresión (o presiona ENTER para usar 'a = b + c * d'): ", (entrada) => {
    let exp = entrada.trim();

    // Si el usuario no escribe nada, usamos el ejemplo clásico por defecto
    if (!exp) {
        exp = 'a = b + c * d';
    }

    console.log(`\n>> Expresión a evaluar: ${exp}`);

    // Ejecutamos el análisis
    const tokens = separarTokens(exp);
    const { cuadruplos, triplos } = generarCodigoIntermedio(tokens);

    // Mostramos las tablas resultantes
    imprimirTablas(cuadruplos, triplos);

    rl.close(); // Cerramos la lectura por consola
});
