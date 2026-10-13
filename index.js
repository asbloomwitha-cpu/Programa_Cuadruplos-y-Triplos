// Este programa convierte una expresión en tablas de triplos y cuádruplos.

// Separa números, nombres de variables y símbolos de la expresión.
function separar(expresion) {
  var tokens = [];
  var posicion = 0;

  while (posicion < expresion.length) {
    var caracter = expresion[posicion];

    if (caracter === ' ' || caracter === '\t' || caracter === '\n') {
      posicion++;
    } else if (esDigito(caracter)) {
      var numero = '';
      var puntos = 0;

      while (posicion < expresion.length &&
        (esDigito(expresion[posicion]) || expresion[posicion] === '.')) {
        if (expresion[posicion] === '.') {
          puntos++;
        }
        numero += expresion[posicion];
        posicion++;
      }

      if (puntos > 1 || numero.charAt(numero.length - 1) === '.') {
        throw new Error('Revisa el número "' + numero + '".');
      }

      tokens.push(numero);
    } else if (esLetra(caracter) || caracter === '_') {
      var nombre = '';

      while (posicion < expresion.length &&
        (esLetra(expresion[posicion]) || esDigito(expresion[posicion]) ||
          expresion[posicion] === '_')) {
        nombre += expresion[posicion];
        posicion++;
      }

      tokens.push(nombre);
    } else if ('+-*/()='.indexOf(caracter) !== -1) {
      tokens.push(caracter);
      posicion++;
    } else {
      throw new Error('El símbolo "' + caracter + '" no está permitido.');
    }
  }

  return tokens;
}

// Reconoce los números que se pueden usar en la expresión.
function esDigito(caracter) {
  return caracter >= '0' && caracter <= '9';
}

// Reconoce las letras que pueden iniciar el nombre de una variable.
function esLetra(caracter) {
  return (caracter >= 'a' && caracter <= 'z') ||
    (caracter >= 'A' && caracter <= 'Z');
}

// Un operando puede ser un número o el nombre de una variable.
function esOperando(token) {
  return esDigito(token.charAt(0)) ||
    esLetra(token.charAt(0)) ||
    token.charAt(0) === '_';
}

function prioridad(operador) {
  if (operador === '*' || operador === '/') {
    return 2;
  }
  return 1;
}

// Convierte la expresión a postfija usando una pila de operadores.
function convertirAPostfija(tokens) {
  var destino = '';
  var inicio = 0;
  var vecesIgual = 0;
  var postfija = [];
  var pila = [];
  var esperaOperando = true;
  var parentesisAbiertos = 0;

  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i] === '=') {
      vecesIgual++;
    }
  }

  if (vecesIgual > 0) {
    if (vecesIgual !== 1 || tokens.length < 3 || tokens[1] !== '=') {
      throw new Error('Escribe la asignación como variable = expresión.');
    }
    if (!esOperando(tokens[0]) || esDigito(tokens[0].charAt(0))) {
      throw new Error('Antes del signo = escribe el nombre de una variable.');
    }

    destino = tokens[0];
    inicio = 2;
  }

  if (inicio >= tokens.length) {
    throw new Error('Escribe una operación después del signo =.');
  }

  for (var j = inicio; j < tokens.length; j++) {
    var token = tokens[j];

    if (esOperando(token)) {
      if (!esperaOperando) {
        throw new Error('Falta un operador antes de "' + token + '".');
      }
      postfija.push(token);
      esperaOperando = false;
    } else if (token === '(') {
      if (!esperaOperando) {
        throw new Error('Falta un operador antes del paréntesis.');
      }
      pila.push(token);
      parentesisAbiertos++;
    } else if (token === ')') {
      if (esperaOperando || parentesisAbiertos === 0) {
        throw new Error('Revisa los paréntesis de la expresión.');
      }

      while (pila.length > 0 && pila[pila.length - 1] !== '(') {
        postfija.push(pila.pop());
      }

      pila.pop();
      parentesisAbiertos--;
      esperaOperando = false;
    } else {
      if (esperaOperando) {
        throw new Error('Falta un valor antes del operador "' + token + '".');
      }

      while (pila.length > 0 && pila[pila.length - 1] !== '(' &&
        prioridad(pila[pila.length - 1]) >= prioridad(token)) {
        postfija.push(pila.pop());
      }

      pila.push(token);
      esperaOperando = true;
    }
  }

  if (esperaOperando) {
    throw new Error('La expresión termina con un operador.');
  }

  if (parentesisAbiertos > 0) {
    throw new Error('Falta cerrar un paréntesis.');
  }

  while (pila.length > 0) {
    postfija.push(pila.pop());
  }

  return {
    destino: destino,
    postfija: postfija
  };
}

