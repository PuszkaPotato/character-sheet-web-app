import { useState, useEffect, useMemo } from 'react'
import { getSpells, type SpellOption } from '../../services/fiveETools'
import Modal from './Modal'

const SCHOOLS = [
  'Abjuration', 'Conjuration', 'Divination', 'Enchantment',
  'Evocation', 'Illusion', 'Necromancy', 'Transmutation',
]

interface SpellPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (spell: SpellOption) => void
}

export default function SpellPicker({ open, onClose, onSelect }: SpellPickerProps) {
  const [spells, setSpells] = useState<SpellOption[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | null>(null)
  const [schoolFilter, setSchoolFilter] = useState('')

  useEffect(() => {
    if (open && spells.length === 0 && !loading) {
      setLoading(true)
      getSpells().then(setSpells).catch(() => {}).finally(() => setLoading(false))
    }
  }, [open, spells.length, loading])

  const filtered = useMemo(() => spells.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    if (levelFilter !== null && s.level !== levelFilter) return false
    if (schoolFilter && s.school !== schoolFilter) return false
    return true
  }).slice(0, 200), [spells, search, levelFilter, schoolFilter])

  const toggleLevel = (l: number) => setLevelFilter(prev => prev === l ? null : l)
  const toggleSchool = (s: string) => setSchoolFilter(prev => prev === s ? '' : s)

  return (
    <Modal open={open} title="Browse 5e Spells" onClose={onClose} className="!max-w-2xl">
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search spells..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          autoFocus
        />

        {/* Level filter chips */}
        <div className="flex flex-wrap gap-1">
          <FilterChip active={levelFilter === null} onClick={() => setLevelFilter(null)}>All</FilterChip>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => (
            <FilterChip key={l} active={levelFilter === l} onClick={() => toggleLevel(l)}>
              {l === 0 ? 'Cantrip' : `L${l}`}
            </FilterChip>
          ))}
        </div>

        {/* School filter chips */}
        <div className="flex flex-wrap gap-1">
          <FilterChip active={!schoolFilter} onClick={() => setSchoolFilter('')}>All Schools</FilterChip>
          {SCHOOLS.map(s => (
            <FilterChip key={s} active={schoolFilter === s} onClick={() => toggleSchool(s)}>
              {s.slice(0, 4)}
            </FilterChip>
          ))}
        </div>

        {/* Spell list */}
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-10">Loading spells from 5e.tools...</p>
        ) : (
          <div className="max-h-96 overflow-y-auto rounded border border-gray-200 dark:border-gray-700">
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-10">No spells found.</p>
            )}
            {filtered.map((s, i) => (
              <button
                key={i}
                onClick={() => { onSelect(s); onClose() }}
                className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.name}</span>
                  <span className="text-xs text-gray-400">
                    {s.level === 0 ? 'Cantrip' : `L${s.level}`} · {s.school.slice(0, 4)}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">{s.castingTime}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {[s.range, s.components, s.duration].filter(Boolean).join(' · ')}
                </div>
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400">PHB · XGE · TCE — click a spell to add it to your sheet</p>
      </div>
    </Modal>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
        active
          ? 'bg-red-600 text-white border-red-600'
          : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-400 dark:hover:border-red-600'
      }`}
    >
      {children}
    </button>
  )
}
