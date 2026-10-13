// ==============================================================================
// MATERIA: Compiladores / Lenguajes y Autómatas
// ARCHIVO: app.js (Código ECMAScript moderno pero básico para estudiantes)
// PROPÓSITO:
//   1. Capturar la expresión matemática ingresada por el usuario.
//   2. Validar la sintaxis y emitir alertas si está vacía o es incorrecta.
//   3. Generar la tabla de Cuádruplos (4 columnas: op, arg1, arg2, resultado).
//   4. Generar la tabla de Triplos (3 columnas: op, arg1, arg2 con punteros).
//   5. Calcular el resultado numérico de la operación si contiene números.
//   6. Ofrecer funcionalidad para limpiar datos.
// ==============================================================================

// ------------------------------------------------------------------------------
// FUNCIÓN 1: SEPARADOR DE TOKENS (LEXER BÁSICO DE ESTUDIANTE)
// ------------------------------------------------------------------------------
// Recibe una cadena de texto (ej. "x = 4 + 5 * 2") y la separa en partes básicas
function separarTokens(expresion) {
  let exp = expresion;

  // Lista de símbolos permitidos para reconocer en la expresión
  const operadores = ['=', '+', '-', '*', '/', '(', ')'];

  // Agregamos espacios antes y después de cada operador para separarlos con facilidad
  for (const op of operadores) {
    exp = exp.split(op).join(` ${op} `);
  }

  // Dividimos la cadena por los espacios en blanco y filtramos elementos vacíos
  const tokens = exp.trim().split(/\s+/).filter(item => item.length > 0);
  return tokens;
}

// ------------------------------------------------------------------------------
// FUNCIÓN 2: GENERADOR DE TRIPLOS Y CUÁDRUPLOS
// ------------------------------------------------------------------------------
// Aplica el criterio clásico de compiladores:
// - Nivel 1: Multiplicación (*) y División (/)
// - Nivel 2: Suma (+) y Resta (-)
function generarCodigoIntermedio(tokens) {
  let variableDestino = null;
  let tokensExpr = [];

  // Verificamos si la expresión incluye una asignación con '=' (ej. "a = 2 + 3")
  if (tokens.length >= 2 && tokens[1] === '=') {
    variableDestino = tokens[0];       // Guardamos la variable destino (ej. 'a')
    tokensExpr = tokens.slice(2);      // Tomamos todo lo que está después del '='
  } else {
    tokensExpr = [...tokens];          // Si no tiene '=', procesamos todo directo
  }

  // Arreglos donde iremos guardando cada renglón generado
  const cuadruplos = [];
  const triplos = [];

  // Copias de la lista de tokens para irlas reduciendo elemento por elemento:
  // - listaCuad: guarda los valores reales y variables temporales (T1, T2...)
  // - listaTrip: guarda las referencias/punteros a los renglones ((0), (1)...)
  let listaCuad = [...tokensExpr];
  let listaTrip = [...tokensExpr];

  let contadorTemp = 1; // Contador para las variables temporales: T1, T2, T3...

  // Grupos según la precedencia matemática estándar
  const nivelesOperadores = [
    ['*', '/'], // Prioridad alta
    ['+', '-']  // Prioridad baja
  ];

  // Recorremos primero las operaciones de mayor prioridad y luego las menores
  for (const nivel of nivelesOperadores) {
    let i = 0;

    while (i < listaCuad.length) {
      const op = listaCuad[i]; // Operador actual que estamos evaluando

      // Si el operador pertenece al nivel actual que estamos resolviendo
      if (nivel.includes(op)) {
        // Obtenemos los operandos izquierdo y derecho para CUÁDRUPLOS
        const arg1C = listaCuad[i - 1];
        const arg2C = listaCuad[i + 1];

        // Obtenemos los operandos izquierdo y derecho para TRIPLOS
        const arg1T = listaTrip[i - 1];
        const arg2T = listaTrip[i + 1];

        // Si falta algún operando a los lados, se interrumpe por error de sintaxis
        if (arg1C === undefined || arg2C === undefined) {
          throw new Error(`Sintaxis inválida cerca del operador '${op}'`);
        }

        // --- CREAR CUÁDRUPLO ---
        // Estructura: (operador, argumento1, argumento2, resultadoTemporal)
        const temporal = `T${contadorTemp}`;
        cuadruplos.push({
          op: op,
          arg1: arg1C,
          arg2: arg2C,
          resultado: temporal
        });

        // --- CREAR TRIPLO ---
        // Estructura: (índice, operador, argumento1, argumento2)
        // En los triplos NO hay columna de resultado; se referencia con su índice (0), (1)...
        const indiceTriplo = triplos.length;
        triplos.push({
          indice: `(${indiceTriplo})`,
          op: op,
          arg1: arg1T,
          arg2: arg2T
        });

        // REDUCCIÓN: Reemplazamos los 3 tokens [arg1, op, arg2] por su nuevo valor
        listaCuad.splice(i - 1, 3, temporal);
        listaTrip.splice(i - 1, 3, `(${indiceTriplo})`);

        contadorTemp++; // Incrementamos para el siguiente temporal (T2, T3...)
        i = 0;          // Reiniciamos para buscar más operadores en orden de izquierda a derecha
      } else {
        i++; // Avanzamos al siguiente elemento
      }
    }
  }

  // Si había una asignación inicial (ej. "a = ...")
  if (variableDestino !== null) {
    const ultimoResultadoCuad = listaCuad[0];
    const ultimoResultadoTrip = listaTrip[0];

    // Cuádruplo de asignación final: op '=', arg1 es el resultado, arg2 vacío '-', resultado en la variable
    cuadruplos.push({
      op: '=',
      arg1: ultimoResultadoCuad,
      arg2: '-',
      resultado: variableDestino
    });

    // Triplo de asignación final: op '=', arg1 es la variable, arg2 es la referencia al último renglón
    const indiceTriplo = triplos.length;
    triplos.push({
      indice: `(${indiceTriplo})`,
      op: '=',
      arg1: variableDestino,
      arg2: ultimoResultadoTrip
    });
  }

  return { cuadruplos, triplos, variableDestino };
}

