(function () {
  "use strict";

  var formatoCalorias = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  });

  function iniciarResumenMeta() {
    var resumen = document.querySelector(".nutricion-meta-resumen");
    if (!resumen) return;

    cargarResumen(resumen);
  }

  async function cargarResumen(resumen) {
    var meta = resumen.querySelector("[data-meta-diaria]");
    var consumido = resumen.querySelector("[data-consumido-hoy]");
    var mensaje = resumen.querySelector("[data-mensaje]");

    try {
      var datos = await window.nutricionServicio.obtenerMetasDiarias();

      if (!datos) {
        meta.textContent = "No disponible";
        consumido.textContent = "No disponible";
        mensaje.textContent =
          "No se encontró un perfil nutricional asociado a una sesión activa.";
        resumen.dataset.estado = "sin-datos";
        return;
      }

      meta.textContent = Number.isFinite(datos.metaDiaria)
        ? formatoCalorias.format(datos.metaDiaria) + " kcal"
        : "No disponible";
      consumido.textContent = Number.isFinite(datos.consumidoHoy)
        ? formatoCalorias.format(datos.consumidoHoy) + " kcal"
        : "Sin registros";
      mensaje.textContent = Number.isFinite(datos.consumidoHoy)
        ? "Consumo acumulado a partir de los registros de hoy."
        : "No hay registros de consumo para hoy.";
      resumen.dataset.estado = "listo";
    } catch (error) {
      meta.textContent = "No disponible";
      consumido.textContent = "No disponible";
      mensaje.textContent = "No fue posible cargar el resumen diario.";
      resumen.dataset.estado = "error";
      console.error("Error al cargar el resumen diario:", error);
    }
  }

  document.addEventListener("DOMContentLoaded", iniciarResumenMeta);
})();
