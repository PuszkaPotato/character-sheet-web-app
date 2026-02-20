import api from './api'
import type { CharacterDto, CreateCharacterRequest, UpdateCharacterRequest } from '../types/api'

export async function getCharacters(): Promise<CharacterDto[]> {
  const res = await api.get<CharacterDto[]>('/characters')
  return res.data
}

export async function getCharacter(id: string): Promise<CharacterDto> {
  const res = await api.get<CharacterDto>(`/characters/${id}`)
  return res.data
}

export async function createCharacter(data: CreateCharacterRequest): Promise<CharacterDto> {
  const res = await api.post<CharacterDto>('/characters', data)
  return res.data
}

export async function updateCharacter(id: string, data: UpdateCharacterRequest): Promise<CharacterDto> {
  const res = await api.put<CharacterDto>(`/characters/${id}`, data)
  return res.data
}

export async function deleteCharacter(id: string): Promise<void> {
  await api.delete(`/characters/${id}`)
}
