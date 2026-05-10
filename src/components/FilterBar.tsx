'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface FilterBarProps {
  filter: 'all' | 'belum' | 'proses' | 'selesai'
  search: string
  onFilterChange: (filter: 'all' | 'belum' | 'proses' | 'selesai') => void
  onSearchChange: (search: string) => void
}

export default function FilterBar({ filter, search, onFilterChange, onSearchChange }: FilterBarProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className={`flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border-2 transition-colors shadow-sm ${focused ? 'border-pink-400 shadow-pink-100' : 'border-pink-100'}`}>
        <Search className="w-4 h-4 text-pink-300 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Cari kegiatan..."
          className="flex-1 bg-transparent text-pink-800 placeholder-pink-300 text-sm font-medium outline-none"
        />
        {search && (
          <button onClick={() => onSearchChange('')}>
            <X className="w-4 h-4 text-pink-300 hover:text-pink-500 transition-colors" />
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 bg-white rounded-2xl p-1.5 border-2 border-pink-100 shadow-sm">
        {[
          { key: 'all',    label: '🌸 Semua' },
          { key: 'belum',  label: '💤 Belum' },
          { key: 'proses', label: '⏳ Proses' },
          { key: 'selesai',label: '✅ Selesai' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key as 'all' | 'belum' | 'proses' | 'selesai')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === key
                ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md shadow-pink-200'
                : 'text-pink-400 hover:text-pink-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
