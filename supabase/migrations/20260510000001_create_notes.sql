-- Buat tabel notes di Supabase
-- Jalankan SQL ini di Supabase SQL Editor

CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy: izinkan semua operasi (untuk demo tanpa autentikasi)
CREATE POLICY "Allow all operations" ON notes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger untuk update updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
