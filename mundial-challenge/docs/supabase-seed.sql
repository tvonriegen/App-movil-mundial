-- =========================================================
-- Mundial Challenge 2026
-- Datos iniciales demo para Supabase
-- =========================================================

-- Partidos demo
insert into public.partidos (
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
values
  (
    'Grupo A',
    '2026-06-11',
    '15:00',
    'Argentina',
    'Canadá',
    'AR',
    'CA',
    'pendiente',
    null,
    null
  ),
  (
    'Grupo B',
    '2026-06-11',
    '18:00',
    'España',
    'Croacia',
    'ES',
    'HR',
    'finalizado',
    2,
    1
  ),
  (
    'Grupo C',
    '2026-06-12',
    '20:00',
    'Brasil',
    'México',
    'BR',
    'MX',
    'pendiente',
    null,
    null
  ),
  (
    'Grupo D',
    '2026-06-13',
    '16:00',
    'Francia',
    'Alemania',
    'FR',
    'DE',
    'pendiente',
    null,
    null
  ),
  (
    'Grupo E',
    '2026-06-14',
    '19:00',
    'Chile',
    'Uruguay',
    'CL',
    'UY',
    'pendiente',
    null,
    null
  );

-- Nota:
-- Las ligas y usuarios no se insertan aquí todavía,
-- porque dependerán de usuarios reales creados mediante Supabase Auth.