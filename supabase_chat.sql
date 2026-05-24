-- ════════════════════════════════════════════════════════════════
-- CHAT INTERNO — SQL para Supabase
-- 
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en supabase.com
-- 2. Haz clic en "SQL Editor" en el menú izquierdo
-- 3. Pega TODO este contenido y pulsa "Run"
-- 4. Después activa Realtime: Database → Replication → chat_mensajes ✅
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS chat_mensajes (
  id          bigserial PRIMARY KEY,
  canal       text NOT NULL DEFAULT 'general',
  autor       text NOT NULL,
  texto       text NOT NULL CHECK (char_length(texto) <= 500),
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_canal_fecha
  ON chat_mensajes(canal, created_at);

ALTER TABLE chat_mensajes REPLICA IDENTITY FULL;

ALTER TABLE chat_mensajes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_select" ON chat_mensajes;
DROP POLICY IF EXISTS "chat_insert" ON chat_mensajes;

CREATE POLICY "chat_select"
  ON chat_mensajes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "chat_insert"
  ON chat_mensajes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Verificacion: debe devolver 0
SELECT COUNT(*) FROM chat_mensajes;
