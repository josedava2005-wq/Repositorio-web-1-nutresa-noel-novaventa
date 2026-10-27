(function () {
  window.FILTROS_RESTRICCION_SERVICIO_CONFIG = window.FILTROS_RESTRICCION_SERVICIO_CONFIG || {
    baseUrl: "https://6ae0365e8e42963c8d5f177c.mockapi.io",
    ruta: "/recetas-restriccion"
  };

  const config = window.FILTROS_RESTRICCION_SERVICIO_CONFIG;

  window.filtrosRestriccionServicio = {
    async listarRecetas() {
      try {
        const respuesta = await fetch(config.baseUrl + config.ruta);
        if (!respuesta.ok) {
          throw new Error("Error en API de recetas: " + respuesta.status);
        }

        const recetas = await respuesta.json();

        return recetas.map(function (receta) {
          return {
            id: receta.id,
            nombreReceta: receta.nombreReceta,
            restricciones: receta.restricciones.split(","),
            minutos: receta.minutos,
            porciones: receta.porciones
          };
        });
      } catch (error) {
        console.error("filtrosRestriccionServicio.listarRecetas:", error);
        throw error;
      }
    }
  };
})();
