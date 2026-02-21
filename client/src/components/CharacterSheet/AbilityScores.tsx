import type { AbilityScores as AbilityScoresType } from '../../types/character'
import { abilityModifier, formatModifier } from '../../utils/calculations'
import { useCharacterStore } from '../../stores/characterStore'
import Card from '../UI/Card'
import NumberStepper from '../UI/NumberStepper'

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

  return (
    <Card title="Ability Scores">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {ABILITIES.map(({ key, label }) => {
          const score = data.abilities[key]
          const mod = abilityModifier(score)
          return (
            <div key={key} className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{label}</span>
              <NumberStepper
                value={score}
                onChange={v => { if (v >= 1 && v <= 30) update(d => { d.abilities[key as keyof AbilityScoresType] = v }) }}
                min={1}
                max={30}
                label={key}
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
