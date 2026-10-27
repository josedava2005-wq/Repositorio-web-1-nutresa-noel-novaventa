(function () {
  "use strict";

  window.nutricionServicio = {
    async listarTodos() {
      const platos = window.platosNutricionData;

      if (!Array.isArray(platos)) {
        throw new Error("No se cargaron los datos de platos de nutrición.");
      }

      return platos;
    },

    async obtenerMetasDiarias() {
      const nutricion = window.nutricionMockData;
      const usuarios = window.usuarioMockData;

      if (!nutricion || !usuarios) {
        throw new Error("No se cargaron los datos de metas nutricionales.");
      }

      const perfiles = Array.isArray(nutricion.perfilesAlimentarios)
        ? nutricion.perfilesAlimentarios
        : [];
      const sesiones = Array.isArray(usuarios.sesionesActivas)
        ? usuarios.sesionesActivas
        : [];
      const perfilUsuario = sesiones
        .filter(function (sesion) {
          return sesion.estado === "activa";
        })
        .map(function (sesion) {
          return perfiles.find(function (perfil) {
            return perfil.idUsuario === sesion.idUsuario;
          });
        })
        .find(Boolean);

      if (!perfilUsuario) {
        return null;
      }

      const hoy = new Date();
      const fechaHoy = [
        hoy.getFullYear(),
        String(hoy.getMonth() + 1).padStart(2, "0"),
        String(hoy.getDate()).padStart(2, "0"),
      ].join("-");
      const objetivos = Array.isArray(nutricion.objetivosNutricionales)
        ? nutricion.objetivosNutricionales
        : [];
      const objetivoVigente = objetivos.find(function (objetivo) {
        return (
          objetivo.idPerfilAlimentario === perfilUsuario.id &&
          objetivo.fechaInicio <= fechaHoy &&
          objetivo.fechaFin >= fechaHoy &&
          Number.isFinite(objetivo.metaCalorias) &&
          objetivo.metaCalorias > 0
        );
      });
      const metaPerfil = perfilUsuario.caloriasDiarias;
      const metaDiaria = objetivoVigente
        ? objetivoVigente.metaCalorias
        : Number.isFinite(metaPerfil) && metaPerfil > 0
          ? metaPerfil
          : null;

      const consumos = Array.isArray(nutricion.consumosDiarios)
        ? nutricion.consumosDiarios
        : [];
      const consumosHoy = consumos.filter(function (consumo) {
        return (
          consumo.idUsuario === perfilUsuario.idUsuario &&
          consumo.fechaConsumo === fechaHoy &&
          Number.isFinite(consumo.calorias) &&
          consumo.calorias >= 0
        );
      });

      return {
        metaDiaria: Number.isFinite(metaDiaria) ? metaDiaria : null,
        consumidoHoy: consumosHoy.length
          ? consumosHoy.reduce(function (total, consumo) {
              return total + consumo.calorias;
            }, 0)
          : null,
        idUsuario: perfilUsuario.idUsuario,
        fecha: fechaHoy,
      };
    },
  };
})();
