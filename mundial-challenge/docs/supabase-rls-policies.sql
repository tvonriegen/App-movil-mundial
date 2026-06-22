-- =========================================================
-- Mundial Challenge 2026
-- Políticas RLS iniciales para Supabase
-- =========================================================

-- =========================
-- USUARIOS
-- =========================

create policy "Usuarios pueden ver su propio perfil"
on public.usuarios
for select
to authenticated
using (auth.uid() = id);

create policy "Usuarios pueden crear su propio perfil"
on public.usuarios
for insert
to authenticated
with check (auth.uid() = id);

create policy "Usuarios pueden actualizar su propio perfil"
on public.usuarios
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);


-- =========================
-- PARTIDOS
-- =========================

create policy "Usuarios autenticados pueden ver partidos"
on public.partidos
for select
to authenticated
using (true);


-- =========================
-- LIGAS
-- =========================

create policy "Usuarios autenticados pueden ver ligas"
on public.ligas
for select
to authenticated
using (true);

create policy "Usuarios pueden crear ligas"
on public.ligas
for insert
to authenticated
with check (auth.uid() = creador_id);

create policy "Creadores pueden actualizar sus ligas"
on public.ligas
for update
to authenticated
using (auth.uid() = creador_id)
with check (auth.uid() = creador_id);


-- =========================
-- LIGA MIEMBROS
-- =========================

create policy "Usuarios pueden ver miembros de sus ligas"
on public.liga_miembros
for select
to authenticated
using (
  usuario_id = auth.uid()
  or exists (
    select 1
    from public.liga_miembros lm
    where lm.liga_id = liga_miembros.liga_id
    and lm.usuario_id = auth.uid()
  )
);

create policy "Usuarios pueden unirse a ligas"
on public.liga_miembros
for insert
to authenticated
with check (auth.uid() = usuario_id);

create policy "Usuarios pueden salir de sus ligas"
on public.liga_miembros
for delete
to authenticated
using (auth.uid() = usuario_id);


-- =========================
-- PREDICCIONES
-- =========================

create policy "Usuarios pueden ver sus predicciones"
on public.predicciones
for select
to authenticated
using (auth.uid() = usuario_id);

create policy "Usuarios pueden crear sus predicciones"
on public.predicciones
for insert
to authenticated
with check (auth.uid() = usuario_id);

create policy "Usuarios pueden actualizar sus predicciones"
on public.predicciones
for update
to authenticated
using (auth.uid() = usuario_id)
with check (auth.uid() = usuario_id);

create policy "Usuarios pueden eliminar sus predicciones"
on public.predicciones
for delete
to authenticated
using (auth.uid() = usuario_id);