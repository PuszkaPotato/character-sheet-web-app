interface NumberStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
  label?: string
  className?: string
}

const sizes = {
  sm: { btn: 'w-4 h-5 text-xs', input: 'w-7 py-0.5 text-xs' },
  md: { btn: 'w-6 h-7 text-sm', input: 'w-12 py-1 text-base' },
}

const btnCls = 'flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold select-none disabled:opacity-40 disabled:cursor-not-allowed'
const inputCls = 'text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden'

export default function NumberStepper({ value, onChange, min, max, size = 'md', label, className = '' }: NumberStepperProps) {
  const s = sizes[size]
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={min !== undefined && value <= min}
        className={`${btnCls} ${s.btn}`}
        aria-label={label ? `Decrease ${label}` : 'Decrease'}
      >−</button>
      <input
        type="number"
        value={value}
        onChange={e => { const n = parseInt(e.target.value); if (!isNaN(n)) onChange(n) }}
        className={`${inputCls} ${s.input}`}
        aria-label={label}
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={max !== undefined && value >= max}
        className={`${btnCls} ${s.btn}`}
        aria-label={label ? `Increase ${label}` : 'Increase'}
      >+</button>
    </div>
  )
}
