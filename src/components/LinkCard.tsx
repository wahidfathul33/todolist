'use client'

import { useState } from 'react'
import { Link } from '@/lib/supabase'
import { Pencil, Trash2, Star, ExternalLink, ChevronDown } from 'lucide-react'

interface LinkCardProps {
  link: Link
  onEdit: (link: Link) => void
  onDelete: (id: number) => void
  onToggleStar: (link: Link) => void
}

export default function LinkCard({ link, onEdit, onDelete, onToggleStar }: LinkCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white rounded-3xl shadow-md border-2 border-sky-100 shadow-sky-50 animate-fade-in-up">
      {/* Header — always visible, clickable to toggle */}
      <div
        className="flex items-center gap-2 p-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <h3 className="flex-1 font-bold text-sky-700 text-base leading-snug">{link.judul}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onToggleStar(link) }}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${link.starred ? 'bg-amber-100 hover:bg-amber-200' : 'bg-sky-50 hover:bg-sky-100'}`}
            title={link.starred ? 'Hapus bintang' : 'Beri bintang'}
          >
            <Star className={`w-3.5 h-3.5 ${link.starred ? 'text-amber-400 fill-amber-400' : 'text-sky-300'}`} />
          </button>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="w-8 h-8 rounded-xl bg-sky-100 hover:bg-sky-200 flex items-center justify-center transition-colors"
            title="Buka link"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-500" />
          </a>
          <button
            onClick={e => { e.stopPropagation(); onEdit(link) }}
            className="w-8 h-8 rounded-xl bg-sky-100 hover:bg-sky-200 flex items-center justify-center transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-sky-500" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(link.id) }}
            className="w-8 h-8 rounded-xl bg-rose-100 hover:bg-rose-200 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          </button>
          <ChevronDown
            className={`w-4 h-4 text-sky-300 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Detail — visible when expanded */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-sky-50">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 text-sm hover:text-sky-600 hover:underline truncate block transition-colors mt-3"
          >
            {link.url}
          </a>
        </div>
      )}
    </div>
  )
}
