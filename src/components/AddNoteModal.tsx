'use client'

import { useState } from 'react'
import { supabase, NoteInsert } from '@/lib/supabase'
import { X, NotebookPen } from 'lucide-react'

interface AddNoteModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddNoteModal({ onClose, onSuccess }: AddNoteModalProps) {
  const [form, setForm] = useState<NoteInsert>({ judul: '', catatan: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.judul.trim()) {
      setError('Judul tidak boleh kosong ya~ 📝')
      return
    }
    setLoading(true)
    setError('')
    const { error: supaErr } = await supabase.from('notes').insert([form])
    setLoading(false)
    if (supaErr) {
      setError('Waduh ada error: ' + supaErr.message)
    } else {
      onSuccess()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-violet-900/20 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-violet-200/60 animate-bounce-in">
        <div className="bg-gradient-to-r from-violet-400 to-purple-400 rounded-t-3xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NotebookPen className="w-5 h-5 text-white" />
            <h2 className="text-white font-bold text-lg">Catatan Baru</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-violet-700 font-semibold text-sm mb-1.5">📝 Judul</label>
            <input
              type="text"
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              placeholder="Judul catatan..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-violet-100 focus:border-violet-400 focus:outline-none bg-violet-50 text-violet-800 font-medium transition-colors"
            />
          </div>

          <div>
            <label className="block text-violet-700 font-semibold text-sm mb-1.5">💜 Catatan</label>
            <textarea
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              placeholder="Tulis catatanmu di sini..."
              rows={5}
              className="w-full px-4 py-3 rounded-2xl border-2 border-violet-100 focus:border-violet-400 focus:outline-none bg-violet-50 text-violet-800 font-medium transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-rose-500 text-sm font-medium bg-rose-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border-2 border-violet-200 text-violet-500 font-bold hover:bg-violet-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold hover:from-violet-600 hover:to-purple-600 transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? 'Menyimpan...' : 'Simpan 💜'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
