'use client'

import { Note } from '@/lib/supabase'
import { Pencil, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: number) => void
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(note.updated_at), { addSuffix: true, locale: id })
    } catch {
      return ''
    }
  })()

  return (
    <div className="bg-white rounded-3xl p-4 shadow-md border-2 border-violet-100 shadow-violet-50 animate-fade-in-up">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-violet-700 text-base leading-snug flex-1">{note.judul}</h3>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={() => onEdit(note)}
            className="w-8 h-8 rounded-xl bg-violet-100 hover:bg-violet-200 flex items-center justify-center transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-violet-500" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="w-8 h-8 rounded-xl bg-rose-100 hover:bg-rose-200 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          </button>
        </div>
      </div>

      {note.catatan && (
        <p className="text-gray-500 text-sm whitespace-pre-wrap leading-relaxed">{note.catatan}</p>
      )}

      <p className="text-xs text-violet-300 mt-3 font-medium">{timeAgo}</p>
    </div>
  )
}
