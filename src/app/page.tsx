'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { supabase, Todo, Note, Link } from '@/lib/supabase'
import { Plus, Sparkles, ClipboardList, NotebookPen, Link2 } from 'lucide-react'
import AddTodoModal from '@/components/AddTodoModal'
import EditTodoModal from '@/components/EditTodoModal'
import TodoCard from '@/components/TodoCard'
import FilterBar from '@/components/FilterBar'
import AddNoteModal from '@/components/AddNoteModal'
import EditNoteModal from '@/components/EditNoteModal'
import NoteCard from '@/components/NoteCard'
import AddLinkModal from '@/components/AddLinkModal'
import EditLinkModal from '@/components/EditLinkModal'
import LinkCard from '@/components/LinkCard'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'todo' | 'note' | 'link'>('todo')

  // Todo state
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editTodo, setEditTodo] = useState<Todo | null>(null)
  const [filter, setFilter] = useState<'all' | 'belum' | 'proses' | 'selesai'>('all')
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  // Note state
  const [notes, setNotes] = useState<Note[]>([])
  const [notesLoading, setNotesLoading] = useState(true)
  const [showAddNote, setShowAddNote] = useState(false)
  const [editNote, setEditNote] = useState<Note | null>(null)
  const [noteDeleteConfirm, setNoteDeleteConfirm] = useState<number | null>(null)
  const [noteSearch, setNoteSearch] = useState('')

  // Link state
  const [links, setLinks] = useState<Link[]>([])
  const [linksLoading, setLinksLoading] = useState(true)
  const [showAddLink, setShowAddLink] = useState(false)
  const [editLink, setEditLink] = useState<Link | null>(null)
  const [linkDeleteConfirm, setLinkDeleteConfirm] = useState<number | null>(null)
  const [linkSearch, setLinkSearch] = useState('')

  const fetchTodos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTodos(data as Todo[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTodos()
    fetchNotes()
    fetchLinks()
  }, [])

  const fetchNotes = async () => {
    setNotesLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('starred', { ascending: false })
      .order('updated_at', { ascending: false })
    if (!error && data) setNotes(data as Note[])
    setNotesLoading(false)
  }

  const fetchLinks = async () => {
    setLinksLoading(true)
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('starred', { ascending: false })
      .order('created_at', { ascending: false })
    if (!error && data) setLinks(data as Link[])
    setLinksLoading(false)
  }

  const handleToggleNoteStar = async (note: Note) => {
    await supabase.from('notes').update({ starred: !note.starred }).eq('id', note.id)
    fetchNotes()
  }

  const handleToggleLinkStar = async (link: Link) => {
    await supabase.from('links').update({ starred: !link.starred }).eq('id', link.id)
    fetchLinks()
  }

  const handleDeleteNote = async (id: number) => {
    if (noteDeleteConfirm !== id) {
      setNoteDeleteConfirm(id)
      setTimeout(() => setNoteDeleteConfirm(null), 3000)
      return
    }
    await supabase.from('notes').delete().eq('id', id)
    setNoteDeleteConfirm(null)
    fetchNotes()
  }

  const handleDeleteLink = async (id: number) => {
    if (linkDeleteConfirm !== id) {
      setLinkDeleteConfirm(id)
      setTimeout(() => setLinkDeleteConfirm(null), 3000)
      return
    }
    await supabase.from('links').delete().eq('id', id)
    setLinkDeleteConfirm(null)
    fetchLinks()
  }

  const handleDelete = async (id: number) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
      return
    }
    await supabase.from('todos').delete().eq('id', id)
    setDeleteConfirm(null)
    fetchTodos()
  }

  const handleToggleStatus = async (todo: Todo) => {
    const cycle: Record<string, 'belum' | 'proses' | 'selesai'> = {
      belum: 'proses',
      proses: 'selesai',
      selesai: 'belum',
    }
    const newStatus = cycle[todo.status] ?? 'belum'
    await supabase.from('todos').update({ status: newStatus }).eq('id', todo.id)
    fetchTodos()
  }

  const filteredTodos = useMemo(() => {
    return todos.filter((t) => {
      const matchFilter = filter === 'all' || t.status === filter
      const matchSearch =
        search === '' ||
        t.kegiatan.toLowerCase().includes(search.toLowerCase()) ||
        (t.keterangan && t.keterangan.toLowerCase().includes(search.toLowerCase()))
      return matchFilter && matchSearch
    })
  }, [todos, filter, search])

  const filteredNotes = useMemo(() => {
    if (!noteSearch.trim()) return notes
    const q = noteSearch.toLowerCase()
    return notes.filter(
      (n) =>
        n.judul.toLowerCase().includes(q) ||
        (n.catatan && n.catatan.toLowerCase().includes(q))
    )
  }, [notes, noteSearch])

  const filteredLinks = useMemo(() => {
    if (!linkSearch.trim()) return links
    const q = linkSearch.toLowerCase()
    return links.filter(
      (l) =>
        l.judul.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q)
    )
  }, [links, linkSearch])

  const groupedTodos = useMemo(() => {
    const groups: Record<string, typeof filteredTodos> = {}
    for (const todo of filteredTodos) {
      const date = todo.tanggal ?? 'Tanpa Tanggal'
      if (!groups[date]) groups[date] = []
      groups[date].push(todo)
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [filteredTodos])

  const stats = useMemo(() => ({
    total: todos.length,
    belum: todos.filter((t) => t.status === 'belum').length,
    proses: todos.filter((t) => t.status === 'proses').length,
    selesai: todos.filter((t) => t.status === 'selesai').length,
  }), [todos])

  return (
    <main className="min-h-screen pb-24">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-pink-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-48 h-48 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-fuchsia-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full shadow-lg shadow-pink-300/50 mb-4 overflow-hidden">
            <Image
              src="/fita-logo.webp"
              alt="logo"
              width={64}
              height={64}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <h1 className="text-3xl font-extrabold text-pink-700 tracking-tight">Fita Todo List</h1>
          <p className="text-pink-400 text-sm mt-1 font-medium">Atur kegiatanmu dengan cantik ✨</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white rounded-2xl p-1 border-2 border-pink-100 shadow-sm mb-6">
          <button
            onClick={() => setActiveTab('todo')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'todo' ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-sm' : 'text-pink-400 hover:text-pink-600'}`}
          >
            <ClipboardList className="w-4 h-4" />
            Todo
          </button>
          <button
            onClick={() => setActiveTab('note')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'note' ? 'bg-gradient-to-r from-violet-400 to-purple-400 text-white shadow-sm' : 'text-violet-400 hover:text-violet-600'}`}
          >
            <NotebookPen className="w-4 h-4" />
            Catatan
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'link' ? 'bg-gradient-to-r from-sky-400 to-cyan-400 text-white shadow-sm' : 'text-sky-400 hover:text-sky-600'}`}
          >
            <Link2 className="w-4 h-4" />
            Link
          </button>
        </div>

        {activeTab === 'todo' && (<>
        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="bg-white rounded-2xl p-3 text-center border-2 border-pink-100 shadow-sm">
            <div className="text-xl font-extrabold text-pink-600">{stats.total}</div>
            <div className="text-xs text-pink-400 font-semibold">Total</div>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center border-2 border-pink-200 shadow-sm">
            <div className="text-xl font-extrabold text-pink-500">{stats.belum}</div>
            <div className="text-xs text-pink-400 font-semibold">Belum</div>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center border-2 border-amber-100 shadow-sm">
            <div className="text-xl font-extrabold text-amber-500">{stats.proses}</div>
            <div className="text-xs text-amber-400 font-semibold">Proses</div>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center border-2 border-emerald-100 shadow-sm">
            <div className="text-xl font-extrabold text-emerald-500">{stats.selesai}</div>
            <div className="text-xs text-emerald-400 font-semibold">Selesai</div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-5">
          <FilterBar
            filter={filter}
            search={search}
            onFilterChange={setFilter}
            onSearchChange={setSearch}
          />
        </div>

        {/* Delete confirm banner */}
        {deleteConfirm !== null && (
          <div className="mb-4 bg-rose-50 border-2 border-rose-200 rounded-2xl px-4 py-3 text-center animate-bounce-in">
            <p className="text-rose-600 text-sm font-semibold">Ketuk hapus lagi untuk konfirmasi 🗑️</p>
          </div>
        )}

        {/* Todo list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
            <p className="text-pink-400 font-medium text-sm">Lagi loading ya sayang...</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in-up">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
              <ClipboardList className="w-9 h-9 text-pink-300" />
            </div>
            <div className="text-center">
              <p className="text-pink-600 font-bold text-base">
                {search || filter !== 'all' ? 'Tidak ada yang cocok~' : 'Belum ada kegiatan nih!'}
              </p>
              <p className="text-pink-400 text-sm mt-1">
                {search || filter !== 'all'
                  ? 'Coba ubah filter atau pencarian kamu'
                  : 'Yuk tambah kegiatan pertamamu! 🌸'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {groupedTodos.map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-xs font-bold text-pink-500 bg-pink-100 px-3 py-1 rounded-full">
                    {date === 'Tanpa Tanggal' ? 'Tanpa Tanggal' : new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <div className="flex-1 h-px bg-pink-100" />
                </div>
                <div className="space-y-3">
                  {items.map((todo) => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      onEdit={setEditTodo}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {stats.total > 0 && (
          <div className="mt-6 bg-white rounded-2xl p-4 border-2 border-pink-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span className="text-sm font-bold text-pink-600">Progress</span>
              </div>
              <span className="text-sm font-bold text-pink-600">
                {Math.round((stats.selesai / stats.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-pink-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all duration-500"
                style={{ width: `${(stats.selesai / stats.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-pink-400 mt-2 text-center font-medium">
              {stats.selesai === stats.total
                ? '🎉 Semua selesai! Kamu luar biasa!'
                : `${stats.selesai} dari ${stats.total} kegiatan selesai`}
            </p>
          </div>
        )}
        </>)}

        {activeTab === 'note' && (<>
        {/* Note search */}
        <div className="mb-5">
          <div className="relative">
            <input
              type="text"
              value={noteSearch}
              onChange={(e) => setNoteSearch(e.target.value)}
              placeholder="Cari judul atau catatan..."
              className="w-full px-4 py-3 pl-10 rounded-2xl border-2 border-violet-100 focus:border-violet-400 focus:outline-none bg-white text-violet-800 font-medium transition-colors text-sm"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
          </div>
        </div>

        {/* Note delete confirm */}
        {noteDeleteConfirm !== null && (
          <div className="mb-4 bg-rose-50 border-2 border-rose-200 rounded-2xl px-4 py-3 text-center animate-bounce-in">
            <p className="text-rose-600 text-sm font-semibold">Ketuk hapus lagi untuk konfirmasi 🗑️</p>
          </div>
        )}

        {/* Notes list */}
        {notesLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-violet-400 font-medium text-sm">Lagi loading ya sayang...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in-up">
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center">
              <NotebookPen className="w-9 h-9 text-violet-300" />
            </div>
            <div className="text-center">
              <p className="text-violet-600 font-bold text-base">
                {noteSearch ? 'Tidak ada yang cocok~' : 'Belum ada catatan nih!'}
              </p>
              <p className="text-violet-400 text-sm mt-1">
                {noteSearch ? 'Coba ubah pencarian kamu' : 'Yuk tulis catatan pertamamu! 📝'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={setEditNote}
                onDelete={handleDeleteNote}
                onToggleStar={handleToggleNoteStar}
              />
            ))}
          </div>
        )}
        </>)}

        {activeTab === 'link' && (<>
        {/* Link search */}
        <div className="mb-5">
          <div className="relative">
            <input
              type="text"
              value={linkSearch}
              onChange={(e) => setLinkSearch(e.target.value)}
              placeholder="Cari judul atau URL..."
              className="w-full px-4 py-3 pl-10 rounded-2xl border-2 border-sky-100 focus:border-sky-400 focus:outline-none bg-white text-sky-800 font-medium transition-colors text-sm"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
          </div>
        </div>

        {/* Link delete confirm */}
        {linkDeleteConfirm !== null && (
          <div className="mb-4 bg-rose-50 border-2 border-rose-200 rounded-2xl px-4 py-3 text-center animate-bounce-in">
            <p className="text-rose-600 text-sm font-semibold">Ketuk hapus lagi untuk konfirmasi 🗑️</p>
          </div>
        )}

        {/* Links list */}
        {linksLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
            <p className="text-sky-400 font-medium text-sm">Lagi loading ya sayang...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in-up">
            <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center">
              <Link2 className="w-9 h-9 text-sky-300" />
            </div>
            <div className="text-center">
              <p className="text-sky-600 font-bold text-base">
                {linkSearch ? 'Tidak ada yang cocok~' : 'Belum ada link nih!'}
              </p>
              <p className="text-sky-400 text-sm mt-1">
                {linkSearch ? 'Coba ubah pencarian kamu' : 'Yuk simpan link favoritmu! 🔗'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onEdit={setEditLink}
                onDelete={handleDeleteLink}
                onToggleStar={handleToggleLinkStar}
              />
            ))}
          </div>
        )}
        </>)}
      </div>

      {/* FAB - Add button */}
      {activeTab === 'todo' ? (
        <button
          onClick={() => setShowAdd(true)}
          className="fixed bottom-8 right-1/2 translate-x-1/2 sm:right-8 sm:translate-x-0 flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4 rounded-full shadow-2xl shadow-pink-400/50 font-bold text-sm hover:shadow-pink-500/60 hover:from-pink-600 hover:to-rose-600 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Tambah Kegiatan
        </button>
      ) : activeTab === 'note' ? (
        <button
          onClick={() => setShowAddNote(true)}
          className="fixed bottom-8 right-1/2 translate-x-1/2 sm:right-8 sm:translate-x-0 flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-6 py-4 rounded-full shadow-2xl shadow-violet-400/50 font-bold text-sm hover:shadow-violet-500/60 hover:from-violet-600 hover:to-purple-600 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Tambah Catatan
        </button>
      ) : (
        <button
          onClick={() => setShowAddLink(true)}
          className="fixed bottom-8 right-1/2 translate-x-1/2 sm:right-8 sm:translate-x-0 flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-6 py-4 rounded-full shadow-2xl shadow-sky-400/50 font-bold text-sm hover:shadow-sky-500/60 hover:from-sky-600 hover:to-cyan-600 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Tambah Link
        </button>
      )}

      {/* Modals */}
      {showAdd && (
        <AddTodoModal
          onClose={() => setShowAdd(false)}
          onSuccess={fetchTodos}
        />
      )}
      {editTodo && (
        <EditTodoModal
          todo={editTodo}
          onClose={() => setEditTodo(null)}
          onSuccess={fetchTodos}
        />
      )}
      {showAddNote && (
        <AddNoteModal
          onClose={() => setShowAddNote(false)}
          onSuccess={fetchNotes}
        />
      )}
      {editNote && (
        <EditNoteModal
          note={editNote}
          onClose={() => setEditNote(null)}
          onSuccess={fetchNotes}
        />
      )}
      {showAddLink && (
        <AddLinkModal
          onClose={() => setShowAddLink(false)}
          onSuccess={fetchLinks}
        />
      )}
      {editLink && (
        <EditLinkModal
          link={editLink}
          onClose={() => setEditLink(null)}
          onSuccess={fetchLinks}
        />
      )}
    </main>
  )
}
