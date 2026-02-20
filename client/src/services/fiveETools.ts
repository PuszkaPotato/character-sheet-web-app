const BASE = 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data/'

const memCache = new Map<string, unknown>()

async function fetchJson<T>(path: string): Promise<T> {
  if (memCache.has(path)) return memCache.get(path) as T
  const res = await fetch(BASE + path)
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
  const data = await res.json()
  memCache.set(path, data)
  return data as T
}

// ---- Minimal raw types ----

interface RawRace {
  name: string
  source: string
  ability?: Array<Record<string, number>>
  size?: string[]
  speed?: number | { walk?: number }
  edition?: string
}

interface RawClass {
  name: string
  source: string
  hd?: { number: number; faces: number }
  proficiency?: string[]
  edition?: string
}

interface RawSubclass {
  name: string
  shortName: string
  source: string
  className: string
  classSource: string
  edition?: string
}

interface RawBackground {
  name: string
  source: string
  skillProficiencies?: Array<Record<string, boolean | number>>
  edition?: string
}

interface RawSpell {
  name: string
  source: string
  level: number
  school: string
  time?: Array<{ number: number; unit: string }>
  range?: { type: string; distance?: { type: string; amount?: number } }
  components?: { v?: boolean; s?: boolean; m?: boolean | string | { text: string } }
  duration?: Array<{
    type: string
    duration?: { type: string; amount?: number }
    concentration?: boolean
  }>
}

// ---- Public types ----

export interface RaceOption {
  name: string
  source: string
  abilityIncreases: Partial<Record<string, number>>
  size: string
  speed: number
}

export interface SubclassOption {
  name: string
  shortName: string
  source: string
}

export interface ClassOption {
  name: string
  source: string
  hitDie: number
  savingThrows: string[]
  subclasses: SubclassOption[]
}

export interface BackgroundOption {
  name: string
  source: string
  skillProficiencies: string[]
}

export interface SpellOption {
  name: string
  source: string
  level: number
  school: string
  castingTime: string
  range: string
  components: string
  duration: string
}

// ---- Lookup maps ----

const SCHOOL_ABBR: Record<string, string> = {
  A: 'Abjuration', C: 'Conjuration', D: 'Divination',
  EN: 'Enchantment', EV: 'Evocation', I: 'Illusion',
  N: 'Necromancy', T: 'Transmutation',
}

const STAT_ABBR: Record<string, string> = {
  str: 'strength', dex: 'dexterity', con: 'constitution',
  int: 'intelligence', wis: 'wisdom', cha: 'charisma',
}

const STAT_FULL: Record<string, string> = {
  str: 'Strength', dex: 'Dexterity', con: 'Constitution',
  int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma',
}

// ---- Format helpers ----

function formatRange(r?: RawSpell['range']): string {
  if (!r) return ''
  if (r.type === 'self') return 'Self'
  if (r.type === 'touch') return 'Touch'
  if (r.type === 'sight') return 'Sight'
  if (r.type === 'unlimited') return 'Unlimited'
  if (r.type === 'special') return 'Special'
  if (r.distance) {
    const d = r.distance
    if (d.type === 'feet') return `${d.amount} ft.`
    if (d.type === 'miles') return `${d.amount} mi.`
    return String(d.amount ?? '')
  }
  return r.type
}

function formatComponents(c?: RawSpell['components']): string {
  if (!c) return ''
  const parts: string[] = []
  if (c.v) parts.push('V')
  if (c.s) parts.push('S')
  if (c.m) {
    if (typeof c.m === 'string') parts.push(`M (${c.m})`)
    else if (typeof c.m === 'object' && 'text' in c.m) parts.push(`M (${(c.m as { text: string }).text})`)
    else parts.push('M')
  }
  return parts.join(', ')
}

function formatDuration(dur?: RawSpell['duration']): string {
  if (!dur?.length) return ''
  const d = dur[0]
  if (d.type === 'instant') return 'Instantaneous'
  if (d.type === 'permanent') return 'Until dispelled'
  if (d.type === 'special') return 'Special'
  if (d.duration) {
    const amt = d.duration.amount ?? 1
    const unit = d.duration.type
    const base = `${amt} ${unit}${amt !== 1 ? 's' : ''}`
    return d.concentration ? `Conc., up to ${base}` : base
  }
  return d.type
}

