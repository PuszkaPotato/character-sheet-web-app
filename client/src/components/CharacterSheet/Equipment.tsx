import { useState } from 'react'
import { useCharacterStore } from '../../stores/characterStore'
import type { EquipmentItem } from '../../types/character'
import Card from '../UI/Card'
import Button from '../UI/Button'
import Input from '../UI/Input'

export default function Equipment() {
  const { data, update } = useCharacterStore()
  const { equipment, currency } = data
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, weight: 0, description: '' })

  const addItem = () => {
    if (!newItem.name.trim()) return
    const item: EquipmentItem = {
      id: crypto.randomUUID(),
      ...newItem,
      equipped: false,
    }
    update(d => { d.equipment.push(item) })
    setNewItem({ name: '', quantity: 1, weight: 0, description: '' })
    setAdding(false)
  }

  const removeItem = (id: string) => {
    update(d => { d.equipment = d.equipment.filter(i => i.id !== id) })
  }

  const toggleEquipped = (id: string) => {
    update(d => {
      const item = d.equipment.find(i => i.id === id)
      if (item) item.equipped = !item.equipped
    })
  }

  const setCurrency = (field: keyof typeof currency, val: string) => {
    update(d => { d.currency[field] = parseInt(val) || 0 })
  }

  return (
    <div className="space-y-3">
      <Card title="Currency">
        <div className="grid grid-cols-5 gap-2">
          {(['copper', 'silver', 'electrum', 'gold', 'platinum'] as const).map(c => (
            <div key={c} className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{c[0].toUpperCase()}P</span>
              <input
                type="number"
                min={0}
                value={currency[c]}
                onChange={(e) => setCurrency(c, e.target.value)}
                className="w-full text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label={c}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Equipment">
        <div className="space-y-1 mb-3">
          {equipment.length === 0 && <p className="text-sm text-gray-400 italic">No items yet.</p>}
          {equipment.map(item => (
            <div key={item.id} className="flex items-center gap-2 text-sm group">
              <button
                onClick={() => toggleEquipped(item.id)}
                className={`text-base ${item.equipped ? 'text-red-600' : 'text-gray-400'}`}
                aria-label="Toggle equipped"
              >
                {item.equipped ? '⚔️' : '○'}
              </button>
              <span className="flex-1 text-gray-800 dark:text-gray-200">
                {item.name}
                {item.quantity > 1 && <span className="text-gray-400 ml-1">x{item.quantity}</span>}
                {item.weight > 0 && <span className="text-gray-400 ml-1">({item.weight}lb)</span>}
              </span>
              <button
                onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity text-xs"
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {adding ? (
          <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="grid grid-cols-2 gap-2">
              <Input label="Name" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} placeholder="Sword" />
              <Input label="Qty" type="number" value={newItem.quantity} onChange={e => setNewItem(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))} />
            </div>
            <Input label="Weight (lb)" type="number" value={newItem.weight} onChange={e => setNewItem(p => ({ ...p, weight: parseFloat(e.target.value) || 0 }))} />
            <Input label="Description" value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} />
            <div className="flex gap-2">
              <Button size="sm" onClick={addItem}>Add</Button>
              <Button size="sm" variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>+ Add Item</Button>
        )}
      </Card>
    </div>
  )
}
