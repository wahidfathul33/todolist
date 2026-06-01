'use client'

import { useState } from 'react'
import { supabase, TodoInsert } from '@/lib/supabase'
import { X, Sparkles } from 'lucide-react'

interface AddTodoModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddTodoModal({ onClose, onSuccess }: AddTodoModalProps) {
  const [form, setForm] = useState<TodoInsert>({
    tanggal: new Date().toISOString().split('T')[0],
    kegiatan: '',
    keterangan: '',
    status: 'belum',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.kegiatan.trim()) {
      setError('Kegiatan tidak boleh kosong ya sayang~ 🌸')
      return
    }
    setLoading(true)
    setError('')

    const { error: supaErr } = await supabase.from('todos').insert([form])
    setLoading(false)

    if (supaErr) {
      setError('Waduh ada error: ' + supaErr.message)
    } else {
      onSuccess()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-pink-900/20 backdrop-blur-sm">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl bg-white rounded-3xl shadow-2xl shadow-pink-200/60 animate-bounce-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 to-rose-400 rounded-t-3xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h2 className="text-white font-bold text-lg">Tambah Kegiatan Baru</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Tanggal */}
          <div>
            <label className="block text-pink-700 font-semibold text-sm mb-1.5">
              📅 Tanggal
            </label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-400 focus:outline-none bg-pink-50 text-pink-800 font-medium transition-colors"
            />
          </div>

          {/* Kegiatan */}
          <div>
            <label className="block text-pink-700 font-semibold text-sm mb-1.5">
              ✨ Kegiatan
            </label>
            <input
              type="text"
              value={form.kegiatan}
              onChange={(e) => setForm({ ...form, kegiatan: e.target.value })}
              placeholder="Mau ngapain hari ini?"
              required
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-400 focus:outline-none bg-pink-50 text-pink-800 placeholder-pink-300 font-medium transition-colors"
            />
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-pink-700 font-semibold text-sm mb-1.5">
              📝 Keterangan
            </label>
            <textarea
              value={form.keterangan}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              placeholder="Detail kegiatan... (opsional)"
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-400 focus:outline-none bg-pink-50 text-pink-800 placeholder-pink-300 font-medium transition-colors resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-pink-700 font-semibold text-sm mb-2">
              🎀 Status
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, status: 'belum' })}
                className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all ${
                  form.status === 'belum'
                    ? 'bg-pink-400 text-white shadow-md shadow-pink-200'
                    : 'bg-pink-50 text-pink-400 border-2 border-pink-200'
                }`}
              >
                🌸 Belum
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, status: 'proses' })}
                className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all ${
                  form.status === 'proses'
                    ? 'bg-amber-400 text-white shadow-md shadow-amber-200'
                    : 'bg-amber-50 text-amber-400 border-2 border-amber-200'
                }`}
              >
                ⏳ Proses
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, status: 'selesai' })}
                className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all ${
                  form.status === 'selesai'
                    ? 'bg-emerald-400 text-white shadow-md shadow-emerald-200'
                    : 'bg-emerald-50 text-emerald-400 border-2 border-emerald-200'
                }`}
              >
                ✅ Selesai
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-rose-500 text-sm bg-rose-50 px-4 py-3 rounded-2xl">{error}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border-2 border-pink-200 text-pink-400 font-bold hover:bg-pink-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-60"
            >
              {loading ? '⏳ Menyimpan...' : '💾 Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