// Arma el árbol a partir de la notación postfija.
function crearArbol(postfija) {
  var pila = [];

  for (var i = 0; i < postfija.length; i++) {
    var token = postfija[i];

    if (esOperando(token)) {
      pila.push({
        valor: token,
        izquierda: null,
        derecha: null
      });
    } else {
      if (pila.length < 2) {
        throw new Error('No hay suficientes valores para el operador "' + token + '".');
      }

      var derecha = pila.pop();
      var izquierda = pila.pop();

      pila.push({
        valor: token,
        izquierda: izquierda,
        derecha: derecha
      });
    }
  }

  if (pila.length !== 1) {
    throw new Error('La expresión no está completa.');
  }

  return pila[0];
}

// Genera las filas de las tablas siguiendo el orden del árbol.
function crearTablas(nodo, tablas) {
  if (nodo.izquierda === null) {
    return {
      cuadruplo: nodo.valor,
      triplo: nodo.valor
    };
  }

  var izquierda = crearTablas(nodo.izquierda, tablas);
  var derecha = crearTablas(nodo.derecha, tablas);
  var temporal = 'T' + (tablas.cuadruplos.length + 1);
  var posicion = tablas.triplos.length;

  tablas.cuadruplos.push({
    operador: nodo.valor,
    valor1: izquierda.cuadruplo,
    valor2: derecha.cuadruplo,
    resultado: temporal
  });

  tablas.triplos.push({
    posicion: '(' + posicion + ')',
    operador: nodo.valor,
    valor1: izquierda.triplo,
    valor2: derecha.triplo
  });

  return {
    cuadruplo: temporal,
    triplo: '(' + posicion + ')'
  };
}

function mostrarAlerta(mensaje, tipo) {
  var alerta = document.getElementById('alerta');
  alerta.className = 'alert alert-' + tipo;
  alerta.textContent = mensaje;
  alerta.style.display = 'block';
}

function ocultarAlerta() {
  var alerta = document.getElementById('alerta');
  alerta.style.display = 'none';
  alerta.textContent = '';
}

function borrarResultados() {
  document.querySelector('#tablaCuadruplos tbody').innerHTML = '';
  document.querySelector('#tablaTriplos tbody').innerHTML = '';
  document.getElementById('areaResultados').style.display = 'none';
}

function calcular() {
  ocultarAlerta();
  borrarResultados();

  var campo = document.getElementById('inputExpresion');
  var expresion = campo.value.trim();

  if (expresion === '') {
    mostrarAlerta('Escribe una expresión antes de calcular.', 'error');
    campo.focus();
    return;
  }

  try {
    var tokens = separar(expresion);
    var datos = convertirAPostfija(tokens);
    var arbol = crearArbol(datos.postfija);
    var tablas = {
      cuadruplos: [],
      triplos: []
    };
    var resultadoArbol = crearTablas(arbol, tablas);

    if (datos.destino !== '') {
      tablas.cuadruplos.push({
        operador: '=',
        valor1: resultadoArbol.cuadruplo,
        valor2: '-',
        resultado: datos.destino
      });
      tablas.triplos.push({
        posicion: '(' + tablas.triplos.length + ')',
        operador: '=',
        valor1: datos.destino,
        valor2: resultadoArbol.triplo
      });
    }

    var filasCuadruplos = '';
    for (var fila = 0; fila < tablas.cuadruplos.length; fila++) {
      var cuadruplo = tablas.cuadruplos[fila];
      filasCuadruplos += '<tr><td>' + fila + '</td><td>' +
        cuadruplo.operador + '</td><td>' + cuadruplo.valor1 +
        '</td><td>' + cuadruplo.valor2 + '</td><td>' +
        cuadruplo.resultado + '</td></tr>';
    }
    document.querySelector('#tablaCuadruplos tbody').innerHTML = filasCuadruplos;

    var filasTriplos = '';
    for (var filaTriplo = 0; filaTriplo < tablas.triplos.length; filaTriplo++) {
      var triplo = tablas.triplos[filaTriplo];
      filasTriplos += '<tr><td>' + triplo.posicion + '</td><td>' +
        triplo.operador + '</td><td>' + triplo.valor1 +
        '</td><td>' + triplo.valor2 + '</td></tr>';
    }
    document.querySelector('#tablaTriplos tbody').innerHTML = filasTriplos;

    document.getElementById('areaResultados').style.display = 'block';
    ocultarAlerta();
  } catch (error) {
    mostrarAlerta(error.message, 'error');
  }
}

function limpiar() {
  document.getElementById('inputExpresion').value = '';
  borrarResultados();
  ocultarAlerta();
  document.getElementById('inputExpresion').focus();
}

function cargarEjemplo(expresion) {
  document.getElementById('inputExpresion').value = expresion;
  calcular();
}

// Al cargar la página, permite calcular con Enter y muestra el ejemplo inicial.
document.addEventListener('DOMContentLoaded', function () {
  var campo = document.getElementById('inputExpresion');

  campo.addEventListener('keyup', function (evento) {
    if (evento.key === 'Enter') {
      calcular();
    }
  });

  calcular();
});
