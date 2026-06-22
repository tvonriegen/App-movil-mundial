# Mundial Challenge 2026

Aplicación móvil desarrollada en Ionic Angular para competir con amigos, familiares o comunidades durante el Mundial 2026 mediante predicciones de partidos, ligas privadas y ranking de puntajes.

## Propuesta de valor

Mundial Challenge 2026 busca unir la simpleza de una quiniela con elementos competitivos de una experiencia tipo fantasy. La aplicación permite que los usuarios predigan resultados, participen en ligas y comparen su desempeño en rankings, evitando el uso de planillas manuales o aplicaciones fragmentadas.

## Funcionalidades implementadas

- Login local con nombre de usuario y contraseña en modo demo.
- Protección de rutas mediante Auth Guard.
- Pantalla de inicio con resumen del usuario, puntos, ligas y próximos partidos.
- Calendario de partidos con filtros por Hoy, Próximos y Fase de grupos.
- Creación, edición y eliminación de predicciones.
- Bloqueo de predicciones en partidos finalizados.
- Sistema de puntos según exactitud del pronóstico.
- Visualización de resultados de partidos finalizados.
- Creación de ligas privadas.
- Unión a ligas mediante código.
- Ranking de participantes por liga.
- Perfil de usuario con estadísticas y predicciones realizadas.
- Persistencia local usando localStorage.
- Diseño mobile-first optimizado para demo en navegador.

## Sistema de puntos

- 10 puntos: resultado exacto.
- 5 puntos: ganador o empate correcto.
- 3 puntos extra: diferencia de goles correcta.
- 1 punto por equipo: goles correctos de una selección.

## Tecnologías utilizadas

- Ionic Framework
- Angular
- TypeScript
- SCSS
- LocalStorage
- GitHub

## Estado del proyecto

El proyecto se encuentra en etapa MVP funcional. Actualmente opera con datos locales y persistencia en el navegador. La siguiente etapa contempla integración con backend real.

## Próximos pasos

- Integrar Supabase para autenticación real.
- Crear base de datos para usuarios, partidos, ligas y predicciones.
- Reemplazar datos simulados por datos persistentes.
- Mejorar la versión responsive para web.
- Incorporar API o carga real de partidos del Mundial.
- Agregar administración de ligas y miembros.
