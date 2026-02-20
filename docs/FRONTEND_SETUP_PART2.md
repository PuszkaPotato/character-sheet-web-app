# Frontend Setup - React + TypeScript (Part 2/2)

## Zustand Stores

### src/stores/characterStore.ts

```typescript
import { create } from 'zustand';
import type { Character, CharacterData, AbilityKey } from '../types/character';
import { calculateAbilityModifier, calculateProficiencyBonus, calculateSpellSaveDC, calculateSpellAttackBonus } from '../utils/calculations';
import { v4 as uuidv4 } from 'uuid';

interface CharacterStore {
  character: Character | null;
  setCharacter: (character: Character) => void;
  updateCharacterData: (data: Partial<CharacterData>) => void;
  updateBasicInfo: (info: Partial<CharacterData['basicInfo']>) => void;
  updateAbility: (ability: AbilityKey, value: number) => void;
  createNewCharacter: () => void;
  clearCharacter: () => void;
}

const DEFAULT_CHARACTER_DATA: CharacterData = {
  basicInfo: {
    name: '',
    race: '',
    class: '',
    level: 1,
    background: '',
    alignment: 'True Neutral',
    experiencePoints: 0,
  },
  abilities: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  proficiencyBonus: 2,
  savingThrows: {
    strength: { proficient: false },
    dexterity: { proficient: false },
    constitution: { proficient: false },
    intelligence: { proficient: false },
    wisdom: { proficient: false },
    charisma: { proficient: false },
  },
  skills: {
    acrobatics: { proficient: false, expertise: false },
    animalHandling: { proficient: false, expertise: false },
    arcana: { proficient: false, expertise: false },
    athletics: { proficient: false, expertise: false },
    deception: { proficient: false, expertise: false },
    history: { proficient: false, expertise: false },
    insight: { proficient: false, expertise: false },
    intimidation: { proficient: false, expertise: false },
    investigation: { proficient: false, expertise: false },
    medicine: { proficient: false, expertise: false },
    nature: { proficient: false, expertise: false },
    perception: { proficient: false, expertise: false },
    performance: { proficient: false, expertise: false },
    persuasion: { proficient: false, expertise: false },
    religion: { proficient: false, expertise: false },
    sleightOfHand: { proficient: false, expertise: false },
    stealth: { proficient: false, expertise: false },
    survival: { proficient: false, expertise: false },
  },
  combat: {
    armorClass: 10,
    initiative: 0,
    speed: 30,
    maxHitPoints: 10,
    currentHitPoints: 10,
    temporaryHitPoints: 0,
    hitDice: { total: '1d8', current: 1 },
    deathSaves: { successes: 0, failures: 0 },
  },
  equipment: [],
  currency: { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 },
  features: [],
  traits: [],
  proficiencies: { armor: [], weapons: [], tools: [], languages: ['Common'] },
  personality: { traits: '', ideals: '', bonds: '', flaws: '' },
  backstory: '',
  appearance: {
    age: 25,
    height: "5'10\"",
    weight: '150 lbs',
    eyes: 'Brown',
    skin: 'Fair',
    hair: 'Black',
  },
  allies: [],
  notes: '',
};

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  character: null,

  setCharacter: (character) => set({ character }),

  updateCharacterData: (data) =>
    set((state) => {
      if (!state.character) return state;
      return {
        character: {
          ...state.character,
          data: { ...state.character.data, ...data },
        },
      };
    }),

  updateBasicInfo: (info) =>
    set((state) => {
      if (!state.character) return state;
      
      const newLevel = info.level ?? state.character.data.basicInfo.level;
      const newProficiencyBonus = calculateProficiencyBonus(newLevel);
      
      return {
        character: {
          ...state.character,
          name: info.name ?? state.character.name,
          data: {
            ...state.character.data,
            basicInfo: { ...state.character.data.basicInfo, ...info },
            proficiencyBonus: newProficiencyBonus,
          },
        },
      };
    }),

  updateAbility: (ability, value) =>
    set((state) => {
      if (!state.character) return state;
      
      const newAbilities = { ...state.character.data.abilities, [ability]: value };
      const initiative = calculateAbilityModifier(newAbilities.dexterity);
      
      // Update spellcasting stats if applicable
      let spellcasting = state.character.data.spellcasting;
      if (spellcasting && spellcasting.spellcastingAbility === ability) {
        spellcasting = {
          ...spellcasting,
          spellSaveDC: calculateSpellSaveDC(
            ability,
            newAbilities,
            state.character.data.basicInfo.level
          ),
          spellAttackBonus: calculateSpellAttackBonus(
            ability,
            newAbilities,
            state.character.data.basicInfo.level
          ),
        };
      }
      
      return {
        character: {
          ...state.character,
          data: {
            ...state.character.data,
            abilities: newAbilities,
            combat: { ...state.character.data.combat, initiative },
            spellcasting,
          },
        },
      };
    }),

  createNewCharacter: () =>
    set({
      character: {
        id: uuidv4(),
        name: 'New Character',
        data: DEFAULT_CHARACTER_DATA,
      },
    }),

  clearCharacter: () => set({ character: null }),
}));
```

### src/stores/authStore.ts

