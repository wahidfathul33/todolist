'use server'

import { sql, type Todo, type TodoInsert, type TodoUpdate } from './db'
import type { Note, NoteInsert, NoteUpdate, Link, LinkInsert, LinkUpdate } from './db'

// Hasil mutasi dikembalikan sebagai objek (bukan throw) supaya modal bisa
// menampilkan pesan error apa adanya, seperti sebelumnya dengan Supabase.
export type MutationResult = { error: string | null }

const ok: MutationResult = { error: null }

const fail = (e: unknown): MutationResult => ({
  error: e instanceof Error ? e.message : 'Gagal menghubungi database',
})

// to_jsonb dipakai supaya Postgres yang merender nilainya: DATE jadi
// 'YYYY-MM-DD' dan TIMESTAMPTZ jadi ISO 8601 — format string yang sama
// seperti yang dulu dikirim Supabase, jadi komponen tidak perlu berubah.

export async function getTodos(): Promise<Todo[]> {
  const rows = await sql`
    SELECT to_jsonb(t) AS row
    FROM todos t
    ORDER BY t.tanggal DESC, t.created_at DESC
  `
  return rows.map((r) => r.row as Todo)
}

export async function getNotes(): Promise<Note[]> {
  const rows = await sql`
    SELECT to_jsonb(n) AS row
    FROM notes n
    ORDER BY n.starred DESC, n.updated_at DESC
  `
  return rows.map((r) => r.row as Note)
}

export async function getLinks(): Promise<Link[]> {
  const rows = await sql`
    SELECT to_jsonb(l) AS row
    FROM links l
    ORDER BY l.starred DESC, l.created_at DESC
  `
  return rows.map((r) => r.row as Link)
}

// Satu roundtrip untuk load awal: Server Function dari client dikirim
// satu per satu, jadi tiga query digabung dan dijalankan paralel di server.
export async function getAll(): Promise<{ todos: Todo[]; notes: Note[]; links: Link[] }> {
  const [todos, notes, links] = await Promise.all([getTodos(), getNotes(), getLinks()])
  return { todos, notes, links }
}

// --- Todos ---

export async function createTodo(input: TodoInsert): Promise<MutationResult> {
  try {
    await sql`
      INSERT INTO todos (tanggal, kegiatan, keterangan, status)
      VALUES (${input.tanggal}::date, ${input.kegiatan}, ${input.keterangan ?? null}, ${input.status})
    `
    return ok
  } catch (e) {
    return fail(e)
  }
}

// COALESCE: kolom yang tidak dikirim (undefined) dibiarkan apa adanya.
export async function updateTodo(id: number, patch: TodoUpdate): Promise<MutationResult> {
  try {
    await sql`
      UPDATE todos SET
        tanggal    = COALESCE(${patch.tanggal ?? null}::date, tanggal),
        kegiatan   = COALESCE(${patch.kegiatan ?? null}::text, kegiatan),
        keterangan = COALESCE(${patch.keterangan ?? null}::text, keterangan),
        status     = COALESCE(${patch.status ?? null}::text, status)
      WHERE id = ${id}
    `
    return ok
  } catch (e) {
    return fail(e)
  }
}

export async function deleteTodo(id: number): Promise<MutationResult> {
  try {
    await sql`DELETE FROM todos WHERE id = ${id}`
    return ok
  } catch (e) {
    return fail(e)
  }
}

// --- Notes ---

export async function createNote(input: NoteInsert): Promise<MutationResult> {
  try {
    await sql`
      INSERT INTO notes (judul, catatan, starred)
      VALUES (${input.judul}, ${input.catatan ?? null}, ${input.starred ?? false})
    `
    return ok
  } catch (e) {
    return fail(e)
  }
}

export async function updateNote(id: number, patch: NoteUpdate): Promise<MutationResult> {
  try {
    await sql`
      UPDATE notes SET
        judul   = COALESCE(${patch.judul ?? null}::text, judul),
        catatan = COALESCE(${patch.catatan ?? null}::text, catatan),
        starred = COALESCE(${patch.starred ?? null}::boolean, starred)
      WHERE id = ${id}
    `
    return ok
  } catch (e) {
    return fail(e)
  }
}

// Dibalik langsung di SQL supaya tidak bergantung nilai yang sudah basi di client.
export async function toggleNoteStar(id: number): Promise<MutationResult> {
  try {
    await sql`UPDATE notes SET starred = NOT starred WHERE id = ${id}`
    return ok
  } catch (e) {
    return fail(e)
  }
}

export async function deleteNote(id: number): Promise<MutationResult> {
  try {
    await sql`DELETE FROM notes WHERE id = ${id}`
    return ok
  } catch (e) {
    return fail(e)
  }
}

// --- Links ---

export async function createLink(input: LinkInsert): Promise<MutationResult> {
  try {
    await sql`
      INSERT INTO links (judul, url, starred)
      VALUES (${input.judul}, ${input.url}, ${input.starred ?? false})
    `
    return ok
  } catch (e) {
    return fail(e)
  }
}

export async function updateLink(id: number, patch: LinkUpdate): Promise<MutationResult> {
  try {
    await sql`
      UPDATE links SET
        judul   = COALESCE(${patch.judul ?? null}::text, judul),
        url     = COALESCE(${patch.url ?? null}::text, url),
        starred = COALESCE(${patch.starred ?? null}::boolean, starred)
      WHERE id = ${id}
    `
    return ok
  } catch (e) {
    return fail(e)
  }
}

export async function toggleLinkStar(id: number): Promise<MutationResult> {
  try {
    await sql`UPDATE links SET starred = NOT starred WHERE id = ${id}`
    return ok
  } catch (e) {
    return fail(e)
  }
}

export async function deleteLink(id: number): Promise<MutationResult> {
  try {
    await sql`DELETE FROM links WHERE id = ${id}`
    return ok
  } catch (e) {
    return fail(e)
  }
}
