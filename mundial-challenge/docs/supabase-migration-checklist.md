# Checklist de Migración a Supabase

## Objetivo

Este documento define el orden recomendado para migrar Mundial Challenge 2026 desde servicios locales con localStorage hacia Supabase como backend real.

La idea es avanzar por etapas, sin romper el MVP funcional actual.

---

## Estado actual del MVP

Actualmente la aplicación funciona con:

- Login local en modo demo.
- Sesión simulada con localStorage.
- Partidos simulados desde PartidosService.
- Predicciones guardadas en localStorage.
- Ligas guardadas en localStorage.
- Ranking calculado localmente.
- Perfil de usuario local.

---

## Servicios locales actuales

- UsuarioService
- PartidosService
- PrediccionesService
- LigasService

---

## Servicios Supabase preparados

- SupabaseService
- AuthSupabaseService
- UsuariosSupabaseService
- PartidosSupabaseService
- PrediccionesSupabaseService
- LigasSupabaseService

---

# Etapa 1: Crear proyecto en Supabase

## Tareas

- Crear proyecto en Supabase.
- Obtener Project URL.
- Obtener anon public key.
- Reemplazar valores en `src/app/config/supabase.config.ts`.

Archivo actual:

```ts
export const supabaseConfig = {
  url: 'TU_SUPABASE_URL',
  anonKey: 'TU_SUPABASE_ANON_KEY'
};