// ------------------------------------------------------------------------------
// FUNCIÓN 3: CALCULAR EL RESULTADO MATEMÁTICO REAL (NUMÉRICO)
// ------------------------------------------------------------------------------
// Evalúa la expresión para mostrar el valor numérico final en pantalla
function calcularResultadoNumerico(expresion) {
  try {
    // Si la expresión tiene un "=", tomamos solo la parte derecha para calcular el número
    let exprMatematica = expresion;
    if (expresion.includes('=')) {
      exprMatematica = expresion.split('=')[1];
    }

    // Limpiamos espacios
    exprMatematica = exprMatematica.trim();

    // Verificamos si contiene únicamente caracteres seguros (números, operadores, espacios y paréntesis)
    const esSoloNumerica = /^[0-9+\-*/().\s]+$/.test(exprMatematica);

    if (esSoloNumerica) {
      // Uso de Function para evaluación matemática segura en el navegador
      const valor = Function(`'use strict'; return (${exprMatematica})`)();
      return valor;
    } else {
      // Si contiene variables algebraicas (como a, b, c), mostramos que es simbólica
      return 'Expresión simbólica (contiene variables)';
    }
  } catch (error) {
    return 'No se pudo calcular el valor numérico';
  }
}

// ------------------------------------------------------------------------------
// FUNCIÓN 4: CONTROL DE ALERTAS VISUALES
// ------------------------------------------------------------------------------
function mostrarAlerta(mensaje, tipo = 'error') {
  const alerta = document.getElementById('alerta');
  alerta.className = `alert alert-${tipo}`;
  alerta.textContent = mensaje;
  alerta.style.display = 'block';
}

function ocultarAlerta() {
  const alerta = document.getElementById('alerta');
  alerta.style.display = 'none';
  alerta.textContent = '';
}

