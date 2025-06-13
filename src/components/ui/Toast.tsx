'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'error' | 'success'
  duration?: number
}

export const Toast = ({ message, type = 'error', duration = 3000 }: ToastProps) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(t)
  }, [duration])

  if (!visible) return null

  const bg = type === 'error' ? 'bg-red-600' : 'bg-green-600'

  return (
    <div className={`${bg} fixed bottom-4 right-4 z-50 rounded px-4 py-2 text-white`}>
      {message}
    </div>
  )
}
