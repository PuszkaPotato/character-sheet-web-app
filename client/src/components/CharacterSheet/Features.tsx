import { useState } from 'react'
import { useCharacterStore } from '../../stores/characterStore'
import type { Feature } from '../../types/character'
import Card from '../UI/Card'
import Button from '../UI/Button'
import Input from '../UI/Input'

export default function Features() {
  const { data, update } = useCharacterStore()
  const [adding, setAdding] = useState(false)
  const [newFeature, setNewFeature] = useState({ name: '', source: '', description: '' })

  const add = () => {
    if (!newFeature.name.trim()) return
    const feature: Feature = { id: crypto.randomUUID(), ...newFeature }
    update(d => { d.features.push(feature) })
    setNewFeature({ name: '', source: '', description: '' })
    setAdding(false)
  }

  const remove = (id: string) => {
    update(d => { d.features = d.features.filter(f => f.id !== id) })
  }

  return (
    <Card title="Features & Traits">
      <div className="space-y-2 mb-3">
        {data.features.length === 0 && <p className="text-sm text-gray-400 italic">No features yet.</p>}
        {data.features.map(f => (
          <div key={f.id} className="group border border-gray-200 dark:border-gray-700 rounded p-2 text-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{f.name}</span>
                {f.source && <span className="ml-2 text-xs text-gray-400">({f.source})</span>}
              </div>
              <button onClick={() => remove(f.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity text-xs" aria-label="Remove">✕</button>
            </div>
            {f.description && <p className="mt-1 text-gray-600 dark:text-gray-400 text-xs">{f.description}</p>}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <Input label="Feature Name" value={newFeature.name} onChange={e => setNewFeature(p => ({ ...p, name: e.target.value }))} placeholder="Sneak Attack" />
            <Input label="Source" value={newFeature.source} onChange={e => setNewFeature(p => ({ ...p, source: e.target.value }))} placeholder="Rogue" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</label>
            <textarea
              value={newFeature.description}
              onChange={e => setNewFeature(p => ({ ...p, description: e.target.value }))}
              rows={2}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={add}>Add</Button>
            <Button size="sm" variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>+ Add Feature</Button>
      )}
    </Card>
  )
}
