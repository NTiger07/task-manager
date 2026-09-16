'use client'

import { useEffect, useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

let toastListeners: ((toasts: ToastMessage[]) => void)[] = []
let currentToasts: ToastMessage[] = []

export function showToast(message: string, type: ToastType = 'info') {
  const id = Math.random().toString(36).slice(2)
  currentToasts = [...currentToasts, { id, message, type }]
  toastListeners.forEach(l => l(currentToasts))

  setTimeout(() => {
    currentToasts = currentToasts.filter(t => t.id !== id)
    toastListeners.forEach(l => l(currentToasts))
  }, 3500)
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const handleUpdate = useCallback((updated: ToastMessage[]) => {
    setToasts([...updated])
  }, [])

  useEffect(() => {
    toastListeners.push(handleUpdate)
    return () => {
      toastListeners = toastListeners.filter(l => l !== handleUpdate)
    }
  }, [handleUpdate])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
            shadow-lg border pointer-events-auto
            animate-in slide-in-from-right-4 duration-200
            ${toast.type === 'success'
              ? 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]'
              : toast.type === 'error'
              ? 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]'
              : 'bg-white text-[#111827] border-[#e5e7eb]'
            }
          `}
        >
          <span className="text-base flex-shrink-0">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  )
}
