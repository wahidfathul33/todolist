'use client'

import { CloudOff, RefreshCw } from 'lucide-react'

interface DbErrorBannerProps {
  message: string
  onRetry: () => void
  retrying?: boolean
}

export default function DbErrorBanner({ message, onRetry, retrying = false }: DbErrorBannerProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mb-5 bg-rose-50 border-2 border-rose-200 rounded-2xl px-4 py-3.5 flex items-center gap-3 animate-bounce-in"
    >
      <div className="w-9 h-9 shrink-0 bg-rose-100 rounded-full flex items-center justify-center">
        <CloudOff className="w-5 h-5 text-rose-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-rose-700 font-bold text-sm">Database tidak terhubung</p>
        <p className="text-rose-500 text-xs mt-0.5 break-words">{message}</p>
      </div>
      <button
        onClick={onRetry}
        disabled={retrying}
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-sm hover:bg-rose-600 transition-colors disabled:opacity-60"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
        {retrying ? 'Mencoba...' : 'Coba lagi'}
      </button>
    </div>
  )
}
