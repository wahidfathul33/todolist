import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL!)

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
