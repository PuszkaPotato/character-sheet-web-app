import { create } from 'zustand'
import type { CharacterData } from '../types/character'
import { DEFAULT_CHARACTER_DATA } from '../types/character'
import { proficiencyBonus, spellSaveDC, spellAttackBonus, abilityModifier } from '../utils/calculations'
import { saveCharacter, loadCharacter } from '../services/localStorage'
import type { LocalCharacter } from '../services/localStorage'

let saveTimer: ReturnType<typeof setTimeout> | null = null

interface CharacterState {
  id: string | null
  cloudId: string | null
  data: CharacterData
  isDirty: boolean
  lastLocalSave: Date | null

  loadNew: () => void
  loadLocal: (id: string) => boolean
  loadFromCloud: (cloudChar: { id: string; name: string; data: string }) => void
  update: (updater: (draft: CharacterData) => void) => void
  setField: <K extends keyof CharacterData>(key: K, value: CharacterData[K]) => void
  setCloudId: (id: string) => void
  markSaved: () => void
}

function recalculate(data: CharacterData): CharacterData {
  const prof = proficiencyBonus(data.basicInfo.level)
  data.proficiencyBonus = prof

  if (data.spellcasting.spellcastingAbility) {
    const abilityScore = data.abilities[data.spellcasting.spellcastingAbility]
    data.spellcasting.spellSaveDC = spellSaveDC(abilityScore, prof)
    data.spellcasting.spellAttackBonus = spellAttackBonus(abilityScore, prof)
  }

  data.combat.initiative = abilityModifier(data.abilities.dexterity)
  return data
}

function scheduleSave(id: string, data: CharacterData, name: string, onSaved: () => void) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const character: LocalCharacter = {
      id,
      name,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveCharacter(character)
    onSaved()
  }, 500)
}

export const useCharacterStore = create<CharacterState>((set) => ({
  id: null,
  cloudId: null,
  data: structuredClone(DEFAULT_CHARACTER_DATA),
  isDirty: false,
  lastLocalSave: null,

  loadNew: () => {
    const id = crypto.randomUUID()
    const data = structuredClone(DEFAULT_CHARACTER_DATA)
    saveCharacter({ id, name: 'Unnamed', data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    set({ id, cloudId: null, data, isDirty: false, lastLocalSave: new Date() })
  },

  loadLocal: (id) => {
    const char = loadCharacter(id)
    if (!char) return false
    set({ id, cloudId: null, data: char.data, isDirty: false, lastLocalSave: null })
    return true
  },

  loadFromCloud: (cloudChar) => {
    const data: CharacterData = JSON.parse(cloudChar.data)
    const localId = crypto.randomUUID()
    set({ id: localId, cloudId: cloudChar.id, data, isDirty: false, lastLocalSave: null })
  },

  update: (updater) => {
    set((state) => {
      const next = structuredClone(state.data)
      updater(next)
      recalculate(next)
      if (state.id) {
        scheduleSave(state.id, next, next.basicInfo.name || 'Unnamed', () =>
          set({ lastLocalSave: new Date() })
        )
      }
      return { data: next, isDirty: true }
    })
  },

  setField: (key, value) => {
    set((state) => {
      const next = { ...state.data, [key]: value }
      recalculate(next)
      if (state.id) {
        scheduleSave(state.id, next, next.basicInfo.name || 'Unnamed', () =>
          set({ lastLocalSave: new Date() })
        )
      }
      return { data: next, isDirty: true }
    })
  },

  setCloudId: (id) => set({ cloudId: id }),
  markSaved: () => set({ isDirty: false }),
}))
