import { useCharacterStore } from '../../stores/characterStore'
import { SKILL_LABELS, SKILL_ABILITY_MAP, skillBonus, savingThrowBonus, formatModifier } from '../../utils/calculations'
import type { Skills as SkillsType } from '../../types/character'
import Card from '../UI/Card'

export default function Skills() {
  const { data, update } = useCharacterStore()
  const { skills, abilities, savingThrows, proficiencyBonus: prof } = data

  const toggleSkillProficiency = (skill: keyof SkillsType) => {
    update(d => {
      if (!d.skills[skill].proficient && !d.skills[skill].expertise) {
        d.skills[skill].proficient = true
      } else if (d.skills[skill].proficient && !d.skills[skill].expertise) {
        d.skills[skill].expertise = true
      } else {
        d.skills[skill].proficient = false
        d.skills[skill].expertise = false
      }
    })
  }

  const toggleSaveProficiency = (ability: keyof typeof savingThrows) => {
    update(d => { d.savingThrows[ability].proficient = !d.savingThrows[ability].proficient })
  }

  const abilitiesList = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const
  const abilityLabels: Record<string, string> = {
    strength: 'STR', dexterity: 'DEX', constitution: 'CON',
    intelligence: 'INT', wisdom: 'WIS', charisma: 'CHA'
  }

  return (
    <div className="space-y-3">
      {/* Saving Throws */}
      <Card title="Saving Throws">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {abilitiesList.map(ab => {
            const bonus = savingThrowBonus(abilities[ab], savingThrows[ab], prof)
            const isProficient = savingThrows[ab].proficient
            return (
              <button
                key={ab}
                onClick={() => toggleSaveProficiency(ab)}
                className="flex items-center gap-2 text-sm hover:text-red-600 dark:hover:text-red-400 transition-colors text-left"
                aria-label={`Toggle ${ab} saving throw proficiency`}
              >
                <span className={`text-base ${isProficient ? 'text-red-600' : 'text-gray-400'}`}>
                  {isProficient ? '●' : '○'}
                </span>
                <span className="w-6 font-mono text-xs font-bold">{formatModifier(bonus)}</span>
                <span className="text-gray-700 dark:text-gray-300">{abilityLabels[ab]}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Skills */}
      <Card title="Skills">
        <div className="space-y-0.5">
          {(Object.keys(SKILL_LABELS) as Array<keyof SkillsType>).map(skill => {
            const ability = SKILL_ABILITY_MAP[skill]
            const bonus = skillBonus(abilities[ability], skills[skill], prof)
            const { proficient, expertise } = skills[skill]
            return (
              <button
                key={skill}
                onClick={() => toggleSkillProficiency(skill)}
                className="flex items-center gap-2 w-full text-sm hover:text-red-600 dark:hover:text-red-400 transition-colors text-left py-0.5"
                aria-label={`Toggle ${SKILL_LABELS[skill]} proficiency`}
              >
                <span className={`text-base ${expertise ? 'text-yellow-500' : proficient ? 'text-red-600' : 'text-gray-400'}`}>
                  {expertise ? '◆' : proficient ? '●' : '○'}
                </span>
                <span className="w-6 font-mono text-xs font-bold">{formatModifier(bonus)}</span>
                <span className="text-gray-700 dark:text-gray-300 flex-1">{SKILL_LABELS[skill]}</span>
                <span className="text-xs text-gray-400">{abilityLabels[ability]}</span>
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-gray-400">Click once: proficient ● | twice: expertise ◆ | thrice: none</p>
      </Card>
    </div>
  )
}
