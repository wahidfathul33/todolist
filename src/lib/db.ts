import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

let client: NeonQueryFunction<false, false> | null = null

// Client dibuat saat pertama dipakai, bukan saat modul di-import. Kalau
// DATABASE_URL hilang atau salah bentuk, error-nya jatuh di dalam try/catch
// action sehingga bisa ditampilkan sebagai notifikasi — bukan meledak waktu
// import dan melewati semua penanganan error.
export function db(): NeonQueryFunction<false, false> {
  if (!client) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL belum diatur di environment server')
    client = neon(url)
  }
  return client
}

export type Todo = {
  id: number
  tanggal: string
  kegiatan: string
  keterangan: string
  status: 'belum' | 'proses' | 'selesai'
  created_at: string
}

export type Status = 'belum' | 'proses' | 'selesai'
export type TodoInsert = Omit<Todo, 'id' | 'created_at'>
export type TodoUpdate = Partial<TodoInsert>

export type Note = {
  id: number
  judul: string
  catatan: string
  starred: boolean
  created_at: string
  updated_at: string
}
export type NoteInsert = Omit<Note, 'id' | 'created_at' | 'updated_at'>
export type NoteUpdate = Partial<NoteInsert>

export type Link = {
  id: number
  judul: string
  url: string
  starred: boolean
  created_at: string
}
export type LinkInsert = Omit<Link, 'id' | 'created_at'>
export type LinkUpdate = Partial<LinkInsert>
