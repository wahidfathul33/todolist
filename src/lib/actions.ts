'use server'

import { db, type Todo, type TodoInsert, type TodoUpdate } from './db'
import type { Note, NoteInsert, NoteUpdate, Link, LinkInsert, LinkUpdate } from './db'

// Hasil dikembalikan sebagai objek (bukan throw) supaya UI bisa menampilkan
// pesannya. Error yang di-throw dari Server Action disensor Next.js di
// production jadi "An error occurred in the Server Components render", jadi
// pesan yang berguna harus dikirim sebagai nilai balik, bukan sebagai throw.
export type MutationResult = { error: string | null }
export type ReadResult<T> = { data: T; error: string | null }

const ok: MutationResult = { error: null }

// Error koneksi diterjemahkan ke bahasa manusia; sisanya diteruskan apa adanya
// supaya bug skema tetap kelihatan dan tidak tersamarkan jadi "database mati".
function describeDbError(e: unknown): string {
  if (!process.env.DATABASE_URL) {
    return 'DATABASE_URL belum diatur di environment server'
  }
  const msg = e instanceof Error ? e.message : String(e)
  if (
    /fetch failed|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET|ETIMEDOUT|socket hang up|Connection terminated/i.test(
      msg
    )
  ) {
    return 'Server database tidak bisa dihubungi'
  }
  // Host Neon yang salah tetap ter-resolve (wildcard DNS) dan proxy-nya
  // menjawab "password authentication failed" — jadi pesan ini TIDAK bisa
  // membedakan password salah dari host salah. Keduanya disebut supaya yang
  // host-nya basi tidak sia-sia mengecek password.
  if (/password authentication|authentication failed|role .* does not exist/i.test(msg)) {
    return 'Database menolak koneksi — periksa host dan password di DATABASE_URL'
  }
  if (/database .* does not exist/i.test(msg)) {
    return 'Nama database di DATABASE_URL tidak ada'
  }
  if (/permission denied/i.test(msg)) {
    return 'User database tidak punya izin untuk operasi ini'
  }
  if (/relation .* does not exist/i.test(msg)) {
    return 'Tabel belum ada di database'
  }
  return msg || 'Gagal menghubungi database'
}

const fail = (e: unknown): MutationResult => ({ error: describeDbError(e) })

// to_jsonb dipakai supaya Postgres yang merender nilainya: DATE jadi
// 'YYYY-MM-DD' dan TIMESTAMPTZ jadi ISO 8601 — format string yang sama
// seperti yang dulu dikirim Supabase, jadi komponen tidak perlu berubah.

async function selectTodos(): Promise<Todo[]> {
  const rows = await db()`
    SELECT to_jsonb(t) AS row
    FROM todos t
    ORDER BY t.tanggal DESC, t.created_at DESC
  `
  return rows.map((r) => r.row as Todo)
}

async function selectNotes(): Promise<Note[]> {
  const rows = await db()`
    SELECT to_jsonb(n) AS row
    FROM notes n
    ORDER BY n.starred DESC, n.updated_at DESC
  `
  return rows.map((r) => r.row as Note)
}

async function selectLinks(): Promise<Link[]> {
  const rows = await db()`
    SELECT to_jsonb(l) AS row
    FROM links l
    ORDER BY l.starred DESC, l.created_at DESC
  `
  return rows.map((r) => r.row as Link)
}

export async function getTodos(): Promise<ReadResult<Todo[]>> {
  try {
    return { data: await selectTodos(), error: null }
  } catch (e) {
    return { data: [], error: describeDbError(e) }
  }
}

export async function getNotes(): Promise<ReadResult<Note[]>> {
  try {
    return { data: await selectNotes(), error: null }
  } catch (e) {
    return { data: [], error: describeDbError(e) }
  }
}

export async function getLinks(): Promise<ReadResult<Link[]>> {
  try {
    return { data: await selectLinks(), error: null }
  } catch (e) {
    return { data: [], error: describeDbError(e) }
  }
}

// Satu roundtrip untuk load awal: Server Function dari client dikirim
// satu per satu, jadi tiga query digabung dan dijalankan paralel di server.
export async function getAll(): Promise<{
  todos: Todo[]
  notes: Note[]
  links: Link[]
  error: string | null
}> {
  try {
    const [todos, notes, links] = await Promise.all([selectTodos(), selectNotes(), selectLinks()])
    return { todos, notes, links, error: null }
  } catch (e) {
    return { todos: [], notes: [], links: [], error: describeDbError(e) }
  }
}

// --- Todos ---

export async function createTodo(input: TodoInsert): Promise<MutationResult> {
  try {
    await db()`
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
    await db()`
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
    await db()`DELETE FROM todos WHERE id = ${id}`
    return ok
  } catch (e) {
    return fail(e)
  }
}

// --- Notes ---

export async function createNote(input: NoteInsert): Promise<MutationResult> {
  try {
    await db()`
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
    await db()`
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
    await db()`UPDATE notes SET starred = NOT starred WHERE id = ${id}`
    return ok
  } catch (e) {
    return fail(e)
  }
}

export async function deleteNote(id: number): Promise<MutationResult> {
  try {
    await db()`DELETE FROM notes WHERE id = ${id}`
    return ok
  } catch (e) {
    return fail(e)
  }
}

// --- Links ---

export async function createLink(input: LinkInsert): Promise<MutationResult> {
  try {
    await db()`
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
    await db()`
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
    await db()`UPDATE links SET starred = NOT starred WHERE id = ${id}`
    return ok
  } catch (e) {
    return fail(e)
  }
}

export async function deleteLink(id: number): Promise<MutationResult> {
  try {
    await db()`DELETE FROM links WHERE id = ${id}`
    return ok
  } catch (e) {
    return fail(e)
  }
}
