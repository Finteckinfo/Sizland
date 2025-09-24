'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Copy } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'error' | 'success' | 'info'
  duration?: number
}

export const Toast = ({ message, type = 'error', duration = 3000 }: ToastProps) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(t)
  }, [duration])

  if (!visible) return null

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-700',
          text: 'text-green-700 dark:text-green-300',
          icon: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        }
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-700',
          text: 'text-red-700 dark:text-red-300',
          icon: <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        }
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-700',
          text: 'text-blue-700 dark:text-blue-300',
          icon: <Copy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        }
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-700',
          text: 'text-gray-700 dark:text-gray-300',
          icon: <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        }
    }
  }

  const styles = getStyles()

  return (
    <div className={`${styles.bg} ${styles.border} fixed bottom-4 right-4 z-50 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm`}>
      <div className="flex items-center gap-3">
        {styles.icon}
        <span className={`${styles.text} font-medium text-sm`}>
          {message}
        </span>
      </div>
    </div>
  )
}
