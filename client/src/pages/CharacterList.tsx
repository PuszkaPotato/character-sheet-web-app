import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useCharacterStore } from '../stores/characterStore'
import { getCharacters, deleteCharacter as deleteCloudCharacter } from '../services/characters'
import { loadAllCharacters, deleteCharacter as deleteLocalCharacter } from '../services/localStorage'
import type { CharacterDto } from '../types/api'
import type { LocalCharacter } from '../services/localStorage'
import Button from '../components/UI/Button'
import Modal from '../components/UI/Modal'

export default function CharacterList() {
  const { isAuthenticated } = useAuthStore()
  const { loadFromCloud, loadLocal } = useCharacterStore()
  const navigate = useNavigate()

  const [cloudChars, setCloudChars] = useState<CharacterDto[]>([])
  const [localChars, setLocalChars] = useState<LocalCharacter[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: 'cloud' | 'local' } | null>(null)

  useEffect(() => {
    setLocalChars(loadAllCharacters())
    if (isAuthenticated) {
      setLoading(true)
      getCharacters()
        .then(setCloudChars)
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [isAuthenticated])

  const openCloudChar = (char: CharacterDto) => {
    loadFromCloud(char)
    // loadFromCloud generates a new local id — navigate to that, not the cloud id,
    // so CharacterSheet can find it in the store without a localStorage lookup
    const localId = useCharacterStore.getState().id
    navigate(`/character/${localId}`)
  }

  const openLocalChar = (char: LocalCharacter) => {
    loadLocal(char.id)
    navigate(`/character/${char.id}`)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'cloud') {
      await deleteCloudCharacter(deleteTarget.id)
      setCloudChars(prev => prev.filter(c => c.id !== deleteTarget.id))
    } else {
      deleteLocalCharacter(deleteTarget.id)
      setLocalChars(prev => prev.filter(c => c.id !== deleteTarget.id))
    }
    setDeleteTarget(null)
  }

  const CharacterCard = ({ name, subtitle, onOpen, onDelete }: { name: string; subtitle: string; onOpen: () => void; onDelete: () => void }) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-red-400 dark:hover:border-red-600 transition-colors">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{name || 'Unnamed Character'}</h3>
      <p className="text-xs text-gray-400 mb-3">{subtitle}</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={onOpen}>Open</Button>
        <Button size="sm" variant="danger" onClick={onDelete}>Delete</Button>
      </div>
    </div>
  )

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Characters</h1>
        <Link to="/character/new"><Button>New Character</Button></Link>
      </div>

      {isAuthenticated && (
        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">Cloud Characters</h2>
          {loading && <p className="text-sm text-gray-400">Loading...</p>}
          {!loading && cloudChars.length === 0 && (
            <p className="text-sm text-gray-400 italic">No cloud characters yet. Create one and click "Save to Cloud".</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {cloudChars.map(c => {
              let subtitle = 'Cloud character'
              try {
                const data = JSON.parse(c.data)
                subtitle = `${data.basicInfo?.race || ''} ${data.basicInfo?.class || ''} — Level ${data.basicInfo?.level || 1}`.trim()
              } catch {}
              return (
                <CharacterCard
                  key={c.id}
                  name={c.name}
                  subtitle={subtitle}
                  onOpen={() => openCloudChar(c)}
                  onDelete={() => setDeleteTarget({ id: c.id, name: c.name, type: 'cloud' })}
                />
              )
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">Local Characters</h2>
        {localChars.length === 0 && (
          <p className="text-sm text-gray-400 italic">No local characters. <Link to="/character/new" className="text-red-600 hover:underline">Create one now.</Link></p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {localChars.map(c => {
            const { basicInfo } = c.data
            const subtitle = `${basicInfo?.race || ''} ${basicInfo?.class || ''} — Level ${basicInfo?.level || 1}`.trim()
            return (
              <CharacterCard
                key={c.id}
                name={c.name || basicInfo?.name || 'Unnamed'}
                subtitle={subtitle}
                onOpen={() => openLocalChar(c)}
                onDelete={() => setDeleteTarget({ id: c.id, name: c.name, type: 'local' })}
              />
            )
          })}
        </div>
      </section>

      <Modal
        open={!!deleteTarget}
        title="Delete Character"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
      </Modal>
    </main>
  )
}
