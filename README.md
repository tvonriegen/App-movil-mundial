# Mundial Challenge 2026

Aplicación móvil/web desarrollada con **Ionic + Angular** para competir durante el Mundial 2026 mediante predicciones de partidos, ligas privadas y rankings entre usuarios.

La propuesta de la app es combinar la simpleza de una quiniela con elementos competitivos tipo fantasy, permitiendo que los usuarios predigan resultados, acumulen puntos y compitan con amigos, familiares o comunidades.

---

## Descripción general

**Mundial Challenge 2026** es una aplicación pensada para fanáticos del fútbol que quieren vivir el Mundial de forma más interactiva. Los usuarios pueden registrarse, iniciar sesión, revisar el calendario de partidos, hacer predicciones, crear ligas, unirse a ligas mediante código y visualizar rankings.

La app utiliza **Supabase** como backend principal para autenticación, base de datos y persistencia de información. Los partidos del Mundial 2026 fueron importados desde una fuente externa gratuita mediante un script local y almacenados en Supabase.

---

## Funcionalidades principales

* Registro e inicio de sesión de usuarios.
* Login rápido con cuentas demo para presentación.
* Perfil editable de usuario.
* Calendario de partidos del Mundial 2026.
* Partidos cargados desde Supabase.
* Importación de fixtures desde OpenFootball.
* Conversión de horarios a hora de Chile.
* Creación y edición de predicciones.
* Eliminación de predicciones.
* Cálculo de puntos según resultados de partidos.
* Creación de ligas privadas.
* Unión a ligas mediante código de invitación.
* Conteo real de miembros por liga.
* Ranking por liga.
* Identificación del usuario actual dentro del ranking.
* Cierre de sesión y separación de datos por usuario.

---

## Tecnologías utilizadas

### Frontend

* Ionic
* Angular
* TypeScript
* HTML
* SCSS

### Backend / Base de datos

* Supabase Auth
* Supabase PostgreSQL
* Supabase Row Level Security

### Fuente externa de partidos

* OpenFootball World Cup JSON

### Herramientas de desarrollo

* Visual Studio Code
* GitHub Desktop
* Node.js
* Ionic CLI

---

## Arquitectura general

La aplicación sigue una estructura simple basada en frontend móvil, servicios Angular y backend en Supabase.

```txt
Ionic / Angular
      ↓
Servicios Angular
      ↓
Supabase
      ↓
PostgreSQL
```

Para los partidos del Mundial, el flujo es:

```txt
OpenFootball JSON
      ↓
Script local de importación
      ↓
SQL generado
      ↓
Supabase tabla partidos
      ↓
App Ionic
```

---

## Rol de Ionic en el proyecto

Ionic se utiliza como framework principal para construir la interfaz mobile-first de la aplicación.

En este proyecto, Ionic entrega componentes visuales como:

* `ion-header`
* `ion-toolbar`
* `ion-title`
* `ion-content`
* `ion-button`
* `ion-card`
* `ion-list`
* `ion-item`
* `ion-badge`
* `ion-tabs`
* `ion-tab-bar`
* `ion-tab-button`

Angular se encarga de la lógica, navegación, servicios, guards y conexión con Supabase.

---

## Estructura principal del proyecto

```txt
src/
  app/
    adapters/
      liga.adapter.ts
      partido.adapter.ts
      prediccion.adapter.ts

    models/
      liga.model.ts
      partido.model.ts
      prediccion.model.ts
      usuario.model.ts

    services/
      auth-supabase.ts
      ligas-supabase.ts
      partidos-supabase.ts
      predicciones-supabase.ts
      supabase.ts
      usuarios-supabase.ts

    login/
      login.page.ts
      login.page.html
      login.page.scss

    tab1/
      tab1.page.ts
      tab1.page.html
      tab1.page.scss

    tab2/
      tab2.page.ts
      tab2.page.html
      tab2.page.scss

    tab3/
      tab3.page.ts
      tab3.page.html
      tab3.page.scss

    perfil/
      perfil.page.ts
      perfil.page.html
      perfil.page.scss

    prediccion/
      prediccion.page.ts
      prediccion.page.html
      prediccion.page.scss

    ranking/
      ranking.page.ts
      ranking.page.html
      ranking.page.scss

scripts/
  probar-openfootball.js
  generar-sql-openfootball.js
  supabase-partidos-openfootball.sql
```

---

