'use client'

import { useState } from 'react'
import { supabase, Link, LinkUpdate } from '@/lib/supabase'
import { X, Link2 } from 'lucide-react'

interface EditLinkModalProps {
  link: Link
  onClose: () => void
  onSuccess: () => void
}

export default function EditLinkModal({ link, onClose, onSuccess }: EditLinkModalProps) {
  const [form, setForm] = useState<LinkUpdate>({ judul: link.judul, url: link.url })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.judul?.trim()) {
      setError('Judul tidak boleh kosong ya~ 🔗')
      return
    }
    if (!form.url?.trim()) {
      setError('URL tidak boleh kosong ya~ 🔗')
      return
    }
    let url = form.url.trim()
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url
    }
    setLoading(true)
    setError('')
    const { error: supaErr } = await supabase.from('links').update({ ...form, url }).eq('id', link.id)
    setLoading(false)
    if (supaErr) {
      setError('Waduh ada error: ' + supaErr.message)
    } else {
      onSuccess()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-sky-900/20 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-sky-200/60 animate-bounce-in">
        <div className="bg-gradient-to-r from-sky-400 to-cyan-400 rounded-t-3xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-white" />
            <h2 className="text-white font-bold text-lg">Edit Link</h2>
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
            <label className="block text-sky-700 font-semibold text-sm mb-1.5">🔗 Judul</label>
            <input
              type="text"
              value={form.judul ?? ''}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              placeholder="Nama link..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-sky-100 focus:border-sky-400 focus:outline-none bg-sky-50 text-sky-800 font-medium transition-colors"
            />
          </div>

          <div>
            <label className="block text-sky-700 font-semibold text-sm mb-1.5">🌐 URL</label>
            <input
              type="text"
              value={form.url ?? ''}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-sky-100 focus:border-sky-400 focus:outline-none bg-sky-50 text-sky-800 font-medium transition-colors"
            />
          </div>

          {error && (
            <p className="text-rose-500 text-sm font-medium bg-rose-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border-2 border-sky-200 text-sky-500 font-bold hover:bg-sky-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:from-sky-600 hover:to-cyan-600 transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? 'Menyimpan...' : 'Simpan 🔗'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
