-- Skema todolist untuk Neon (Postgres)
-- Dipindahkan dari Supabase. RLS/policy Supabase tidak disertakan:
-- di Neon tidak ada PostgREST + anon key, akses lewat server (API route),
-- jadi policy "allow all" tidak punya arti lagi.

CREATE TABLE IF NOT EXISTS todos (
  id BIGSERIAL PRIMARY KEY,
  tanggal DATE NOT NULL,
  kegiatan VARCHAR(255) NOT NULL,
  keterangan TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'belum' CHECK (status IN ('belum', 'proses', 'selesai')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
  id BIGSERIAL PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  catatan TEXT,
  starred BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS links (
  id BIGSERIAL PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  starred BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger updated_at untuk notes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notes_updated_at ON notes;
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