// ---- Public API ----

export async function getRaces(): Promise<RaceOption[]> {
  const raw = await fetchJson<{ race: RawRace[] }>('races.json')
  const seen = new Set<string>()
  const result: RaceOption[] = []

  for (const r of raw.race) {
    if (r.edition === 'one') continue
    if (seen.has(r.name)) continue
    seen.add(r.name)

    const asi: Partial<Record<string, number>> = {}
    for (const entry of r.ability ?? []) {
      for (const [k, v] of Object.entries(entry)) {
        if (k !== 'choose') {
          const key = STAT_ABBR[k] ?? k
          asi[key] = (asi[key] ?? 0) + (v as number)
        }
      }
    }

    result.push({
      name: r.name,
      source: r.source,
      abilityIncreases: asi,
      size: r.size?.[0] ?? 'M',
      speed: typeof r.speed === 'number' ? r.speed : (r.speed?.walk ?? 30),
    })
  }

  return result.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getClasses(): Promise<ClassOption[]> {
  const index = await fetchJson<Record<string, string>>('class/index.json')
  const classes: ClassOption[] = []

  await Promise.all(
    Object.values(index).map(async (filename) => {
      try {
        const data = await fetchJson<{ class?: RawClass[]; subclass?: RawSubclass[] }>(`class/${filename}`)
        for (const cls of data.class ?? []) {
          if (cls.edition === 'one') continue
          const subclasses: SubclassOption[] = (data.subclass ?? [])
            .filter(sc => sc.className === cls.name && sc.classSource === cls.source && sc.edition !== 'one')
            .map(sc => ({ name: sc.name, shortName: sc.shortName, source: sc.source }))
            .sort((a, b) => a.name.localeCompare(b.name))

          classes.push({
            name: cls.name,
            source: cls.source,
            hitDie: cls.hd?.faces ?? 8,
            savingThrows: (cls.proficiency ?? []).map(p => STAT_FULL[p] ?? p),
            subclasses,
          })
        }
      } catch { /* ignore individual class file errors */ }
    })
  )

  return classes.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getBackgrounds(): Promise<BackgroundOption[]> {
  const raw = await fetchJson<{ background: RawBackground[] }>('backgrounds.json')
  const seen = new Set<string>()
  const result: BackgroundOption[] = []

  for (const bg of raw.background) {
    if (bg.edition === 'one') continue
    if (seen.has(bg.name)) continue
    seen.add(bg.name)

    const skills: string[] = []
    for (const entry of bg.skillProficiencies ?? []) {
      for (const [k, v] of Object.entries(entry)) {
        if (v === true) {
          // camelCase key → "Title Case" (e.g. animalHandling → "Animal Handling")
          skills.push(k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()))
        }
      }
    }

    result.push({ name: bg.name, source: bg.source, skillProficiencies: skills })
  }

  return result.sort((a, b) => a.name.localeCompare(b.name))
}

const DEFAULT_SPELL_SOURCES = ['PHB', 'XGE', 'TCE']

export async function getSpells(sources: string[] = DEFAULT_SPELL_SOURCES): Promise<SpellOption[]> {
  const index = await fetchJson<Record<string, string>>('spells/index.json')
  const all: SpellOption[] = []

  await Promise.all(
    sources.map(async (src) => {
      const filename = index[src]
      if (!filename) return
      try {
        const data = await fetchJson<{ spell: RawSpell[] }>(`spells/${filename}`)
        for (const s of data.spell) {
          all.push({
            name: s.name,
            source: s.source,
            level: s.level,
            school: SCHOOL_ABBR[s.school] ?? s.school,
            castingTime: s.time ? `${s.time[0].number} ${s.time[0].unit}` : '',
            range: formatRange(s.range),
            components: formatComponents(s.components),
            duration: formatDuration(s.duration),
          })
        }
      } catch { /* ignore */ }
    })
  )

  return all.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
}
