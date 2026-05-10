-- Buat tabel links di Supabase
-- Jalankan SQL ini di Supabase SQL Editor

CREATE TABLE links (
  id BIGSERIAL PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  starred BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Policy: izinkan semua operasi (untuk demo tanpa autentikasi)
CREATE POLICY "Allow all operations" ON links
  FOR ALL
  USING (true)
  WITH CHECK (true);
