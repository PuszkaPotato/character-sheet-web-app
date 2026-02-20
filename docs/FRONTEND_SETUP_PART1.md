# Frontend Setup - React + TypeScript (Part 1/2)

## Initial Setup

### Create Vite Project
```bash
cd client
npm create vite@latest . -- --template react-ts
npm install
```

### Install Dependencies
```bash
# Core dependencies
npm install zustand react-router-dom axios

# PDF export
npm install jspdf jspdf-autotable
npm install @types/jspdf-autotable --save-dev

# Forms
npm install react-hook-form

# Styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Dev tools
npm install -D @types/node
```

### Configure Tailwind CSS

**tailwind.config.js:**
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
    },
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100;
  }
}
```

### Environment Variables

**src/vite-env.d.ts:**
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

**.env.development:**
```
VITE_API_URL=http://localhost:5000/api
```

**.env.production:**
```
VITE_API_URL=https://your-api-domain.com/api
```

---

## TypeScript Types

### src/types/character.ts

```typescript
export interface Character {
  id?: string;
  userId?: string;
  name: string;
  data: CharacterData;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CharacterData {
  basicInfo: BasicInfo;
  abilities: Abilities;
  proficiencyBonus: number;
  savingThrows: Record<AbilityKey, Proficiency>;
  skills: Record<SkillKey, SkillProficiency>;
  combat: Combat;
  equipment: EquipmentItem[];
  currency: Currency;
  spellcasting?: Spellcasting;
  features: Feature[];
  traits: Trait[];
  proficiencies: Proficiencies;
  personality: Personality;
  backstory: string;
  appearance: Appearance;
  allies: string[];
  notes: string;
}

export interface BasicInfo {
  name: string;
  race: string;
  class: string;
  subclass?: string;
  level: number;
  background: string;
  alignment: string;
  experiencePoints: number;
}

export type AbilityKey = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

export interface Abilities {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Proficiency {
  proficient: boolean;
}

export type SkillKey = 
  | 'acrobatics' | 'animalHandling' | 'arcana' | 'athletics'
  | 'deception' | 'history' | 'insight' | 'intimidation'
  | 'investigation' | 'medicine' | 'nature' | 'perception'
  | 'performance' | 'persuasion' | 'religion' | 'sleightOfHand'
  | 'stealth' | 'survival';

export interface SkillProficiency extends Proficiency {
  expertise: boolean;
}

export interface Combat {
  armorClass: number;
  initiative: number;
  speed: number;
  maxHitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  hitDice: HitDice;
  deathSaves: DeathSaves;
}

export interface HitDice {
  total: string;
  current: number;
}

export interface DeathSaves {
  successes: number;
  failures: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  description: string;
  equipped: boolean;
}

export interface Currency {
  copper: number;
  silver: number;
  electrum: number;
  gold: number;
  platinum: number;
}

export interface Spellcasting {
  spellcastingAbility: AbilityKey;
  spellSaveDC: number;
  spellAttackBonus: number;
  spellSlots: Record<number, SpellSlot>;
  spellsKnown: Spell[];
  cantrips: Cantrip[];
}

export interface SpellSlot {
  max: number;
  used: number;
}

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared: boolean;
}

export interface Cantrip {
  id: string;
  name: string;
  school: string;
  description: string;
}

export interface Feature {
  id: string;
  name: string;
  source: string;
  description: string;
}

export interface Trait {
  id: string;
  name: string;
  source: string;
  description: string;
}

export interface Proficiencies {
  armor: string[];
  weapons: string[];
  tools: string[];
  languages: string[];
}

export interface Personality {
  traits: string;
  ideals: string;
  bonds: string;
  flaws: string;
}

export interface Appearance {
  age: number;
  height: string;
  weight: string;
  eyes: string;
  skin: string;
  hair: string;
  portraitUrl?: string;
}
```

### src/types/api.ts

```typescript
export interface AuthResponse {
  userId: string;
  username: string;
  email: string;
  token: string;
  expiresAt: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
```

---

## Services Layer

### src/services/api.ts

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### src/services/auth.ts

```typescript
import { api } from './api';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/api';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('authToken');
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
```

### src/services/characters.ts

```typescript
import { api } from './api';
import type { Character } from '../types/character';

export const charactersService = {
  async getAll(): Promise<Character[]> {
    const response = await api.get<Character[]>('/characters');
    return response.data;
  },

  async getById(id: string): Promise<Character> {
    const response = await api.get<Character>(`/characters/${id}`);
    return response.data;
  },

  async create(character: Character): Promise<Character> {
    const response = await api.post<Character>('/characters', {
      name: character.name,
      data: character.data,
    });
    return response.data;
  },

  async update(id: string, character: Partial<Character>): Promise<Character> {
    const response = await api.put<Character>(`/characters/${id}`, {
      name: character.name,
      data: character.data,
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/characters/${id}`);
  },
};
```

### src/services/localStorage.ts

```typescript
import type { Character } from '../types/character';

const STORAGE_KEY = 'dnd_characters';

export const localStorageService = {
  saveCharacter(character: Character): void {
    const characters = this.loadAll();
    const existingIndex = characters.findIndex((c) => c.id === character.id);
    
    if (existingIndex >= 0) {
      characters[existingIndex] = character;
    } else {
      characters.push(character);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  },

  loadCharacter(id: string): Character | null {
    const characters = this.loadAll();
    return characters.find((c) => c.id === id) || null;
  },

  loadAll(): Character[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  deleteCharacter(id: string): void {
    const characters = this.loadAll().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  },

  exportAsJson(character: Character): void {
    const dataStr = JSON.stringify(character, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${character.name.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  importFromJson(file: File): Promise<Character> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const character = JSON.parse(e.target?.result as string);
          resolve(character);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },
};
```

---

## Utility Functions

### src/utils/calculations.ts

```typescript
import type { AbilityKey, Abilities, SkillKey, SkillProficiency } from '../types/character';

export function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function calculateProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

export function calculateSkillBonus(
  ability: AbilityKey,
  abilities: Abilities,
  skill: SkillProficiency,
  level: number
): number {
  const abilityMod = calculateAbilityModifier(abilities[ability]);
  const profBonus = calculateProficiencyBonus(level);
  
  let bonus = abilityMod;
  if (skill.proficient) {
    bonus += profBonus;
  }
  if (skill.expertise) {
    bonus += profBonus; // Expertise = double proficiency
  }
  
  return bonus;
}

export function calculateSpellSaveDC(
  spellcastingAbility: AbilityKey,
  abilities: Abilities,
  level: number
): number {
  const abilityMod = calculateAbilityModifier(abilities[spellcastingAbility]);
  const profBonus = calculateProficiencyBonus(level);
  return 8 + abilityMod + profBonus;
}

export function calculateSpellAttackBonus(
  spellcastingAbility: AbilityKey,
  abilities: Abilities,
  level: number
): number {
  const abilityMod = calculateAbilityModifier(abilities[spellcastingAbility]);
  const profBonus = calculateProficiencyBonus(level);
  return abilityMod + profBonus;
}

export const SKILL_ABILITY_MAP: Record<SkillKey, AbilityKey> = {
  acrobatics: 'dexterity',
  animalHandling: 'wisdom',
  arcana: 'intelligence',
  athletics: 'strength',
  deception: 'charisma',
  history: 'intelligence',
  insight: 'wisdom',
  intimidation: 'charisma',
  investigation: 'intelligence',
  medicine: 'wisdom',
  nature: 'intelligence',
  perception: 'wisdom',
  performance: 'charisma',
  persuasion: 'charisma',
  religion: 'intelligence',
  sleightOfHand: 'dexterity',
  stealth: 'dexterity',
  survival: 'wisdom',
};
```

