import { useCharacterStore } from '../../stores/characterStore'
import { formatModifier } from '../../utils/calculations'
import Card from '../UI/Card'

export default function CombatStats() {
  const { data, update } = useCharacterStore()
  const { combat } = data

  const set = (field: string, value: number) => {
    update(d => {
      (d.combat as unknown as Record<string, number>)[field] = value
    })
  }

  const stat = (label: string, value: string | number, onChange: (v: string) => void, format?: string) => (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-16 text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-1 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label={label}
      />
      {format && <span className="text-xs text-gray-400">{format}</span>}
    </div>
  )

  return (
    <Card title="Combat">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
        {stat('AC', combat.armorClass, v => set('armorClass', parseInt(v) || 0))}
        {stat('Initiative', combat.initiative, v => set('initiative', parseInt(v) || 0))}
        {stat('Speed', combat.speed, v => set('speed', parseInt(v) || 0), 'ft')}
        {stat('Max HP', combat.maxHitPoints, v => set('maxHitPoints', parseInt(v) || 0))}
        {stat('Current HP', combat.currentHitPoints, v => set('currentHitPoints', parseInt(v) || 0))}
        {stat('Temp HP', combat.temporaryHitPoints, v => set('temporaryHitPoints', parseInt(v) || 0))}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Hit Dice</span>
          <input
            type="text"
            value={combat.hitDice.total}
            onChange={(e) => update(d => { d.combat.hitDice.total = e.target.value })}
            className="w-20 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="1d8"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Prof. Bonus</span>
          <span className="text-base font-semibold text-center">{formatModifier(data.proficiencyBonus)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Death Saves</span>
          <div className="flex gap-2 text-xs">
            <span>S: {combat.deathSaves.successes}</span>
            <span>F: {combat.deathSaves.failures}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
