let selector;
let listaIngredientes;
let estado;
let semaforo;
let platos = [];

function iniciarNutricion() {
  selector = document.getElementById("platoSelect");
  listaIngredientes = document.getElementById("listaIngredientes");
  estado = document.getElementById("nutricion-estado");
  semaforo = document.getElementById("semaforo-nutricion");

  if (!selector || !listaIngredientes || !estado || !semaforo) return;

  selector.addEventListener("change", mostrarIngredientes);
  listaIngredientes.addEventListener("change", actualizarNutricion);
  cargarPlatos();
}

async function cargarPlatos() {
  try {
    platos = await window.nutricionServicio.listarTodos();
    selector.innerHTML = "";

    if (!platos.length) {
      selector.innerHTML = '<option value="">No hay platos disponibles</option>';
      estado.textContent = "No se encontraron platos para mostrar.";
      limpiarNutricion();
      return;
    }

    platos.forEach(function (plato) {
      let opcion = document.createElement("option");
      opcion.value = String(plato.id);
      opcion.textContent = plato.nombre;
      selector.appendChild(opcion);
    });

    selector.value = String(platos[0].id);
    estado.textContent = "Información nutricional cargada correctamente.";
    mostrarIngredientes();
  } catch (error) {
    selector.innerHTML = '<option value="">Error al cargar los platos</option>';
    estado.setAttribute("role", "alert");
    estado.textContent = "No fue posible cargar los platos. Revisa los archivos del módulo.";
    console.error("Error al cargar nutrición:", error);
    limpiarNutricion();
  }
}

function obtenerPlatoSeleccionado() {
  let id = Number(selector.value);
  return platos.find(function (plato) {
    return plato.id === id;
  });
}

function mostrarIngredientes() {
  let plato = obtenerPlatoSeleccionado();
  listaIngredientes.innerHTML = "";

  if (!plato) {
    limpiarNutricion();
    return;
  }

  plato.ingredientes.forEach(function (ingrediente, indice) {
    let tarjeta = document.createElement("article");
    tarjeta.className = "nutricion-ingrediente";

    let etiqueta = document.createElement("label");
    etiqueta.className = "nutricion-ingrediente-nombre";

    let casilla = document.createElement("input");
    casilla.type = "checkbox";
    casilla.className = "ingrediente-check";
    casilla.dataset.indice = String(indice);
    casilla.checked = true;

    etiqueta.appendChild(casilla);
    etiqueta.appendChild(document.createTextNode(" " + ingrediente.nombre));

    let detalle = document.createElement("p");
    detalle.className = "nutricion-ingrediente-detalle";
    detalle.textContent = ingrediente.calorias + " kcal · " + ingrediente.proteinas +
      " g proteínas · " + ingrediente.carbohidratos + " g carbohidratos · " +
      ingrediente.grasas + " g grasas · " + ingrediente.sodio + " mg sodio";

    tarjeta.appendChild(etiqueta);
    tarjeta.appendChild(detalle);
    listaIngredientes.appendChild(tarjeta);
  });

  actualizarNutricion();
}

function actualizarNutricion() {
  let plato = obtenerPlatoSeleccionado();
  let totales = {
    calorias: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0,
    sodio: 0
  };

  if (plato) {
    let casillas = listaIngredientes.querySelectorAll(".ingrediente-check");
    casillas.forEach(function (casilla) {
      if (!casilla.checked) return;
      let ingrediente = plato.ingredientes[Number(casilla.dataset.indice)];
      if (!ingrediente) return;
      totales.calorias += Number(ingrediente.calorias) || 0;
      totales.proteinas += Number(ingrediente.proteinas) || 0;
      totales.carbohidratos += Number(ingrediente.carbohidratos) || 0;
      totales.grasas += Number(ingrediente.grasas) || 0;
      totales.sodio += Number(ingrediente.sodio) || 0;
    });
  }

  document.getElementById("calorias").textContent = Math.round(totales.calorias) + " kcal";
  document.getElementById("proteinas").textContent = redondear(totales.proteinas) + " g";
  document.getElementById("carbohidratos").textContent = redondear(totales.carbohidratos) + " g";
  document.getElementById("grasas").textContent = redondear(totales.grasas) + " g";

  let sodioResumen = document.getElementById("sodio");
  if (sodioResumen) sodioResumen.textContent = Math.round(totales.sodio) + " mg";

  actualizarSemaforo(plato, totales);
}

function redondear(valor) {
  return Math.round(valor * 10) / 10;
}

function actualizarSemaforo(plato, totales) {
  semaforo.innerHTML = "";

  if (!plato || !plato.reglasNutricionales) {
    let mensaje = document.createElement("p");
    mensaje.textContent = "No hay reglas de validación nutricional disponibles para este plato.";
    semaforo.appendChild(mensaje);
    return;
  }

  let nutrientes = [
    { clave: "sodio", nombre: "Sodio", valor: totales.sodio },
    { clave: "grasas", nombre: "Grasas totales", valor: totales.grasas }
  ];

  nutrientes.forEach(function (nutriente) {
    let reglas = plato.reglasNutricionales[nutriente.clave];
    if (!reglas) return;

    let nivel = "ok";
    let titulo = nutriente.nombre + ": nivel bajo";
    let detalle = "Total seleccionado: " + redondear(nutriente.valor) + " " + reglas.unidad + ". ";

    if (nutriente.valor >= reglas.alto) {
      nivel = "alerta";
      titulo = "Rojo: aporte alto de " + nutriente.nombre.toLowerCase();
      detalle += "Alcanza o supera el umbral alto de " + reglas.alto + " " + reglas.unidad + ".";
    } else if (nutriente.valor >= reglas.moderado) {
      nivel = "atencion";
      titulo = "Amarillo: atención al aporte de " + nutriente.nombre.toLowerCase();
      detalle += "Está entre el umbral de atención (" + reglas.moderado + " " + reglas.unidad +
        ") y el umbral alto (" + reglas.alto + " " + reglas.unidad + ").";
    } else {
      detalle += "Está por debajo del umbral de atención de " + reglas.moderado + " " + reglas.unidad +
        "; el umbral alto es " + reglas.alto + " " + reglas.unidad + ".";
    }

    let tarjeta = document.createElement("div");
    tarjeta.className = nivel === "alerta" ? "nutricion-semaforo-alerta" :
      (nivel === "atencion" ? "nutricion-semaforo-atencion" : "nutricion-semaforo-ok");
    tarjeta.setAttribute("role", nivel === "alerta" ? "alert" : "status");

    let encabezado = document.createElement("p");
    encabezado.className = "nutricion-semaforo-titulo";
    encabezado.textContent = titulo;

    let texto = document.createElement("p");
    texto.className = "nutricion-semaforo-detalle";
    texto.textContent = detalle;

    tarjeta.appendChild(encabezado);
    tarjeta.appendChild(texto);
    semaforo.appendChild(tarjeta);
  });
}

function limpiarNutricion() {
  ["calorias", "proteinas", "carbohidratos", "grasas"].forEach(function (id, indice) {
    let unidad = [" kcal", " g", " g", " g"][indice];
    let elemento = document.getElementById(id);
    if (elemento) elemento.textContent = "0" + unidad;
  });
  let sodioResumen = document.getElementById("sodio");
  if (sodioResumen) sodioResumen.textContent = "0 mg";
  if (semaforo) semaforo.textContent = "No hay datos nutricionales para mostrar.";
}

document.addEventListener("DOMContentLoaded", iniciarNutricion);