```typescript
import { create } from 'zustand';
import type { AuthResponse } from '../types/api';

interface AuthStore {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  setUser: (user: AuthResponse | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  logout: () => {
    localStorage.removeItem('authToken');
    set({ user: null, isAuthenticated: false });
  },
}));
```

### src/stores/themeStore.ts

```typescript
import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: (localStorage.getItem('theme') as Theme) || 'light',

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    }),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },
}));
```

---

## React Components

### Base UI Components

**src/components/UI/Button.tsx:**
```typescript
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-colors';
  
  const variantStyles = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

**src/components/UI/Input.tsx:**
```typescript
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
```

**src/components/UI/Card.tsx:**
```typescript
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      {title && <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{title}</h3>}
      {children}
    </div>
  );
};
```

### Character Sheet Components

**src/components/CharacterSheet/AbilityScores.tsx:**
```typescript
import React from 'react';
import type { Abilities, AbilityKey } from '../../types/character';
import { calculateAbilityModifier } from '../../utils/calculations';
import { Card } from '../UI/Card';

interface AbilityScoresProps {
  abilities: Abilities;
  onUpdate: (ability: AbilityKey, value: number) => void;
}

const ABILITIES: { key: AbilityKey; label: string }[] = [
  { key: 'strength', label: 'STR' },
  { key: 'dexterity', label: 'DEX' },
  { key: 'constitution', label: 'CON' },
  { key: 'intelligence', label: 'INT' },
  { key: 'wisdom', label: 'WIS' },
  { key: 'charisma', label: 'CHA' },
];

export const AbilityScores: React.FC<AbilityScoresProps> = ({ abilities, onUpdate }) => {
  return (
    <Card title="Ability Scores">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {ABILITIES.map(({ key, label }) => {
          const score = abilities[key];
          const modifier = calculateAbilityModifier(score);
          
          return (
            <div key={key} className="text-center">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {label}
              </div>
              <input
                type="number"
                value={score}
                onChange={(e) => onUpdate(key, parseInt(e.target.value) || 10)}
                className="w-full text-center text-2xl font-bold bg-gray-100 dark:bg-gray-700 
                  rounded-lg py-2 border-2 border-transparent focus:border-primary-500 
                  focus:outline-none"
                min={1}
                max={30}
              />
              <div className="text-lg font-semibold text-primary-600 dark:text-primary-400 mt-1">
                {modifier >= 0 ? '+' : ''}{modifier}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
```

**src/components/CharacterSheet/Skills.tsx:**
```typescript
import React from 'react';
import type { Abilities, SkillKey, SkillProficiency } from '../../types/character';
import { calculateSkillBonus, SKILL_ABILITY_MAP } from '../../utils/calculations';
import { Card } from '../UI/Card';

interface SkillsProps {
  skills: Record<SkillKey, SkillProficiency>;
  abilities: Abilities;
  level: number;
  onUpdate: (skill: SkillKey, proficiency: SkillProficiency) => void;
}

const SKILL_LABELS: Record<SkillKey, string> = {
  acrobatics: 'Acrobatics',
  animalHandling: 'Animal Handling',
  arcana: 'Arcana',
  athletics: 'Athletics',
  deception: 'Deception',
  history: 'History',
  insight: 'Insight',
  intimidation: 'Intimidation',
  investigation: 'Investigation',
  medicine: 'Medicine',
  nature: 'Nature',
  perception: 'Perception',
  performance: 'Performance',
  persuasion: 'Persuasion',
  religion: 'Religion',
  sleightOfHand: 'Sleight of Hand',
  stealth: 'Stealth',
  survival: 'Survival',
};

export const Skills: React.FC<SkillsProps> = ({ skills, abilities, level, onUpdate }) => {
  return (
    <Card title="Skills">
      <div className="space-y-2">
        {(Object.keys(skills) as SkillKey[]).map((skillKey) => {
          const skill = skills[skillKey];
          const abilityKey = SKILL_ABILITY_MAP[skillKey];
          const bonus = calculateSkillBonus(abilityKey, abilities, skill, level);
          
          return (
            <div key={skillKey} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={skill.proficient}
                  onChange={(e) =>
                    onUpdate(skillKey, { ...skill, proficient: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <input
                  type="checkbox"
                  checked={skill.expertise}
                  onChange={(e) =>
                    onUpdate(skillKey, { ...skill, expertise: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300"
                  title="Expertise (double proficiency)"
                />
                <span className="text-sm">{SKILL_LABELS[skillKey]}</span>
                <span className="text-xs text-gray-500">({abilityKey.slice(0, 3).toUpperCase()})</span>
              </div>
              <span className="font-mono font-bold">
                {bonus >= 0 ? '+' : ''}{bonus}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
```

---

## Routing

**src/App.tsx:**
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useThemeStore } from './stores/themeStore';
import { useAuthStore } from './stores/authStore';
import { authService } from './services/auth';

// Pages
import { Home } from './pages/Home';
import { CharacterCreator } from './pages/CharacterCreator';
import { CharacterList } from './pages/CharacterList';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Header } from './components/Layout/Header';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/character/new" element={<CharacterCreator />} />
            <Route path="/character/:id" element={<CharacterCreator />} />
            <Route
              path="/characters"
              element={
                <ProtectedRoute>
                  <CharacterList />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

---

## Next Steps

Continue to **API_DOCUMENTATION.md** for complete API reference and **DEPLOYMENT.md** for hosting instructions.
