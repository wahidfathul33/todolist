'use client'

import { Todo } from '@/lib/supabase'
import { Pencil, Trash2, Calendar, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface TodoCardProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onDelete: (id: number) => void
  onToggleStatus: (todo: Todo) => void
}

export default function TodoCard({ todo, onEdit, onDelete, onToggleStatus }: TodoCardProps) {
  const isSelesai = todo.status === 'selesai'

  const statusConfig = {
    belum:  { label: '🌸 Belum',   cls: 'bg-pink-100 text-pink-600 hover:bg-pink-200',       border: 'border-pink-100',   shadow: 'shadow-pink-100' },
    proses: { label: '⏳ Proses',  cls: 'bg-amber-100 text-amber-600 hover:bg-amber-200',    border: 'border-amber-100',  shadow: 'shadow-amber-100' },
    selesai:{ label: '✅ Selesai', cls: 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200', border: 'border-emerald-100', shadow: 'shadow-emerald-100' },
  } as const

  const cfg = statusConfig[todo.status]

  const formattedDate = (() => {
    try {
      return format(new Date(todo.tanggal + 'T00:00:00'), 'EEEE, d MMMM yyyy', { locale: id })
    } catch {
      return todo.tanggal
    }
  })()

  return (
    <div
      className={`relative bg-white rounded-3xl p-4 shadow-md transition-all animate-fade-in-up border-2 ${cfg.border} ${cfg.shadow}`}
    >
      {/* Status badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <button
          onClick={() => onToggleStatus(todo)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${cfg.cls}`}
        >
          {cfg.label}
        </button>

        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(todo)}
            className="w-8 h-8 rounded-xl bg-violet-100 hover:bg-violet-200 flex items-center justify-center transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-violet-500" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="w-8 h-8 rounded-xl bg-rose-100 hover:bg-rose-200 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          </button>
        </div>
      </div>

      {/* Kegiatan */}
      <h3
        className={`font-bold text-base mb-2 leading-snug ${
          isSelesai ? 'line-through text-gray-400' : 'text-pink-800'
        }`}
      >
        {todo.kegiatan}
      </h3>

      {/* Keterangan */}
      {todo.keterangan && (
        <div className="flex items-start gap-2 mb-2">
          <FileText className="w-3.5 h-3.5 text-pink-300 mt-0.5 flex-shrink-0" />
          <p className={`text-sm leading-relaxed ${isSelesai ? 'text-gray-400' : 'text-pink-600'}`}>
            {todo.keterangan}
          </p>
        </div>
      )}

      {/* Tanggal */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-pink-50">
        <Calendar className="w-3.5 h-3.5 text-pink-300 flex-shrink-0" />
        <span className="text-xs text-pink-400 font-medium">{formattedDate}</span>
      </div>
    </div>
  )
}
