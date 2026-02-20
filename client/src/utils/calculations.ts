import type { AbilityScores, Skills, SavingThrows, Ability } from '../types/character'

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function proficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1
}

export function skillBonus(
  abilityScore: number,
  skill: { proficient: boolean; expertise: boolean },
  profBonus: number
): number {
  const mod = abilityModifier(abilityScore)
  if (skill.expertise) return mod + profBonus * 2
  if (skill.proficient) return mod + profBonus
  return mod
}

export function savingThrowBonus(
  abilityScore: number,
  save: { proficient: boolean },
  profBonus: number
): number {
  const mod = abilityModifier(abilityScore)
  return save.proficient ? mod + profBonus : mod
}

export function spellSaveDC(abilityScore: number, profBonus: number): number {
  return 8 + profBonus + abilityModifier(abilityScore)
}

export function spellAttackBonus(abilityScore: number, profBonus: number): number {
  return profBonus + abilityModifier(abilityScore)
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

// Skill to ability mapping
export const SKILL_ABILITY_MAP: Record<keyof Skills, Ability> = {
  acrobatics: 'dexterity',
  animalHandling: 'wisdom',
  arcana: 'intelligence',
  athletics: 'strength',
  deception: 'charisma',
  history: 'intelligence',
  insight: 'wisdom',
  intimidation: 'charisma',
  investigation: 'intelligence',
  medicine: 'wisdom',
  nature: 'intelligence',
  perception: 'wisdom',
  performance: 'charisma',
  persuasion: 'charisma',
  religion: 'intelligence',
  sleightOfHand: 'dexterity',
  stealth: 'dexterity',
  survival: 'wisdom',
}

export const SKILL_LABELS: Record<keyof Skills, string> = {
  acrobatics: 'Acrobatics',
  animalHandling: 'Animal Handling',
  arcana: 'Arcana',
  athletics: 'Athletics',
  deception: 'Deception',
  history: 'History',
  insight: 'Insight',
  intimidation: 'Intimidation',
  investigation: 'Investigation',
  medicine: 'Medicine',
  nature: 'Nature',
  perception: 'Perception',
  performance: 'Performance',
  persuasion: 'Persuasion',
  religion: 'Religion',
  sleightOfHand: 'Sleight of Hand',
  stealth: 'Stealth',
  survival: 'Survival',
}

export function computeAllSkillBonuses(
  abilities: AbilityScores,
  skills: Skills,
  profBonus: number
): Record<keyof Skills, number> {
  const result = {} as Record<keyof Skills, number>
  for (const skill of Object.keys(skills) as Array<keyof Skills>) {
    const ability = SKILL_ABILITY_MAP[skill]
    result[skill] = skillBonus(abilities[ability], skills[skill], profBonus)
  }
  return result
}

export function computeAllSavingThrows(
  abilities: AbilityScores,
  savingThrows: SavingThrows,
  profBonus: number
): Record<keyof SavingThrows, number> {
  const abilities_keys = Object.keys(savingThrows) as Array<keyof SavingThrows>
  const result = {} as Record<keyof SavingThrows, number>
  for (const ability of abilities_keys) {
    result[ability] = savingThrowBonus(abilities[ability], savingThrows[ability], profBonus)
  }
  return result
}
