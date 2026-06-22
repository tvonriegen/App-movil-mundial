# Mundial Challenge 2026

Aplicación móvil desarrollada en Ionic Angular para competir durante el Mundial 2026 mediante predicciones de partidos, ligas privadas y ranking de puntajes.

## Descripción del proyecto

Mundial Challenge 2026 busca unir la simpleza de una quiniela con elementos competitivos de una experiencia tipo fantasy. La aplicación permite que los usuarios predigan resultados, participen en ligas y comparen su desempeño con otros participantes, evitando el uso de planillas manuales o múltiples aplicaciones separadas.

El proyecto está pensado como una app mobile-first, con una experiencia simple, visual y orientada a la competencia entre amigos, familiares, compañeros o comunidades.

## Funcionalidades implementadas

- Login local con nombre de usuario y contraseña en modo demo.
- Protección de rutas mediante Auth Guard.
- Pantalla de inicio con resumen del usuario, puntos, ligas y próximos partidos.
- Calendario de partidos con filtros por Hoy, Próximos y Fase de grupos.
- Creación, edición y eliminación de predicciones.
- Bloqueo de predicciones en partidos finalizados.
- Visualización de resultados de partidos finalizados.
- Sistema de puntos según exactitud del pronóstico.
- Creación de ligas privadas.
- Unión a ligas mediante código.
- Ranking de participantes por liga.
- Perfil de usuario con estadísticas y predicciones realizadas.
- Persistencia local usando localStorage.
- Función para restablecer la demo.
- Diseño mobile-first optimizado para navegador y móvil.

## Sistema de puntos

El sistema de puntaje considera distintos niveles de acierto:

- 10 puntos: resultado exacto.
- 5 puntos: ganador o empate correcto.
- 3 puntos extra: diferencia de goles correcta.
- 1 punto por equipo: cantidad de goles correcta para una selección.

## Tecnologías utilizadas

- Ionic Framework
- Angular
- TypeScript
- SCSS
- LocalStorage
- GitHub

## Estructura principal de pantallas

- Login: ingreso demo con usuario y contraseña.
- Inicio: resumen general del usuario, próximos partidos y ligas destacadas.
- Partidos: calendario de encuentros y acceso a predicciones.
- Predicción: pantalla para crear, editar o eliminar un pronóstico.
- Ligas: creación de ligas privadas y unión mediante códigos.
- Ranking: clasificación de participantes por liga.
- Perfil: estadísticas, predicciones realizadas y acciones de usuario.

## Estado actual

El proyecto se encuentra en etapa MVP funcional. Actualmente trabaja con datos locales y persistencia en el navegador mediante localStorage. La app permite probar el flujo principal completo sin backend externo.

## Próximos pasos

- Integrar Supabase para autenticación real.
- Crear base de datos para usuarios, partidos, ligas y predicciones.
- Reemplazar datos simulados por datos persistentes.
- Incorporar datos reales de partidos del Mundial 2026.
- Mejorar la administración de ligas y miembros.
- Adaptar una versión responsive completa para web.
- Agregar roles, invitaciones y gestión avanzada de usuarios.
