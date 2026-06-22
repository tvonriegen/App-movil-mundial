const URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

async function main() {
  try {
    const respuesta = await fetch(URL);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const data = await respuesta.json();

    console.log('Nombre torneo:', data.name);
    console.log('Cantidad de partidos encontrados:', data.matches?.length ?? 0);

    const partidos = (data.matches ?? []).map((partido, index) => {
      return {
        numero: index + 1,
        ronda: partido.round,
        grupo: partido.group ?? '',
        fecha: partido.date,
        hora: partido.time ?? '',
        local: obtenerNombreEquipo(partido.team1),
        visitante: obtenerNombreEquipo(partido.team2),
        sede: partido.ground ?? '',
        golesLocal: partido.score?.ft?.[0] ?? null,
        golesVisitante: partido.score?.ft?.[1] ?? null
      };
    });

    console.table(partidos.slice(0, 15));

  } catch (error) {
    console.error('Error al leer OpenFootball:', error);
  }
}

function obtenerNombreEquipo(equipo) {
  if (!equipo) {
    return 'Por definir';
  }

  if (typeof equipo === 'string') {
    return equipo;
  }

  return equipo.name ?? 'Por definir';
}

main();