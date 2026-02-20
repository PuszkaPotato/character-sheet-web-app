export type Ability = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'
export type Alignment = 'Lawful Good' | 'Neutral Good' | 'Chaotic Good' | 'Lawful Neutral' | 'True Neutral' | 'Chaotic Neutral' | 'Lawful Evil' | 'Neutral Evil' | 'Chaotic Evil'

export interface AbilityScores {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export interface SkillEntry {
  proficient: boolean
  expertise: boolean
}

export interface Skills {
  acrobatics: SkillEntry
  animalHandling: SkillEntry
  arcana: SkillEntry
  athletics: SkillEntry
  deception: SkillEntry
  history: SkillEntry
  insight: SkillEntry
  intimidation: SkillEntry
  investigation: SkillEntry
  medicine: SkillEntry
  nature: SkillEntry
  perception: SkillEntry
  performance: SkillEntry
  persuasion: SkillEntry
  religion: SkillEntry
  sleightOfHand: SkillEntry
  stealth: SkillEntry
  survival: SkillEntry
}

export interface SavingThrow {
  proficient: boolean
}

export interface SavingThrows {
  strength: SavingThrow
  dexterity: SavingThrow
  constitution: SavingThrow
  intelligence: SavingThrow
  wisdom: SavingThrow
  charisma: SavingThrow
}

export interface HitDice {
  total: string
  current: number
}

export interface DeathSaves {
  successes: number
  failures: number
}

export interface Combat {
  armorClass: number
  initiative: number
  speed: number
  maxHitPoints: number
  currentHitPoints: number
  temporaryHitPoints: number
  hitDice: HitDice
  deathSaves: DeathSaves
}

export interface EquipmentItem {
  id: string
  name: string
  quantity: number
  weight: number
  description: string
  equipped: boolean
}

export interface Currency {
  copper: number
  silver: number
  electrum: number
  gold: number
  platinum: number
}

export interface SpellSlot {
  max: number
  used: number
}

export interface Spell {
  id: string
  name: string
  level: number
  school: string
  castingTime: string
  range: string
  components: string
  duration: string
  description: string
  prepared: boolean
}

export interface Cantrip {
  id: string
  name: string
  school: string
  description: string
}

export interface Spellcasting {
  spellcastingAbility: Ability | ''
  spellSaveDC: number
  spellAttackBonus: number
  spellSlots: Record<string, SpellSlot>
  spellsKnown: Spell[]
  cantrips: Cantrip[]
}

export interface Feature {
  id: string
  name: string
  source: string
  description: string
}

export interface Proficiencies {
  armor: string[]
  weapons: string[]
  tools: string[]
  languages: string[]
}

export interface Personality {
  traits: string
  ideals: string
  bonds: string
  flaws: string
}

export interface Appearance {
  age: number
  height: string
  weight: string
  eyes: string
  skin: string
  hair: string
  portraitUrl: string | null
}

export interface CharacterData {
  basicInfo: {
    name: string
    race: string
    class: string
    subclass: string
    level: number
    background: string
    alignment: Alignment | ''
    experiencePoints: number
  }
  abilities: AbilityScores
  proficiencyBonus: number
  savingThrows: SavingThrows
  skills: Skills
  combat: Combat
  equipment: EquipmentItem[]
  currency: Currency
  spellcasting: Spellcasting
  features: Feature[]
  traits: Feature[]
  proficiencies: Proficiencies
  personality: Personality
  backstory: string
  appearance: Appearance
  allies: string[]
  notes: string
}

export interface Character {
  id: string
  userId: string
  name: string
  data: CharacterData
  createdAt: string
  updatedAt: string
}

export const DEFAULT_CHARACTER_DATA: CharacterData = {
  basicInfo: {
    name: '',
    race: '',
    class: '',
    subclass: '',
    level: 1,
    background: '',
    alignment: '',
    experiencePoints: 0,
  },
  abilities: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  proficiencyBonus: 2,
  savingThrows: {
    strength: { proficient: false },
    dexterity: { proficient: false },
    constitution: { proficient: false },
    intelligence: { proficient: false },
    wisdom: { proficient: false },
    charisma: { proficient: false },
  },
  skills: {
    acrobatics: { proficient: false, expertise: false },
    animalHandling: { proficient: false, expertise: false },
    arcana: { proficient: false, expertise: false },
    athletics: { proficient: false, expertise: false },
    deception: { proficient: false, expertise: false },
    history: { proficient: false, expertise: false },
    insight: { proficient: false, expertise: false },
    intimidation: { proficient: false, expertise: false },
    investigation: { proficient: false, expertise: false },
    medicine: { proficient: false, expertise: false },
    nature: { proficient: false, expertise: false },
    perception: { proficient: false, expertise: false },
    performance: { proficient: false, expertise: false },
    persuasion: { proficient: false, expertise: false },
    religion: { proficient: false, expertise: false },
    sleightOfHand: { proficient: false, expertise: false },
    stealth: { proficient: false, expertise: false },
    survival: { proficient: false, expertise: false },
  },
  combat: {
    armorClass: 10,
    initiative: 0,
    speed: 30,
    maxHitPoints: 8,
    currentHitPoints: 8,
    temporaryHitPoints: 0,
    hitDice: { total: '1d8', current: 1 },
    deathSaves: { successes: 0, failures: 0 },
  },
  equipment: [],
  currency: { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 },
  spellcasting: {
    spellcastingAbility: '',
    spellSaveDC: 0,
    spellAttackBonus: 0,
    spellSlots: {},
    spellsKnown: [],
    cantrips: [],
  },
  features: [],
  traits: [],
  proficiencies: { armor: [], weapons: [], tools: [], languages: [] },
  personality: { traits: '', ideals: '', bonds: '', flaws: '' },
  backstory: '',
  appearance: { age: 0, height: '', weight: '', eyes: '', skin: '', hair: '', portraitUrl: null },
  allies: [],
  notes: '',
}
