// Esta versión trabaja en la consola y usa el mismo ejemplo que la página.
var readline = require('readline');

// Separa la expresión en valores, nombres y operadores.
function separar(expresion) {
  var tokens = expresion.match(/[A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d+)?|[()+\-*/=]/g);

  if (tokens === null || tokens.join('').length !== expresion.replace(/\s/g, '').length) {
    throw new Error('La expresión tiene un símbolo que no se puede usar.');
  }

  return tokens;
}

// Dice si el token es un número o el nombre de una variable.
function esValor(token) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(token) ||
    /^\d+(\.\d+)?$/.test(token);
}

// Convierte la expresión a postfija, respetando paréntesis y prioridades.
function convertirAPostfija(tokens) {
  var destino = '';
  var inicio = 0;
  var vecesIgual = 0;
  var postfija = [];
  var pila = [];
  var esperaValor = true;

  for (var j = 0; j < tokens.length; j++) {
    if (tokens[j] === '=') {
      vecesIgual++;
    }
  }

  if (vecesIgual > 1 || (vecesIgual === 1 && tokens[1] !== '=')) {
    throw new Error('Escribe la asignación como variable = expresión.');
  }

  if (tokens.length > 1 && tokens[1] === '=') {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(tokens[0])) {
      throw new Error('Antes del signo = escribe el nombre de una variable.');
    }
    destino = tokens[0];
    inicio = 2;
  }

  if (inicio >= tokens.length) {
    throw new Error('Escribe una expresión para procesar.');
  }

  for (var i = inicio; i < tokens.length; i++) {
    var token = tokens[i];

    if (esValor(token)) {
      if (!esperaValor) {
        throw new Error('Falta un operador antes de "' + token + '".');
      }
      postfija.push(token);
      esperaValor = false;
    } else if (token === '(') {
      if (!esperaValor) {
        throw new Error('Falta un operador antes del paréntesis.');
      }
      pila.push(token);
    } else if (token === ')') {
      if (esperaValor) {
        throw new Error('Revisa los paréntesis de la expresión.');
      }
      while (pila.length > 0 && pila[pila.length - 1] !== '(') {
        postfija.push(pila.pop());
      }
      if (pila.length === 0) {
        throw new Error('Falta abrir un paréntesis.');
      }
      pila.pop();
    } else {
      if (esperaValor) {
        throw new Error('Falta un valor antes del operador "' + token + '".');
      }

      while (pila.length > 0 && pila[pila.length - 1] !== '(' &&
        prioridad(pila[pila.length - 1]) >= prioridad(token)) {
        postfija.push(pila.pop());
      }
      pila.push(token);
      esperaValor = true;
    }
  }

  if (esperaValor) {
    throw new Error('La expresión termina con un operador.');
  }

  while (pila.length > 0) {
    var operador = pila.pop();
    if (operador === '(') {
      throw new Error('Falta cerrar un paréntesis.');
    }
    postfija.push(operador);
  }

  return {
    destino: destino,
    postfija: postfija
  };
}

// La multiplicación y la división se resuelven antes que la suma y la resta.
function prioridad(operador) {
  if (operador === '*' || operador === '/') {
    return 2;
  }
  return 1;
}

// Crea el árbol que permite generar las dos tablas en el orden correcto.
function crearArbol(postfija) {
  var pila = [];

  for (var i = 0; i < postfija.length; i++) {
    var token = postfija[i];

    if (esValor(token)) {
      pila.push({
        valor: token,
        izquierda: null,
        derecha: null
      });
    } else {
      if (pila.length < 2) {
        throw new Error('Faltan valores para el operador "' + token + '".');
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

// Agrega primero las operaciones internas y después las que las usan.
function crearTablas(arbol, tablas) {
  if (arbol.izquierda === null) {
    return {
      cuadruplo: arbol.valor,
      triplo: arbol.valor
    };
  }

  var izquierda = crearTablas(arbol.izquierda, tablas);
  var derecha = crearTablas(arbol.derecha, tablas);
  var temporal = 'T' + (tablas.cuadruplos.length + 1);
  var posicion = tablas.triplos.length;

  tablas.cuadruplos.push({
    operador: arbol.valor,
    valor1: izquierda.cuadruplo,
    valor2: derecha.cuadruplo,
    resultado: temporal
  });
  tablas.triplos.push({
    posicion: '(' + posicion + ')',
    operador: arbol.valor,
    valor1: izquierda.triplo,
    valor2: derecha.triplo
  });

  return {
    cuadruplo: temporal,
    triplo: '(' + posicion + ')'
  };
}

// Pide una expresión, la procesa y muestra el código intermedio.
var entrada = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Práctica de triplos y cuádruplos');
console.log('Ejemplo: a = b + c * d');

entrada.question('Escribe una expresión: ', function (texto) {
  try {
    var datos = convertirAPostfija(separar(texto.trim()));
    var arbol = crearArbol(datos.postfija);
    var tablas = {
      cuadruplos: [],
      triplos: []
    };
    var resultado = crearTablas(arbol, tablas);

    if (datos.destino !== '') {
      tablas.cuadruplos.push({
        operador: '=',
        valor1: resultado.cuadruplo,
        valor2: '-',
        resultado: datos.destino
      });
      tablas.triplos.push({
        posicion: '(' + tablas.triplos.length + ')',
        operador: '=',
        valor1: datos.destino,
        valor2: resultado.triplo
      });
    }

    console.log('\nCuádruplos:');
    console.table(tablas.cuadruplos);
    console.log('Triplos:');
    console.table(tablas.triplos);
  } catch (error) {
    console.log('No se pudo procesar la expresión: ' + error.message);
  }

  entrada.close();
});
