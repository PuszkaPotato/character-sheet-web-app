import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
}

export default function Card({ title, children, className = '', ...props }: CardProps) {
  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm ${className}`} {...props}>
      {title && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )
}
