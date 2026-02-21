import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCharacterStore } from '../stores/characterStore'
import { useAuthStore } from '../stores/authStore'
import { createCharacter, updateCharacter } from '../services/characters'
import { exportCharacterJson, importCharacterJson, saveCharacter } from '../services/localStorage'
import { exportCharacterPdf } from '../utils/pdfExport'
import { getRaces, getClasses, getBackgrounds, type RaceOption, type ClassOption, type BackgroundOption } from '../services/fiveETools'
import AbilityScores from '../components/CharacterSheet/AbilityScores'
import CombatStats from '../components/CharacterSheet/CombatStats'
import Skills from '../components/CharacterSheet/Skills'
import Equipment from '../components/CharacterSheet/Equipment'
import Spells from '../components/CharacterSheet/Spells'
import Features from '../components/CharacterSheet/Features'
import Notes from '../components/CharacterSheet/Notes'
import Input from '../components/UI/Input'
import Combobox from '../components/UI/Combobox'
import Button from '../components/UI/Button'

const TABS = ['Combat', 'Skills', 'Equipment', 'Spells', 'Features', 'Notes'] as const
type Tab = typeof TABS[number]

export default function CharacterSheetPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, id: storeId, cloudId, isDirty, lastLocalSave, loadNew, loadLocal, setField, setCloudId, markSaved } = useCharacterStore()
  const { isAuthenticated } = useAuthStore()
  const [tab, setTab] = useState<Tab>('Combat')
  const [cloudSaving, setCloudSaving] = useState(false)
  const [cloudSaveStatus, setCloudSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [exported, setExported] = useState(false)

  // 5e.tools data (loaded lazily on first focus)
  const [races, setRaces] = useState<RaceOption[]>([])
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [backgrounds, setBackgrounds] = useState<BackgroundOption[]>([])
  const [racesLoading, setRacesLoading] = useState(false)
  const [classesLoading, setClassesLoading] = useState(false)
  const [bgsLoading, setBgsLoading] = useState(false)

  const loadRaces = () => {
    if (races.length || racesLoading) return
    setRacesLoading(true)
    getRaces().then(setRaces).catch(() => {}).finally(() => setRacesLoading(false))
  }
  const loadClasses = () => {
    if (classes.length || classesLoading) return
    setClassesLoading(true)
    getClasses().then(setClasses).catch(() => {}).finally(() => setClassesLoading(false))
  }
  const loadBackgrounds = () => {
    if (backgrounds.length || bgsLoading) return
    setBgsLoading(true)
    getBackgrounds().then(setBackgrounds).catch(() => {}).finally(() => setBgsLoading(false))
  }

  const selectedClass = classes.find(c => c.name === data.basicInfo.class)

  useEffect(() => {
    if (id === 'new') {
      loadNew()
      const newId = useCharacterStore.getState().id
      if (newId) navigate(`/character/${newId}`, { replace: true })
    } else if (id) {
      // If the store already has this character loaded (e.g. navigated from CharacterList),
      // skip the localStorage lookup to avoid clobbering it
      const { id: currentId, cloudId: currentCloudId } = useCharacterStore.getState()
      if (currentId === id || currentCloudId === id) return

      const loaded = loadLocal(id)
      if (!loaded) navigate('/character/new')
    }
  }, [id, loadNew, loadLocal, navigate])

  const handleBasicInfo = (field: string, value: string | number) => {
    setField('basicInfo', { ...data.basicInfo, [field]: value })
  }

  const handleCloudSave = async () => {
    if (!storeId) return
    setCloudSaving(true)
    setCloudSaveStatus('idle')
    try {
      const payload = { name: data.basicInfo.name || 'Unnamed', data: JSON.stringify(data) }
      if (cloudId) {
        await updateCharacter(cloudId, payload)
      } else {
        const res = await createCharacter(payload)
        setCloudId(res.id)
      }
      markSaved()
      setCloudSaveStatus('saved')
      setTimeout(() => setCloudSaveStatus('idle'), 4000)
    } catch (err) {
      console.error('Cloud save failed:', err)
      setCloudSaveStatus('error')
    } finally {
      setCloudSaving(false)
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    importCharacterJson(file).then(char => {
      saveCharacter(char)
      loadLocal(char.id)
      navigate(`/character/${char.id}`)
    }).catch(err => alert(err.message))
    e.target.value = ''
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            value={data.basicInfo.name}
            onChange={e => handleBasicInfo('name', e.target.value)}
            placeholder="Character Name"
            className="text-2xl font-bold bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-red-500 focus:outline-none w-full text-gray-900 dark:text-gray-100 pb-1"
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {lastLocalSave && (
            <span className="text-xs text-gray-400">
              Saved {lastLocalSave.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {isAuthenticated && isDirty && ' · not synced'}
            </span>
          )}
          <Button size="sm" variant="secondary" onClick={() => {
            if (!storeId) return
            exportCharacterJson({ id: storeId, name: data.basicInfo.name || 'character', data, createdAt: '', updatedAt: '' })
            setExported(true)
            setTimeout(() => setExported(false), 2000)
          }}>
            {exported ? 'Downloaded ✓' : 'Export JSON'}
          </Button>
          <label className="cursor-pointer inline-flex">
            <span className="inline-flex items-center justify-center gap-2 rounded border font-medium transition-colors text-sm px-2.5 py-1 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 cursor-pointer">
              Import JSON
            </span>
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <Button size="sm" variant="secondary" onClick={() => exportCharacterPdf(data, data.basicInfo.name || 'Character')}>
            Export PDF
          </Button>
          {isAuthenticated && (
            <Button
              size="sm"
              onClick={handleCloudSave}
              loading={cloudSaving}
              className={
                cloudSaveStatus === 'saved' ? '!bg-green-600 !border-green-600 hover:!bg-green-700' :
                cloudSaveStatus === 'error' ? '!bg-red-700 !border-red-700' : ''
              }
            >
              {cloudSaveStatus === 'saved' ? 'Saved ✓' : cloudSaveStatus === 'error' ? 'Failed — retry?' : cloudId ? 'Update Cloud' : 'Save to Cloud'}
            </Button>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <Combobox
          label="Race"
          value={data.basicInfo.race}
          onChange={v => handleBasicInfo('race', v)}
          options={races.map(r => ({ value: r.name, label: r.name, sublabel: r.source }))}
          loading={racesLoading}
          onFocus={loadRaces}
          placeholder="Human, Elf…"
        />
        <Combobox
          label="Class"
          value={data.basicInfo.class}
          onChange={v => handleBasicInfo('class', v)}
          options={classes.map(c => ({ value: c.name, label: c.name, sublabel: `d${c.hitDie}` }))}
          loading={classesLoading}
          onFocus={loadClasses}
          placeholder="Fighter, Wizard…"
        />
        <Combobox
          label="Subclass"
          value={data.basicInfo.subclass}
          onChange={v => handleBasicInfo('subclass', v)}
          options={(selectedClass?.subclasses ?? []).map(sc => ({ value: sc.name, label: sc.name, sublabel: sc.source }))}
          onFocus={loadClasses}
          placeholder="Select class first"
        />
        <Input
          label="Level"
          type="number"
          value={data.basicInfo.level as unknown as string}
          onChange={e => handleBasicInfo('level', parseInt(e.target.value) || 0)}
        />
        <Combobox
          label="Background"
          value={data.basicInfo.background}
          onChange={v => handleBasicInfo('background', v)}
          options={backgrounds.map(b => ({ value: b.name, label: b.name, sublabel: b.source }))}
          loading={bgsLoading}
          onFocus={loadBackgrounds}
          placeholder="Acolyte, Soldier…"
        />
        <Input
          label="Alignment"
          type="text"
          value={data.basicInfo.alignment}
          onChange={e => handleBasicInfo('alignment', e.target.value)}
        />
        <Input
          label="XP"
          type="number"
          value={data.basicInfo.experiencePoints as unknown as string}
          onChange={e => handleBasicInfo('experiencePoints', parseInt(e.target.value) || 0)}
        />
      </div>

      {/* Ability Scores always visible */}
      <div className="mb-6">
        <AbilityScores />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav className="flex gap-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {tab === 'Combat' && <CombatStats />}
        {tab === 'Skills' && <Skills />}
        {tab === 'Equipment' && <Equipment />}
        {tab === 'Spells' && <Spells />}
        {tab === 'Features' && <Features />}
        {tab === 'Notes' && <Notes />}
      </div>
    </main>
  )
}
