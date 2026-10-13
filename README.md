# Documentación del Proyecto: Generador de Cuádruplos y Triplos

**Materia:** Lenguajes y Autómatas / Compiladores  
**Tecnologías:** HTML5, CSS3, JavaScript (ECMAScript)  
**Nivel de desarrollo:** Estudiante (código modular, limpio, didáctico y comentado línea por línea)  

---

## 1. Descripción del Proyecto

Este proyecto consiste en una aplicación web interactiva que recibe una expresión matemática o algebraica ingresada por el usuario (por ejemplo: `a = 5 + 3 * 2` o `x = a * b + c * d`) y realiza las siguientes acciones:

1. **Análisis de la expresión:** Separa y categoriza los tokens (operadores, operandos y variables).
2. **Generación de Cuádruplos:** Representa el código de 3 direcciones mediante tuplas de 4 campos `(Operador, Argumento 1, Argumento 2, Resultado)`.
3. **Generación de Triplos:** Representa el código intermedio mediante tuplas de 3 campos `(Operador, Argumento 1, Argumento 2)`, sustituyendo los temporales por apuntadores o índices a renglones anteriores `(0), (1), (2)...`.
4. **Cálculo del resultado:** Si la expresión contiene valores numéricos, calcula el valor real aplicando la precedencia matemática; si contiene variables simbólicas, indica que es una expresión algebraica.
5. **Interfaz de usuario:** Contiene campo de captura, botón calcular, botón limpiar, sistema de alertas visuales y tablas responsivas.

---

## 2. Árbol de Directorios del Proyecto

El proyecto mantiene una estructura modular, separando estructura (HTML), presentación (CSS) y lógica (JS):

```text
Triplos y cuadruplos/
├── index.html              # Estructura semántica de la página web
├── main.css                # Estilos visuales, diseño responsivo, tablas y alertas
├── app.js                  # Lógica en ECMAScript (tokens, cuádruplos, triplos, cálculo)
├── triplos_y_cuadruplos.js # Versión alternativa ejecutable por consola en Node.js
└── README.md               # Documentación completa del proyecto y guía de despliegue
```

---

## 3. Funcionamiento del Algoritmo (Código Intermedio)

### Precedencia de Operadores
El algoritmo sigue la jerarquía clásica de compiladores:
1. **Prioridad 1:** Multiplicación (`*`) y División (`/`).
2. **Prioridad 2:** Suma (`+`) y Resta (`-`).
3. **Prioridad 3:** Asignación final (`=`).

### Diferencia entre Cuádruplos y Triplos

| Característica | Cuádruplo | Triplo |
|---|---|---|
| **Número de campos** | 4 campos: `(op, arg1, arg2, resultado)` | 3 campos: `(op, arg1, arg2)` |
| **Manejo de resultados** | Crea variables temporales explícitas (`T1`, `T2`, `T3`...) | No usa temporales; referencia el número de renglón `(0)`, `(1)`... |
| **Optimización** | Ocupa más memoria por almacenar nombres temporales | Más compacto en memoria, pero depende del orden de renglones |

---

## 4. Estructura Visual y Componentes

- **Input de captura:** Campo de texto donde el usuario escribe su expresión o presiona `Enter`.
- **Botón Calcular:** Valida la entrada, procesa las tablas y muestra el resultado.
- **Botón Limpiar:** Borra el campo, limpia las tablas y restablece el estado inicial.
- **Chips de ejemplos rápidos:** Botones con expresiones predeterminadas numéricas y simbólicas.
- **Área de resultados:**
  - Tarjeta con el resultado numérico/algebraico evaluado.
  - Tabla de Cuádruplos formateada con etiquetas visuales (*badges*).
  - Tabla de Triplos con punteros resaltados.
- **Alertas:** Notificaciones en verde (éxito) y rojo (error de sintaxis o campos vacíos).

---

## 5. Guía de Publicación en GitHub y GitHub Pages

Para entregar los enlaces solicitados por tu profesor:

### Paso 1: Inicializar el repositorio Git
Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
git init
git add .
git commit -m "Entrega: Generador de Cuádruplos y Triplos con JavaScript"
```

### Paso 2: Crear el repositorio en GitHub
1. Entra a [github.com](https://github.com) y crea un nuevo repositorio (ejemplo: `triplos-y-cuadruplos`).
2. Conecta tu repositorio local con GitHub:
```bash
git remote add origin https://github.com/TU_USUARIO/triplos-y-cuadruplos.git
git branch -M main
git push -u origin main
```
*Este será tu **Enlace GitHub**:* `https://github.com/TU_USUARIO/triplos-y-cuadruplos`

### Paso 3: Activar GitHub Pages (Sitio Web en Vivo)
1. En tu repositorio de GitHub, haz clic en **Settings** (Configuración).
2. En el menú izquierdo, selecciona **Pages**.
3. En **Build and deployment > Branch**, selecciona `main` y la carpeta `/(root)`.
4. Haz clic en **Save** (Guardar).
5. Espera unos segundos y GitHub te proporcionará el enlace de tu página.
*Este será tu **Enlace GitPage**:* `https://TU_USUARIO.github.io/triplos-y-cuadruplos/`
