import jsPDF from 'jspdf'
import type { CharacterData } from '../types/character'
import { abilityModifier, proficiencyBonus, skillBonus, savingThrowBonus, formatModifier, SKILL_ABILITY_MAP, SKILL_LABELS } from './calculations'

export function exportCharacterPdf(data: CharacterData, _characterName: string): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const prof = proficiencyBonus(data.basicInfo.level)
  const margin = 15
  let y = margin

  const line = (text: string, indent = 0) => {
    doc.text(text, margin + indent, y)
    y += 6
  }

  const section = (title: string) => {
    y += 2
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin, y)
    y += 6
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
  }

  const field = (label: string, value: string | number, indent = 0) => {
    doc.setFont('helvetica', 'bold')
    doc.text(`${label}: `, margin + indent, y)
    doc.setFont('helvetica', 'normal')
    doc.text(String(value), margin + indent + doc.getTextWidth(`${label}: `), y)
    y += 6
  }

  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(data.basicInfo.name || 'Unnamed Character', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const { basicInfo } = data
  doc.text(`${basicInfo.race} ${basicInfo.class}${basicInfo.subclass ? ` (${basicInfo.subclass})` : ''} — Level ${basicInfo.level}`, margin, y)
  y += 5
  doc.text(`Background: ${basicInfo.background || '—'}  |  Alignment: ${basicInfo.alignment || '—'}  |  XP: ${basicInfo.experiencePoints}`, margin, y)
  y += 8

  // Ability Scores
  section('ABILITY SCORES')
  const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const
  const abilityLabels = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
  const colW = 30
  abilities.forEach((ab, i) => {
    const score = data.abilities[ab]
    const mod = abilityModifier(score)
    doc.setFont('helvetica', 'bold')
    doc.text(abilityLabels[i], margin + i * colW, y)
    doc.setFont('helvetica', 'normal')
    doc.text(`${score} (${formatModifier(mod)})`, margin + i * colW, y + 5)
  })
  y += 12

  // Combat Stats
  section('COMBAT')
  const { combat } = data
  doc.text(`AC: ${combat.armorClass}  |  Initiative: ${formatModifier(combat.initiative)}  |  Speed: ${combat.speed} ft`, margin, y)
  y += 6
  doc.text(`HP: ${combat.currentHitPoints}/${combat.maxHitPoints}  |  Temp HP: ${combat.temporaryHitPoints}  |  Hit Dice: ${combat.hitDice.total}`, margin, y)
  y += 6
  doc.text(`Prof. Bonus: ${formatModifier(prof)}`, margin, y)
  y += 8

  // Saving Throws
  section('SAVING THROWS')
  abilities.forEach((ab, i) => {
    const bonus = savingThrowBonus(data.abilities[ab], data.savingThrows[ab], prof)
    const prof_mark = data.savingThrows[ab].proficient ? '●' : '○'
    doc.text(`${prof_mark} ${abilityLabels[i]}: ${formatModifier(bonus)}`, margin + (i < 3 ? 0 : 80), y + (i % 3) * 6)
  })
  y += 22

  // Skills
  section('SKILLS')
  const skillKeys = Object.keys(data.skills) as Array<keyof typeof data.skills>
  skillKeys.forEach((sk, i) => {
    const ability = SKILL_ABILITY_MAP[sk]
    const bonus = skillBonus(data.abilities[ability], data.skills[sk], prof)
    const mark = data.skills[sk].expertise ? '◆' : data.skills[sk].proficient ? '●' : '○'
    const col = i < 9 ? 0 : 90
    const row = i % 9
    doc.text(`${mark} ${SKILL_LABELS[sk]}: ${formatModifier(bonus)}`, margin + col, y + row * 6)
  })
  y += 60

  // Check page overflow
  if (y > 250) { doc.addPage(); y = margin }

  // Equipment
  if (data.equipment.length > 0) {
    section('EQUIPMENT')
    data.equipment.forEach(item => {
      line(`${item.equipped ? '[E]' : '   '} ${item.name} x${item.quantity}${item.weight ? ` (${item.weight} lb)` : ''}`)
    })
    y += 2
  }

  // Currency
  section('CURRENCY')
  const { currency } = data
  doc.text(`CP: ${currency.copper}  SP: ${currency.silver}  EP: ${currency.electrum}  GP: ${currency.gold}  PP: ${currency.platinum}`, margin, y)
  y += 8

  // Spellcasting
  if (data.spellcasting.spellcastingAbility) {
    if (y > 220) { doc.addPage(); y = margin }
    section('SPELLCASTING')
    const { spellcasting } = data
    doc.text(`Ability: ${spellcasting.spellcastingAbility}  |  Spell Save DC: ${spellcasting.spellSaveDC}  |  Spell Attack: ${formatModifier(spellcasting.spellAttackBonus)}`, margin, y)
    y += 6
    if (spellcasting.cantrips.length > 0) {
      doc.setFont('helvetica', 'bold')
      doc.text('Cantrips:', margin, y)
      doc.setFont('helvetica', 'normal')
      y += 5
      spellcasting.cantrips.forEach(c => line(c.name, 4))
    }
    if (spellcasting.spellsKnown.length > 0) {
      doc.setFont('helvetica', 'bold')
      doc.text('Spells:', margin, y)
      doc.setFont('helvetica', 'normal')
      y += 5
      spellcasting.spellsKnown.forEach(s => {
        const prep = s.prepared ? '[P]' : '   '
        line(`${prep} Lvl ${s.level}: ${s.name}`, 4)
      })
    }
    y += 2
  }

  // Features
  if (data.features.length > 0) {
    if (y > 220) { doc.addPage(); y = margin }
    section('FEATURES & TRAITS')
    data.features.concat(data.traits).forEach(f => {
      doc.setFont('helvetica', 'bold')
      if (y > 270) { doc.addPage(); y = margin }
      doc.text(`${f.name} (${f.source})`, margin, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(f.description, 175)
      doc.text(lines, margin, y)
      y += lines.length * 5 + 3
    })
  }

  // Personality
  if (y > 230) { doc.addPage(); y = margin }
  section('PERSONALITY')
  const { personality } = data
  if (personality.traits) field('Traits', personality.traits)
  if (personality.ideals) field('Ideals', personality.ideals)
  if (personality.bonds) field('Bonds', personality.bonds)
  if (personality.flaws) field('Flaws', personality.flaws)

  // Notes
  if (data.notes) {
    if (y > 220) { doc.addPage(); y = margin }
    section('NOTES')
    const lines = doc.splitTextToSize(data.notes, 175)
    doc.text(lines, margin, y)
  }

  const filename = `${(basicInfo.name || 'Character').replace(/\s+/g, '_')}_Level${basicInfo.level}_${basicInfo.class || 'Unknown'}.pdf`
  doc.save(filename)
}
