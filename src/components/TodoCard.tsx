'use client'

import { useState } from 'react'
import { Todo } from '@/lib/supabase'
import { Pencil, Trash2, Calendar, FileText, ChevronDown } from 'lucide-react'
import RichText from '@/components/RichText'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface TodoCardProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onDelete: (id: number) => void
  onToggleStatus: (todo: Todo) => void
}

export default function TodoCard({ todo, onEdit, onDelete, onToggleStatus }: TodoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
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
      className={`relative bg-white rounded-3xl shadow-md transition-all animate-fade-in-up border-2 ${cfg.border} ${cfg.shadow}`}
    >
      {/* Header — always visible, clickable to toggle */}
      <div
        className="flex items-center gap-2 p-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <button
          onClick={e => { e.stopPropagation(); onToggleStatus(todo) }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${cfg.cls}`}
        >
          {cfg.label}
        </button>

        <h3
          className={`flex-1 font-bold text-base leading-snug ${
            isSelesai ? 'line-through text-gray-400' : 'text-pink-800'
          }`}
        >
          {todo.kegiatan}
        </h3>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onEdit(todo) }}
            className="w-8 h-8 rounded-xl bg-violet-100 hover:bg-violet-200 flex items-center justify-center transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-violet-500" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(todo.id) }}
            className="w-8 h-8 rounded-xl bg-rose-100 hover:bg-rose-200 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          </button>
          <ChevronDown
            className={`w-4 h-4 text-pink-300 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Detail — visible when expanded */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-pink-50">
          {todo.keterangan && (
            <div className="flex items-start gap-2 mt-3">
              <FileText className="w-3.5 h-3.5 text-pink-300 mt-0.5 flex-shrink-0" />
              <RichText
                text={todo.keterangan}
                className={`text-sm leading-relaxed ${isSelesai ? 'text-gray-400' : 'text-pink-600'}`}
                linkClassName={`break-all hover:underline ${isSelesai ? 'text-gray-400' : 'text-pink-400'}`}
              />
            </div>
          )}
          <div className="flex items-center gap-2 mt-3">
            <Calendar className="w-3.5 h-3.5 text-pink-300 flex-shrink-0" />
            <span className="text-xs text-pink-400 font-medium">{formattedDate}</span>
          </div>
        </div>
      )}
    </div>
  )
}
