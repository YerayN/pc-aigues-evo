-- ════════════════════════════════════════════════════════════════
-- POLÍTICAS RLS — Protección Civil Aigües
--
-- EJECUTAR EN: Supabase Dashboard → SQL Editor → New query → Run
--
-- Qué hace:
--   - Voluntario: solo puede ver/editar sus propios datos (horas, préstamos)
--   - Jefe/Admin: puede gestionar servicios, inventario, documentos, anuncios
--   - Público: solo puede ver el mapa y la alerta pública
--
-- Nota: Usa tu columna "rol" de la tabla perfiles tal cual está.
--       NO modifica ninguna tabla existente.
-- ════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 0. FUNCIÓN HELPER: obtiene el rol del usuario actual
--    (se usa en todas las políticas de abajo)
-- ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT rol FROM public.perfiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────────────
-- 1. perfiles — cada usuario ve el suyo, el jefe ve todos
-- ───────────────────────────────────────────────────────────────
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "perfiles_select_own"    ON perfiles;
DROP POLICY IF EXISTS "perfiles_update_own"    ON perfiles;
DROP POLICY IF EXISTS "perfiles_select_jefe"   ON perfiles;

CREATE POLICY "perfiles_select_own"  ON perfiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "perfiles_update_own" ON perfiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "perfiles_select_jefe" ON perfiles FOR SELECT
  USING (public.get_my_role() IN ('jefe', 'admin'));


-- ───────────────────────────────────────────────────────────────
-- 2. servicios — todos leen, solo jefe escribe
-- ───────────────────────────────────────────────────────────────
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "servicios_select"        ON servicios;
DROP POLICY IF EXISTS "servicios_write_jefe"    ON servicios;

CREATE POLICY "servicios_select" ON servicios FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "servicios_write_jefe" ON servicios FOR ALL
  USING (public.get_my_role() IN ('jefe', 'admin'))
  WITH CHECK (public.get_my_role() IN ('jefe', 'admin'));


-- ───────────────────────────────────────────────────────────────
-- 3. registro_horas — voluntario solo ve los suyos
-- ───────────────────────────────────────────────────────────────
ALTER TABLE registro_horas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "registro_horas_select_own"   ON registro_horas;
DROP POLICY IF EXISTS "registro_horas_select_jefe"  ON registro_horas;
DROP POLICY IF EXISTS "registro_horas_insert_own"   ON registro_horas;
DROP POLICY IF EXISTS "registro_horas_update_own"   ON registro_horas;

CREATE POLICY "registro_horas_select_own" ON registro_horas FOR SELECT
  USING (usuario = (SELECT nombre FROM perfiles WHERE id = auth.uid()));

CREATE POLICY "registro_horas_select_jefe" ON registro_horas FOR SELECT
  USING (public.get_my_role() IN ('jefe', 'admin'));

CREATE POLICY "registro_horas_insert_own" ON registro_horas FOR INSERT
  WITH CHECK (usuario = (SELECT nombre FROM perfiles WHERE id = auth.uid()));

CREATE POLICY "registro_horas_update_own" ON registro_horas FOR UPDATE
  USING (usuario = (SELECT nombre FROM perfiles WHERE id = auth.uid()));


-- ───────────────────────────────────────────────────────────────
-- 4. partes_incidencia — cualquiera crea, solo jefe lee
-- ───────────────────────────────────────────────────────────────
ALTER TABLE partes_incidencia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "partes_insert"           ON partes_incidencia;
DROP POLICY IF EXISTS "partes_select_jefe"      ON partes_incidencia;

CREATE POLICY "partes_insert" ON partes_incidencia FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "partes_select_jefe" ON partes_incidencia FOR SELECT
  USING (public.get_my_role() IN ('jefe', 'admin'));


-- ───────────────────────────────────────────────────────────────
-- 5. inventario_material — todos leen, solo jefe gestiona
-- ───────────────────────────────────────────────────────────────
ALTER TABLE inventario_material ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inventario_material_select"       ON inventario_material;
DROP POLICY IF EXISTS "inventario_material_write_jefe"   ON inventario_material;

