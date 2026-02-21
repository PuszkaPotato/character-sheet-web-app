import type { CharacterData } from '../types/character'

const PREFIX = 'dnd_char_'
const LIST_KEY = 'dnd_char_list'

export interface LocalCharacter {
  id: string
  name: string
  data: CharacterData
  createdAt: string
  updatedAt: string
}

export function saveCharacter(character: LocalCharacter): void {
  localStorage.setItem(PREFIX + character.id, JSON.stringify(character))
  const ids = getCharacterIds()
  if (!ids.includes(character.id)) {
    ids.push(character.id)
    localStorage.setItem(LIST_KEY, JSON.stringify(ids))
  }
}

export function loadCharacter(id: string): LocalCharacter | null {
  const raw = localStorage.getItem(PREFIX + id)
  return raw ? JSON.parse(raw) : null
}

export function loadAllCharacters(): LocalCharacter[] {
  return getCharacterIds()
    .map(id => loadCharacter(id))
    .filter((c): c is LocalCharacter => c !== null)
}

export function deleteCharacter(id: string): void {
  localStorage.removeItem(PREFIX + id)
  const ids = getCharacterIds().filter(i => i !== id)
  localStorage.setItem(LIST_KEY, JSON.stringify(ids))
}

function getCharacterIds(): string[] {
  const raw = localStorage.getItem(LIST_KEY)
  return raw ? JSON.parse(raw) : []
}

export function exportCharacterJson(character: LocalCharacter): void {
  const a = document.createElement('a')
  a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(character, null, 2))
  a.download = `${(character.name || 'character').replace(/\s+/g, '_')}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function importCharacterJson(file: File): Promise<LocalCharacter> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string)
        // Assign a new id to avoid conflicts
        const character: LocalCharacter = { ...parsed, id: crypto.randomUUID(), updatedAt: new Date().toISOString() }
        resolve(character)
      } catch {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.readAsText(file)
  })
}
