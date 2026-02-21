import { useState } from 'react'
import { useCharacterStore } from '../../stores/characterStore'
import type { Spell, Cantrip, Ability } from '../../types/character'
import type { SpellOption } from '../../services/fiveETools'
import { formatModifier } from '../../utils/calculations'
import Card from '../UI/Card'
import Button from '../UI/Button'
import Input from '../UI/Input'
import NumberStepper from '../UI/NumberStepper'
import SpellPicker from '../UI/SpellPicker'

const SPELL_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export default function Spells() {
  const { data, update } = useCharacterStore()
  const { spellcasting } = data
  const [addingSpell, setAddingSpell] = useState(false)
  const [spellPickerOpen, setSpellPickerOpen] = useState(false)
  const [newSpell, setNewSpell] = useState({ name: '', level: 1, school: '', description: '' })

  const setAbility = (ability: Ability | '') => {
    update(d => { d.spellcasting.spellcastingAbility = ability })
  }

  const addFromPicker = (s: SpellOption) => {
    if (s.level === 0) {
      const cantrip: Cantrip = { id: crypto.randomUUID(), name: s.name, school: s.school, description: '' }
      update(d => { d.spellcasting.cantrips.push(cantrip) })
    } else {
      const spell: Spell = {
        id: crypto.randomUUID(),
        name: s.name,
        level: s.level,
        school: s.school,
        castingTime: s.castingTime,
        range: s.range,
        components: s.components,
        duration: s.duration,
        description: '',
        prepared: false,
      }
      update(d => { d.spellcasting.spellsKnown.push(spell) })
    }
  }

  const addSpell = () => {
    if (!newSpell.name.trim()) return
    if (newSpell.level === 0) {
      const cantrip: Cantrip = { id: crypto.randomUUID(), name: newSpell.name, school: newSpell.school, description: newSpell.description }
      update(d => { d.spellcasting.cantrips.push(cantrip) })
    } else {
      const spell: Spell = {
        id: crypto.randomUUID(),
        name: newSpell.name,
        level: newSpell.level,
        school: newSpell.school,
        castingTime: '1 action',
        range: '',
        components: '',
        duration: '',
        description: newSpell.description,
        prepared: false,
      }
      update(d => { d.spellcasting.spellsKnown.push(spell) })
    }
    setNewSpell({ name: '', level: 1, school: '', description: '' })
    setAddingSpell(false)
  }

  const togglePrepared = (id: string) => {
    update(d => {
      const spell = d.spellcasting.spellsKnown.find(s => s.id === id)
      if (spell) spell.prepared = !spell.prepared
    })
  }

  const removeSpell = (id: string) => {
    update(d => {
      d.spellcasting.spellsKnown = d.spellcasting.spellsKnown.filter(s => s.id !== id)
      d.spellcasting.cantrips = d.spellcasting.cantrips.filter(c => c.id !== id)
    })
  }

  const setSlotUsed = (level: string, used: number) => {
    update(d => {
      if (!d.spellcasting.spellSlots[level]) d.spellcasting.spellSlots[level] = { max: 0, used: 0 }
      d.spellcasting.spellSlots[level].used = used
    })
  }

  const setSlotMax = (level: string, max: number) => {
    update(d => {
      if (!d.spellcasting.spellSlots[level]) d.spellcasting.spellSlots[level] = { max: 0, used: 0 }
      d.spellcasting.spellSlots[level].max = max
    })
  }

  return (
    <Card title="Spellcasting">
      <div className="space-y-4">
        {/* Spellcasting ability */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Spellcasting Ability</span>
            <select
              value={spellcasting.spellcastingAbility}
              onChange={e => setAbility(e.target.value as Ability | '')}
              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">— None —</option>
              {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as Ability[]).map(a => (
                <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
              ))}
            </select>
          </div>
          {spellcasting.spellcastingAbility && (
            <>
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Save DC</div>
                <div className="text-lg font-bold">{spellcasting.spellSaveDC}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Spell Attack</div>
                <div className="text-lg font-bold">{formatModifier(spellcasting.spellAttackBonus)}</div>
              </div>
            </>
          )}
        </div>

        {/* Spell Slots */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Spell Slots</h4>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {SPELL_LEVELS.map(lvl => {
              const slot = spellcasting.spellSlots[String(lvl)] ?? { max: 0, used: 0 }
              return (
                <div key={lvl} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400">Lvl {lvl}</span>
                  <div className="flex items-center gap-0.5">
                    <NumberStepper size="sm" value={slot.used} onChange={v => setSlotUsed(String(lvl), v)} min={0} label={`Level ${lvl} used`} />
                    <span className="text-gray-400 text-xs px-0.5">/</span>
                    <NumberStepper size="sm" value={slot.max} onChange={v => setSlotMax(String(lvl), v)} min={0} label={`Level ${lvl} max`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cantrips */}
        {spellcasting.cantrips.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Cantrips</h4>
            <div className="space-y-0.5">
              {spellcasting.cantrips.map(c => (
                <div key={c.id} className="flex items-center gap-2 text-sm group">
                  <span className="flex-1 text-gray-800 dark:text-gray-200">{c.name}</span>
                  {c.school && <span className="text-xs text-gray-400">{c.school}</span>}
                  <button onClick={() => removeSpell(c.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity text-xs" aria-label="Remove">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spells by level */}
        {spellcasting.spellsKnown.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Spells</h4>
            <div className="space-y-0.5">
              {spellcasting.spellsKnown.map(s => (
                <div key={s.id} className="flex items-center gap-2 text-sm group">
                  <button onClick={() => togglePrepared(s.id)} className={`text-base ${s.prepared ? 'text-red-600' : 'text-gray-400'}`} aria-label="Toggle prepared">
                    {s.prepared ? '●' : '○'}
                  </button>
                  <span className="text-gray-400 text-xs">Lvl {s.level}</span>
                  <span className="flex-1 text-gray-800 dark:text-gray-200">{s.name}</span>
                  {s.school && <span className="text-xs text-gray-400">{s.school}</span>}
                  <button onClick={() => removeSpell(s.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity text-xs" aria-label="Remove">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add spell */}
        {addingSpell ? (
          <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="grid grid-cols-2 gap-2">
              <Input label="Name" value={newSpell.name} onChange={e => setNewSpell(p => ({ ...p, name: e.target.value }))} placeholder="Fireball" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Level (0=cantrip)</span>
                <input type="number" min={0} max={9} value={newSpell.level} onChange={e => setNewSpell(p => ({ ...p, level: parseInt(e.target.value) || 0 }))}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden" />
              </div>
            </div>
            <Input label="School (optional)" value={newSpell.school} onChange={e => setNewSpell(p => ({ ...p, school: e.target.value }))} />
            <div className="flex gap-2">
              <Button size="sm" onClick={addSpell}>Add</Button>
              <Button size="sm" variant="secondary" onClick={() => setAddingSpell(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setSpellPickerOpen(true)}>Browse 5e Spells</Button>
            <Button size="sm" variant="secondary" onClick={() => setAddingSpell(true)}>+ Add Manually</Button>
          </div>
        )}

        <SpellPicker
          open={spellPickerOpen}
          onClose={() => setSpellPickerOpen(false)}
          onSelect={addFromPicker}
        />
      </div>
    </Card>
  )
}
