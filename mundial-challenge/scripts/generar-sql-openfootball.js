const fs = require('fs');

const URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';
const TIME_ZONE_CHILE = 'America/Santiago';

const banderas = {
  'Mexico': '🇲🇽',
  'South Africa': '🇿🇦',
  'South Korea': '🇰🇷',
  'Czech Republic': '🇨🇿',
  'Canada': '🇨🇦',
  'Bosnia & Herzegovina': '🇧🇦',
  'Qatar': '🇶🇦',
  'Switzerland': '🇨🇭',
  'Brazil': '🇧🇷',
  'Morocco': '🇲🇦',
  'Haiti': '🇭🇹',
  'Scotland': '🏴',
  'United States': '🇺🇸',
  'Paraguay': '🇵🇾',
  'Australia': '🇦🇺',
  'Turkey': '🇹🇷',
  'Germany': '🇩🇪',
  'Curacao': '🇨🇼',
  'Ivory Coast': '🇨🇮',
  'Ecuador': '🇪🇨',
  'Netherlands': '🇳🇱',
  'Japan': '🇯🇵',
  'Sweden': '🇸🇪',
  'Tunisia': '🇹🇳',
  'Belgium': '🇧🇪',
  'Egypt': '🇪🇬',
  'Iran': '🇮🇷',
  'New Zealand': '🇳🇿',
  'Spain': '🇪🇸',
  'Cape Verde': '🇨🇻',
  'Saudi Arabia': '🇸🇦',
  'Uruguay': '🇺🇾',
  'France': '🇫🇷',
  'Senegal': '🇸🇳',
  'Iraq': '🇮🇶',
  'Norway': '🇳🇴',
  'Argentina': '🇦🇷',
  'Algeria': '🇩🇿',
  'Austria': '🇦🇹',
  'Jordan': '🇯🇴',
  'Portugal': '🇵🇹',
  'DR Congo': '🇨🇩',
  'Uzbekistan': '🇺🇿',
  'Colombia': '🇨🇴',
  'England': '🏴',
  'Croatia': '🇭🇷',
  'Ghana': '🇬🇭',
  'Panama': '🇵🇦'
};

async function main() {
  try {
    const respuesta = await fetch(URL);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const data = await respuesta.json();

    const partidos = (data.matches ?? []).map((partido, index) => {
      const local = obtenerNombreEquipo(partido.team1);
      const visitante = obtenerNombreEquipo(partido.team2);

      const fechaHoraChile = convertirAFechaHoraChile(
        partido.date,
        partido.time
      );

      return {
        id: index + 1,
        grupo: formatearGrupo(partido.group, partido.round),
        fecha: fechaHoraChile.fecha,
        hora: fechaHoraChile.hora,
        local,
        visitante,
        bandera_local: banderas[local] ?? '',
        bandera_visitante: banderas[visitante] ?? '',
        estado: partido.score?.ft ? 'finalizado' : 'pendiente',
        goles_local: partido.score?.ft?.[0] ?? null,
        goles_visitante: partido.score?.ft?.[1] ?? null
      };
    });

    const sql = generarSQL(partidos);

    fs.writeFileSync('scripts/supabase-partidos-openfootball.sql', sql, 'utf8');

    console.log('Archivo SQL generado correctamente.');
    console.log('Ruta: scripts/supabase-partidos-openfootball.sql');
    console.log('Partidos incluidos:', partidos.length);
    console.table(partidos.slice(0, 15));

  } catch (error) {
    console.error('Error al generar SQL:', error);
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

function convertirAFechaHoraChile(fecha, horaOpenFootball) {
  if (!fecha || !horaOpenFootball) {
    return {
      fecha: fecha ?? '',
      hora: '00:00'
    };
  }

  const partes = horaOpenFootball.match(/^(\d{2}):(\d{2}) UTC([+-]\d{1,2})$/);

  if (!partes) {
    return {
      fecha,
      hora: horaOpenFootball.substring(0, 5)
    };
  }

  const hora = Number(partes[1]);
  const minuto = Number(partes[2]);
  const offset = Number(partes[3]);

  const [anio, mes, dia] = fecha.split('-').map(Number);

  const fechaUTC = new Date(Date.UTC(
    anio,
    mes - 1,
    dia,
    hora - offset,
    minuto,
    0
  ));

  const formateador = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE_CHILE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const partesChile = formateador.formatToParts(fechaUTC);

  const year = partesChile.find(parte => parte.type === 'year')?.value;
  const month = partesChile.find(parte => parte.type === 'month')?.value;
  const day = partesChile.find(parte => parte.type === 'day')?.value;
  const hour = partesChile.find(parte => parte.type === 'hour')?.value;
  const minute = partesChile.find(parte => parte.type === 'minute')?.value;

  return {
    fecha: `${year}-${month}-${day}`,
    hora: `${hour}:${minute}`
  };
}

function formatearGrupo(grupo, ronda) {
  if (grupo) {
    return grupo.replace('Group', 'Grupo');
  }

  if (ronda) {
    return ronda;
  }

  return 'Sin grupo';
}

function sqlString(valor) {
  if (valor === null || valor === undefined) {
    return 'null';
  }

  return `'${String(valor).replaceAll("'", "''")}'`;
}

function sqlNumber(valor) {
  if (valor === null || valor === undefined) {
    return 'null';
  }

  return valor;
}

function generarSQL(partidos) {
  const filas = partidos.map(partido => {
    return `(
  ${partido.id},
  ${sqlString(partido.grupo)},
  ${sqlString(partido.fecha)},
  ${sqlString(partido.hora)},
  ${sqlString(partido.local)},
  ${sqlString(partido.visitante)},
  ${sqlString(partido.bandera_local)},
  ${sqlString(partido.bandera_visitante)},
  ${sqlString(partido.estado)},
  ${sqlNumber(partido.goles_local)},
  ${sqlNumber(partido.goles_visitante)}
)`;
  });

  return `insert into public.partidos (
  id,
  grupo,
  fecha,
  hora,
  local,
  visitante,
  bandera_local,
  bandera_visitante,
  estado,
  goles_local,
  goles_visitante
)
overriding system value
values
${filas.join(',\n')}
on conflict (id) do update set
  grupo = excluded.grupo,
  fecha = excluded.fecha,
  hora = excluded.hora,
  local = excluded.local,
  visitante = excluded.visitante,
  bandera_local = excluded.bandera_local,
  bandera_visitante = excluded.bandera_visitante,
  estado = excluded.estado,
  goles_local = excluded.goles_local,
  goles_visitante = excluded.goles_visitante;
`;
}

main();