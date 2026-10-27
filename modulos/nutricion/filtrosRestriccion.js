(function () {
  let filtrosActivos = [];
  let estado;
  let resultado;

  function renderizarRecetas(recetas) {
    resultado.innerHTML = "";

    if (recetas.length === 0) {
      const vacio = document.createElement("p");
      vacio.className = "nutricion-filtro-vacio";
      vacio.setAttribute("role", "alert");
      vacio.textContent = "Ninguna receta cumple con las restricciones seleccionadas.";
      resultado.appendChild(vacio);
      return;
    }

    recetas.forEach(function (receta) {
      const tarjeta = document.createElement("article");
      tarjeta.className = "nutricion-filtro-tarjeta";

      const nombre = document.createElement("h3");
      nombre.className = "nutricion-filtro-tarjeta-nombre";
      nombre.textContent = receta.nombreReceta;

      const detalle = document.createElement("p");
      detalle.className = "nutricion-filtro-tarjeta-detalle";
      const textoPorciones = receta.porciones === 1 ? " porción" : " porciones";
      detalle.textContent = receta.minutos + " minutos · " + receta.porciones + textoPorciones;

      tarjeta.appendChild(nombre);
      tarjeta.appendChild(detalle);
      resultado.appendChild(tarjeta);
    });
  }

  async function cargarRecetas() {
    estado.textContent = "Cargando recetas...";

    try {
      const recetas = await window.filtrosRestriccionServicio.listarRecetas();

      const filtradas = recetas.filter(function (receta) {
        return filtrosActivos.every(function (filtro) {
          return receta.restricciones.includes(filtro);
        });
      });

      renderizarRecetas(filtradas);
      estado.textContent = "Recetas encontradas: " + filtradas.length;
    } catch (error) {
      resultado.innerHTML = "";
      estado.textContent = "No se pudieron cargar las recetas. Inténtalo de nuevo más tarde.";
    }
  }

  function alternarFiltro(boton) {
    const filtro = boton.dataset.filtro;
    const estaActivo = boton.getAttribute("aria-pressed") === "true";

    if (estaActivo) {
      boton.setAttribute("aria-pressed", "false");
      filtrosActivos = filtrosActivos.filter(function (item) {
        return item !== filtro;
      });
    } else {
      boton.setAttribute("aria-pressed", "true");
      filtrosActivos.push(filtro);
    }

    cargarRecetas();
  }

  function iniciarFiltrosRestriccion() {
    estado = document.getElementById("estadoFiltrosRestriccion");
    resultado = document.getElementById("resultadoFiltrosRestriccion");

    if (!estado || !resultado) {
      return;
    }

    const botones = document.querySelectorAll(".nutricion-filtro-btn");

    botones.forEach(function (boton) {
      boton.addEventListener("click", function () {
        alternarFiltro(boton);
      });
    });

    cargarRecetas();
  }

  document.addEventListener("DOMContentLoaded", iniciarFiltrosRestriccion);
})();
