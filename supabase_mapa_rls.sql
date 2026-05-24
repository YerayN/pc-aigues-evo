-- ════════════════════════════════════════════════════════════════
-- ARREGLO RLS — tabla mapa_elementos
-- 
-- El error "new row violates row-level security policy" ocurre porque
-- la tabla tiene RLS activado pero sin políticas de escritura para
-- usuarios autenticados.
--
-- INSTRUCCIONES: SQL Editor → pega esto → Run
-- ════════════════════════════════════════════════════════════════

-- Borrar políticas anteriores si existían (para re-ejecutar sin error)
DROP POLICY IF EXISTS "mapa_select_publico"   ON mapa_elementos;
DROP POLICY IF EXISTS "mapa_select"           ON mapa_elementos;
DROP POLICY IF EXISTS "mapa_insert"           ON mapa_elementos;
DROP POLICY IF EXISTS "mapa_delete"           ON mapa_elementos;
DROP POLICY IF EXISTS "mapa_update"           ON mapa_elementos;

-- 1. LECTURA PÚBLICA — cualquiera puede ver el mapa (vecinos)
CREATE POLICY "mapa_select_publico"
  ON mapa_elementos FOR SELECT
  USING (true);

-- 2. INSERTAR — solo usuarios autenticados (voluntarios con sesión)
CREATE POLICY "mapa_insert"
  ON mapa_elementos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 3. ACTUALIZAR — solo usuarios autenticados
CREATE POLICY "mapa_update"
  ON mapa_elementos FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 4. ELIMINAR — solo usuarios autenticados
CREATE POLICY "mapa_delete"
  ON mapa_elementos FOR DELETE
  USING (auth.role() = 'authenticated');

-- Verificación: debe listar las 4 políticas nuevas
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'mapa_elementos';
