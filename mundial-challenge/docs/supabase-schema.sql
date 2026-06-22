-- =========================================================
-- Mundial Challenge 2026
-- Esquema inicial para Supabase
-- =========================================================

-- Tabla de perfiles de usuario
create table if not exists public.usuarios (
  id uuid primary key,
  nombre_usuario text not null unique,
  email text unique,
  nombre_visible text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Tabla de partidos
create table if not exists public.partidos (
  id bigint generated always as identity primary key,
  grupo text not null,
  fecha date not null,
  hora time not null,

  local text not null,
  visitante text not null,

  bandera_local text,
  bandera_visitante text,

  estado text not null default 'pendiente',
  goles_local integer,
  goles_visitante integer,

  created_at timestamp with time zone default now(),

  constraint estado_partido_valido
    check (estado in ('pendiente', 'en_vivo', 'finalizado')),

  constraint goles_no_negativos
    check (
      (goles_local is null or goles_local >= 0)
      and
      (goles_visitante is null or goles_visitante >= 0)
    )
);

-- Tabla de ligas
create table if not exists public.ligas (
  id bigint generated always as identity primary key,
  nombre text not null,
  tipo text not null default 'Privada',
  codigo text unique,
  creador_id uuid not null references public.usuarios(id) on delete cascade,
  created_at timestamp with time zone default now(),

  constraint tipo_liga_valido
    check (tipo in ('Privada', 'Publica'))
);

-- Tabla intermedia entre usuarios y ligas
create table if not exists public.liga_miembros (
  id bigint generated always as identity primary key,
  liga_id bigint not null references public.ligas(id) on delete cascade,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  rol text not null default 'miembro',
  created_at timestamp with time zone default now(),

  constraint rol_miembro_valido
    check (rol in ('admin', 'miembro')),

  constraint usuario_unico_por_liga
    unique (liga_id, usuario_id)
);

-- Tabla de predicciones
create table if not exists public.predicciones (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  partido_id bigint not null references public.partidos(id) on delete cascade,

  goles_local integer not null,
  goles_visitante integer not null,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  constraint prediccion_unica_por_partido
    unique (usuario_id, partido_id),

  constraint goles_prediccion_no_negativos
    check (goles_local >= 0 and goles_visitante >= 0)
);

-- =========================================================
-- Índices recomendados
-- =========================================================

create index if not exists idx_partidos_estado
on public.partidos(estado);

create index if not exists idx_partidos_fecha
on public.partidos(fecha);

create index if not exists idx_ligas_codigo
on public.ligas(codigo);

create index if not exists idx_liga_miembros_usuario
on public.liga_miembros(usuario_id);

create index if not exists idx_liga_miembros_liga
on public.liga_miembros(liga_id);

create index if not exists idx_predicciones_usuario
on public.predicciones(usuario_id);

create index if not exists idx_predicciones_partido
on public.predicciones(partido_id);