// ------------------------------------------------------------------------------
// FUNCIÓN 5: PROCESAR Y CALCULAR (DISPARADA POR EL BOTÓN CALCULAR)
// ------------------------------------------------------------------------------
function calcular() {
  ocultarAlerta();

  const inputExp = document.getElementById('inputExpresion');
  const valorExp = inputExp.value.trim();

  // Validación 1: Verificar si el input está vacío
  if (!valorExp) {
    mostrarAlerta('Por favor, ingresa una expresión matemática antes de calcular.', 'error');
    inputExp.focus();
    return;
  }

  try {
    // Separamos los tokens
    const tokens = separarTokens(valorExp);

    if (tokens.length === 0) {
      mostrarAlerta('No se encontraron tokens válidos en la expresión.', 'error');
      return;
    }

    // Generamos los cuádruplos y triplos
    const { cuadruplos, triplos, variableDestino } = generarCodigoIntermedio(tokens);

    if (cuadruplos.length === 0 && triplos.length === 0) {
      mostrarAlerta('No se identificaron operaciones matemáticas para procesar.', 'error');
      return;
    }

    // 1. Renderizar Cuádruplos
    const tbodyCuad = document.querySelector('#tablaCuadruplos tbody');
    tbodyCuad.innerHTML = '';
    cuadruplos.forEach((c, index) => {
      tbodyCuad.innerHTML += `
        <tr>
          <td><strong>${index}</strong></td>
          <td><span class="badge-op">${c.op}</span></td>
          <td>${c.arg1}</td>
          <td>${c.arg2}</td>
          <td><span class="badge-temp">${c.resultado}</span></td>
        </tr>
      `;
    });

    // 2. Renderizar Triplos
    const tbodyTrip = document.querySelector('#tablaTriplos tbody');
    tbodyTrip.innerHTML = '';
    triplos.forEach((t) => {
      tbodyTrip.innerHTML += `
        <tr>
          <td><span class="badge-pointer">${t.indice}</span></td>
          <td><span class="badge-op">${t.op}</span></td>
          <td>${t.arg1}</td>
          <td>${t.arg2}</td>
        </tr>
      `;
    });

    // 3. Calcular y mostrar el resultado
    const resultadoCalculado = calcularResultadoNumerico(valorExp);
    const boxResultado = document.getElementById('boxResultado');
    const textoResultado = document.getElementById('textoResultado');

    if (variableDestino) {
      textoResultado.textContent = `${variableDestino} = ${resultadoCalculado}`;
    } else {
      textoResultado.textContent = `Resultado = ${resultadoCalculado}`;
    }

    // Mostrar el contenedor de resultados
    document.getElementById('areaResultados').style.display = 'block';
    mostrarAlerta('¡Procedimiento generado exitosamente!', 'success');

  } catch (error) {
    mostrarAlerta('Error al procesar la expresión: ' + error.message, 'error');
  }
}

// ------------------------------------------------------------------------------
// FUNCIÓN 6: LIMPIAR FORMULARIO Y RESULTADOS (BOTÓN LIMPIAR)
// ------------------------------------------------------------------------------
function limpiar() {
  document.getElementById('inputExpresion').value = '';
  document.querySelector('#tablaCuadruplos tbody').innerHTML = '';
  document.querySelector('#tablaTriplos tbody').innerHTML = '';
  document.getElementById('textoResultado').textContent = '--';
  document.getElementById('areaResultados').style.display = 'none';
  ocultarAlerta();
  document.getElementById('inputExpresion').focus();
}

// ------------------------------------------------------------------------------
// FUNCIÓN 7: CARGAR EJEMPLO RÁPIDO
// ------------------------------------------------------------------------------
function cargarEjemplo(expresion) {
  document.getElementById('inputExpresion').value = expresion;
  calcular();
}

// ------------------------------------------------------------------------------
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Permitir presionar "Enter" en el input para calcular directamente
  const input = document.getElementById('inputExpresion');
  input.addEventListener('keyup', (evento) => {
    if (evento.key === 'Enter') {
      calcular();
    }
  });

  // Ejecución inicial con el ejemplo predeterminado
  calcular();
});
