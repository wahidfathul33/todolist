-- Tambah kolom starred ke tabel notes
-- Jalankan SQL ini di Supabase SQL Editor

ALTER TABLE notes ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT false;
