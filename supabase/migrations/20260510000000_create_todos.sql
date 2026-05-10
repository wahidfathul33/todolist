-- Buat tabel todos di Supabase
-- Jalankan SQL ini di Supabase SQL Editor

CREATE TABLE todos (
  id BIGSERIAL PRIMARY KEY,
  tanggal DATE NOT NULL,
  kegiatan VARCHAR(255) NOT NULL,
  keterangan TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'belum' CHECK (status IN ('belum', 'proses', 'selesai')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Policy: izinkan semua operasi (untuk demo tanpa autentikasi)
CREATE POLICY "Allow all operations" ON todos
  FOR ALL
  USING (true)
  WITH CHECK (true);
