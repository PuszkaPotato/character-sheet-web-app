import { useState, useRef, useEffect } from 'react'

export interface ComboboxOption {
  value: string
  label: string
  sublabel?: string
}

interface ComboboxProps {
  label?: string
  value: string
  onChange: (value: string) => void
  onSelect?: (option: ComboboxOption) => void
  onFocus?: () => void
  options: ComboboxOption[]
  placeholder?: string
  loading?: boolean
}

export default function Combobox({
  label, value, onChange, onSelect, onFocus, options, placeholder, loading,
}: ComboboxProps) {
  const [inputValue, setInputValue] = useState(value)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep input in sync with prop when dropdown is closed
  useEffect(() => {
    if (!open) setInputValue(value)
  }, [value, open])

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const filtered = options
    .filter(o => !inputValue || o.label.toLowerCase().includes(inputValue.toLowerCase()))
    .slice(0, 50)

  const handleFocus = () => {
    setInputValue('')
    setOpen(true)
    onFocus?.()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setInputValue(v)
    onChange(v)
    setOpen(true)
  }

  // Delay close so a mousedown on a list item fires first
  const handleBlur = () => setTimeout(() => setOpen(false), 150)

  const handleSelect = (option: ComboboxOption) => {
    setInputValue(option.value)
    onChange(option.value)
    onSelect?.(option)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </span>
      )}
      <input
        ref={inputRef}
        type="text"
        value={open ? inputValue : value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={loading ? 'Loading...' : placeholder}
        disabled={loading}
        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
      />
      {open && !loading && filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg text-sm">
          {filtered.map((o, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(o)}
              className="flex flex-col px-3 py-1.5 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <span className="text-gray-900 dark:text-gray-100">{o.label}</span>
              {o.sublabel && <span className="text-xs text-gray-400">{o.sublabel}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