## Instalación del proyecto

Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
```

Entrar a la carpeta del proyecto:

```bash
cd mundial-challenge
```

Instalar dependencias:

```bash
npm install
```

Ejecutar la aplicación en modo desarrollo:

```bash
ionic serve
```

---

## Configuración de Supabase

El proyecto utiliza un archivo de configuración para conectar la app con Supabase.

La estructura esperada es:

```ts
export const supabaseConfig = {
  url: 'TU_SUPABASE_URL',
  anonKey: 'TU_SUPABASE_ANON_KEY'
};
```

Este archivo permite crear el cliente de Supabase que luego utilizan los servicios de autenticación, usuarios, partidos, predicciones y ligas.

> Importante: no se deben subir claves privadas o service role keys al repositorio. Solo debe usarse la anon key pública correspondiente al cliente frontend.

---

## Tablas principales de Supabase

### `usuarios`

Guarda información de perfil de cada usuario.

Campos principales:

* `id`
* `nombre_usuario`
* `nombre_visible`
* `email`
* `rol`
* `created_at`
* `updated_at`

---

### `partidos`

Guarda los partidos del Mundial 2026.

Campos principales:

* `id`
* `grupo`
* `fecha`
* `hora`
* `local`
* `visitante`
* `bandera_local`
* `bandera_visitante`
* `estado`
* `goles_local`
* `goles_visitante`

---

### `predicciones`

Guarda las predicciones realizadas por los usuarios.

Campos principales:

* `id`
* `usuario_id`
* `partido_id`
* `goles_local`
* `goles_visitante`
* `puntos_obtenidos`
* `created_at`
* `updated_at`

---

### `ligas`

Guarda las ligas creadas por los usuarios.

Campos principales:

* `id`
* `nombre`
* `tipo`
* `codigo`
* `creador_id`
* `created_at`

---

### `liga_miembros`

Relaciona usuarios con ligas.

Campos principales:

* `id`
* `liga_id`
* `usuario_id`
* `created_at`

---

## Importación de partidos desde OpenFootball

El proyecto incluye scripts para obtener los partidos del Mundial 2026 desde OpenFootball y generar un archivo SQL para Supabase.

Primero se puede probar la lectura de datos con:

```bash
node scripts/probar-openfootball.js
```

Luego se genera el SQL de importación:

```bash
node scripts/generar-sql-openfootball.js
```

Esto genera el archivo:

```txt
scripts/supabase-partidos-openfootball.sql
```

Ese SQL puede ejecutarse en el editor SQL de Supabase para insertar o actualizar los partidos en la tabla `partidos`.

El script también convierte los horarios entregados por OpenFootball a **hora de Chile** usando la zona horaria `America/Santiago`.

---

## Flujo de uso de la aplicación

```txt
1. El usuario se registra o inicia sesión.
2. Accede al inicio de la app.
3. Revisa partidos disponibles.
4. Selecciona un partido y realiza una predicción.
5. Crea una liga o se une a una existente mediante código.
6. Compite con otros usuarios en el ranking de la liga.
7. Revisa su perfil, puntos, predicciones y ligas.
```

---

## Cálculo de puntos

La app calcula puntos comparando la predicción del usuario con el resultado real del partido.

La lógica permite asignar puntos según el nivel de acierto de la predicción, por ejemplo:

* Resultado exacto.
* Tendencia correcta.
* Diferencia de goles.
* Predicción incorrecta.

El cálculo se realiza desde el servicio de predicciones y se utiliza en el perfil y ranking.

---

## Estado actual del proyecto

El proyecto se encuentra en etapa de **MVP funcional**.

Actualmente permite demostrar:

* Autenticación real.
* Usuarios distintos.
* Datos persistentes.
* Partidos cargados desde Supabase.
* Predicciones reales.
* Ligas reales.
* Ranking por liga.
* Conteo real de miembros.
* Importación de partidos desde una fuente externa.

---

## Limitaciones actuales

* OpenFootball no es una API de resultados en vivo.
* La actualización de partidos se realiza mediante script manual.
* El ranking actual funciona por liga, no como ranking global de toda la app.
* Algunas funciones pueden mejorarse visualmente para una versión final.
* La app todavía no está empaquetada como aplicación móvil nativa.
* Para resultados en vivo sería recomendable evaluar una API deportiva especializada en el futuro.

---

## Próximas mejoras posibles

* Filtros de partidos por grupo, fecha o estado.
* Pantallas de carga mientras se consultan datos.
* Mejoras visuales en la interfaz.
* Ranking global.
* Automatización de actualización de partidos.
* Integración con una API de resultados en vivo.
* Empaquetado con Capacitor para Android o iOS.
* Mayor control de permisos y seguridad en Supabase.
* Página de detalle de liga.
* Estadísticas avanzadas de usuario.

---

## Comandos útiles

Ejecutar la app:

```bash
ionic serve
```

Compilar el proyecto:

```bash
ionic build
```

Probar lectura de OpenFootball:

```bash
node scripts/probar-openfootball.js
```

Generar SQL de partidos:

```bash
node scripts/generar-sql-openfootball.js
```

---

## Autor

Proyecto desarrollado como MVP académico para una aplicación competitiva basada en el Mundial 2026.

---
