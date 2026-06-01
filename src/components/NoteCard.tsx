'use client'

import { useState } from 'react'
import { Note } from '@/lib/supabase'
import { Pencil, Trash2, Star, ChevronDown } from 'lucide-react'
import RichText from '@/components/RichText'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: number) => void
  onToggleStar: (note: Note) => void
}

export default function NoteCard({ note, onEdit, onDelete, onToggleStar }: NoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(note.updated_at), { addSuffix: true, locale: id })
    } catch {
      return ''
    }
  })()

  return (
    <div className="bg-white rounded-3xl shadow-md border-2 border-violet-100 shadow-violet-50 animate-fade-in-up">
      {/* Header — always visible, clickable to toggle */}
      <div
        className="flex items-center gap-2 p-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <h3 className="flex-1 font-bold text-violet-700 text-base leading-snug">{note.judul}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onToggleStar(note) }}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${note.starred ? 'bg-amber-100 hover:bg-amber-200' : 'bg-violet-50 hover:bg-violet-100'}`}
            title={note.starred ? 'Hapus bintang' : 'Beri bintang'}
          >
            <Star className={`w-3.5 h-3.5 ${note.starred ? 'text-amber-400 fill-amber-400' : 'text-violet-300'}`} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onEdit(note) }}
            className="w-8 h-8 rounded-xl bg-violet-100 hover:bg-violet-200 flex items-center justify-center transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-violet-500" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(note.id) }}
            className="w-8 h-8 rounded-xl bg-rose-100 hover:bg-rose-200 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          </button>
          <ChevronDown
            className={`w-4 h-4 text-violet-300 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Detail — visible when expanded */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-violet-50">
          {note.catatan && (
            <RichText
              text={note.catatan}
              className="text-gray-500 text-sm leading-relaxed mt-3"
              linkClassName="text-violet-500 hover:underline break-all"
            />
          )}
          <p className="text-xs text-violet-300 mt-3 font-medium">{timeAgo}</p>
        </div>
      )}
    </div>
  )
}
