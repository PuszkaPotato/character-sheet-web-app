import type { AbilityScores as AbilityScoresType } from '../../types/character'
import { abilityModifier, formatModifier } from '../../utils/calculations'
import { useCharacterStore } from '../../stores/characterStore'
import Card from '../UI/Card'

const ABILITIES = [
  { key: 'strength', label: 'STR' },
  { key: 'dexterity', label: 'DEX' },
  { key: 'constitution', label: 'CON' },
  { key: 'intelligence', label: 'INT' },
  { key: 'wisdom', label: 'WIS' },
  { key: 'charisma', label: 'CHA' },
] as const

export default function AbilityScores() {
  const { data, update } = useCharacterStore()

  const handleChange = (ability: keyof AbilityScoresType, value: string) => {
    const num = parseInt(value)
    if (isNaN(num) || num < 1 || num > 30) return
    update(d => { d.abilities[ability] = num })
  }

  return (
    <Card title="Ability Scores">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {ABILITIES.map(({ key, label }) => {
          const score = data.abilities[key]
          const mod = abilityModifier(score)
          return (
            <div key={key} className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{label}</span>
              <input
                type="number"
                min={1}
                max={30}
                value={score}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-14 text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-1 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label={key}
              />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {formatModifier(mod)}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
