# Diseño de Base de Datos - Mundial Challenge 2026

## Objetivo

Este documento define la estructura inicial de base de datos para Mundial Challenge 2026. El objetivo es preparar la migración desde datos locales con localStorage hacia un backend real con Supabase.

## Tablas principales

### usuarios

Representa a los usuarios registrados en la aplicación.

Campos:

- id
- nombre_usuario
- email
- nombre_visible
- avatar_url
- created_at

Relaciones:

- Un usuario puede crear muchas ligas.
- Un usuario puede pertenecer a muchas ligas.
- Un usuario puede hacer muchas predicciones.

---

### partidos

Representa los partidos del Mundial 2026.

Campos:

- id
- grupo
- fecha
- hora
- local
- visitante
- bandera_local
- bandera_visitante
- estado
- goles_local
- goles_visitante
- created_at

Estados posibles:

- pendiente
- en_vivo
- finalizado

Relaciones:

- Un partido puede tener muchas predicciones.

---

### ligas

Representa una liga o competencia creada por un usuario.

Campos:

- id
- nombre
- tipo
- codigo
- creador_id
- created_at

Tipos posibles:

- Privada
- Publica

Relaciones:

- Una liga pertenece a un usuario creador.
- Una liga tiene muchos miembros.
- Una liga puede consultarse mediante su código.

---

### liga_miembros

Representa la relación entre usuarios y ligas.

Campos:

- id
- liga_id
- usuario_id
- rol
- created_at

Roles posibles:

- admin
- miembro

Relaciones:

- Un usuario puede estar en muchas ligas.
- Una liga puede tener muchos usuarios.

---

### predicciones

Representa la predicción realizada por un usuario para un partido.

Campos:

- id
- usuario_id
- partido_id
- goles_local
- goles_visitante
- created_at
- updated_at

Reglas:

- Un usuario solo puede tener una predicción por partido.
- Las predicciones solo pueden editarse antes del inicio o cierre del partido.
- Las predicciones de partidos finalizados no pueden modificarse.

---

## Relaciones principales

- usuarios 1:N predicciones
- partidos 1:N predicciones
- usuarios N:M ligas mediante liga_miembros
- ligas 1:N liga_miembros
- usuarios 1:N ligas como creador

## Reglas de negocio

- Un usuario puede crear una liga privada.
- Una liga privada debe tener un código único.
- Un usuario puede unirse a una liga mediante código.
- Un usuario no puede estar duplicado en la misma liga.
- Un usuario no puede tener más de una predicción por partido.
- El ranking se calcula a partir de las predicciones y resultados, no se guarda como tabla fija.