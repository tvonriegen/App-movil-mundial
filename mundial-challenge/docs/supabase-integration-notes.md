# Notas de Integración Supabase

## Objetivo

Este documento define cómo se integrará Supabase en Mundial Challenge 2026 sin romper el MVP local actual.

## Estrategia

La app actualmente funciona con servicios locales y localStorage. La integración con Supabase se hará por etapas:

1. Crear cliente Supabase.
2. Crear proyecto en Supabase.
3. Ejecutar schema SQL.
4. Ejecutar seed SQL de partidos demo.
5. Reemplazar login local por Supabase Auth.
6. Reemplazar PartidosService por consultas a Supabase.
7. Reemplazar PrediccionesService por inserciones y updates en Supabase.
8. Reemplazar LigasService por tablas ligas y liga_miembros.

## Servicios actuales

- UsuarioService: maneja usuario demo y sesión local.
- PartidosService: entrega partidos simulados.
- PrediccionesService: guarda predicciones en localStorage.
- LigasService: maneja ligas locales y códigos.

## Servicios futuros

- SupabaseService: cliente central de Supabase.
- AuthSupabaseService: registro, login y logout real.
- PartidosSupabaseService: lectura de partidos desde tabla partidos.
- PrediccionesSupabaseService: crear, editar y eliminar predicciones reales.
- LigasSupabaseService: crear ligas, unirse por código y listar ligas reales.

## Regla importante

No reemplazar todos los servicios de una sola vez. Primero se debe conectar autenticación, luego partidos, después predicciones y finalmente ligas.