CREATE POLICY "inventario_material_select" ON inventario_material FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "inventario_material_write_jefe" ON inventario_material FOR ALL
  USING (public.get_my_role() IN ('jefe', 'admin'))
  WITH CHECK (public.get_my_role() IN ('jefe', 'admin'));


-- ───────────────────────────────────────────────────────────────
-- 6. inventario_prestamos — voluntario solo los suyos
-- ───────────────────────────────────────────────────────────────
ALTER TABLE inventario_prestamos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prestamos_select_own"   ON inventario_prestamos;
DROP POLICY IF EXISTS "prestamos_select_jefe"  ON inventario_prestamos;
DROP POLICY IF EXISTS "prestamos_insert_own"   ON inventario_prestamos;
DROP POLICY IF EXISTS "prestamos_update_own"   ON inventario_prestamos;
DROP POLICY IF EXISTS "prestamos_jefe_all"     ON inventario_prestamos;

CREATE POLICY "prestamos_select_own" ON inventario_prestamos FOR SELECT
  USING (usuario = (SELECT nombre FROM perfiles WHERE id = auth.uid()));

CREATE POLICY "prestamos_select_jefe" ON inventario_prestamos FOR SELECT
  USING (public.get_my_role() IN ('jefe', 'admin'));

CREATE POLICY "prestamos_insert_own" ON inventario_prestamos FOR INSERT
  WITH CHECK (usuario = (SELECT nombre FROM perfiles WHERE id = auth.uid()));

CREATE POLICY "prestamos_update_own" ON inventario_prestamos FOR UPDATE
  USING (usuario = (SELECT nombre FROM perfiles WHERE id = auth.uid()));

CREATE POLICY "prestamos_jefe_all" ON inventario_prestamos FOR ALL
  USING (public.get_my_role() IN ('jefe', 'admin'))
  WITH CHECK (public.get_my_role() IN ('jefe', 'admin'));


-- ───────────────────────────────────────────────────────────────
-- 7. documentos — todos leen, solo jefe gestiona
-- ───────────────────────────────────────────────────────────────
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documentos_select"       ON documentos;
DROP POLICY IF EXISTS "documentos_write_jefe"   ON documentos;

CREATE POLICY "documentos_select" ON documentos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "documentos_write_jefe" ON documentos FOR ALL
  USING (public.get_my_role() IN ('jefe', 'admin'))
  WITH CHECK (public.get_my_role() IN ('jefe', 'admin'));


-- ───────────────────────────────────────────────────────────────
-- 8. anuncios — todos leen, solo jefe publica
-- ───────────────────────────────────────────────────────────────
ALTER TABLE anuncios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anuncios_select"       ON anuncios;
DROP POLICY IF EXISTS "anuncios_write_jefe"   ON anuncios;

CREATE POLICY "anuncios_select" ON anuncios FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "anuncios_write_jefe" ON anuncios FOR ALL
  USING (public.get_my_role() IN ('jefe', 'admin'))
  WITH CHECK (public.get_my_role() IN ('jefe', 'admin'));


-- ───────────────────────────────────────────────────────────────
-- 9. alerta_publica — lectura pública, escritura jefe
-- ───────────────────────────────────────────────────────────────
ALTER TABLE alerta_publica ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "alerta_select_publico"  ON alerta_publica;
DROP POLICY IF EXISTS "alerta_write_jefe"      ON alerta_publica;

CREATE POLICY "alerta_select_publico" ON alerta_publica FOR SELECT
  USING (true);

CREATE POLICY "alerta_write_jefe" ON alerta_publica FOR ALL
  USING (public.get_my_role() IN ('jefe', 'admin'))
  WITH CHECK (public.get_my_role() IN ('jefe', 'admin'));


-- ════════════════════════════════════════════════════════════════
-- VERIFICACIÓN: deberían aparecer las políticas creadas
-- ════════════════════════════════════════════════════════════════
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
