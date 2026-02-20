import { useCharacterStore } from '../../stores/characterStore'
import Card from '../UI/Card'

export default function Notes() {
  const { data, update } = useCharacterStore()
  const { personality, backstory, notes, appearance, proficiencies } = data

  const setPerson = (field: keyof typeof personality, value: string) => {
    update(d => { d.personality[field] = value })
  }

  return (
    <div className="space-y-3">
      <Card title="Personality">
        <div className="space-y-2">
          {(['traits', 'ideals', 'bonds', 'flaws'] as const).map(field => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 capitalize">{field}</label>
              <textarea
                value={personality[field]}
                onChange={e => setPerson(field, e.target.value)}
                rows={2}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={`Character ${field}...`}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Proficiencies & Languages">
        <div className="grid grid-cols-2 gap-3">
          {(['armor', 'weapons', 'tools', 'languages'] as const).map(cat => (
            <div key={cat} className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 capitalize">{cat}</label>
              <textarea
                value={proficiencies[cat].join(', ')}
                onChange={e => update(d => { d.proficiencies[cat] = e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                rows={2}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Comma-separated..."
              />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Appearance">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(['age', 'height', 'weight', 'eyes', 'skin', 'hair'] as const).map(field => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 capitalize">{field}</label>
              <input
                value={appearance[field] ?? ''}
                onChange={e => update(d => { (d.appearance as unknown as Record<string, unknown>)[field] = field === 'age' ? parseInt(e.target.value) || 0 : e.target.value })}
                className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Backstory">
        <textarea
          value={backstory}
          onChange={e => update(d => { d.backstory = e.target.value })}
          rows={4}
          className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Character backstory..."
        />
      </Card>

      <Card title="Notes">
        <textarea
          value={notes}
          onChange={e => update(d => { d.notes = e.target.value })}
          rows={4}
          className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Any additional notes..."
        />
      </Card>
    </div>
  )
}
