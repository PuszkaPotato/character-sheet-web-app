# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

D&D 5e character sheet web app. Works fully client-side without an account (localStorage), with optional cloud sync for registered users. Simple, no bloat.

See **TODO.md** for current tasks and priorities.

## Tech Stack

**Frontend** (`client/`): React 18 + TypeScript + Vite + Tailwind CSS (dark mode via `class`), Zustand, React Router v6, jsPDF, Axios, React Hook Form

**Backend** (`server/DndCharacterSheet.API/`): .NET 10 Web API, PostgreSQL 15+, EF Core 10 (code-first migrations), JWT auth, BCrypt, Swagger/OpenAPI

## Commands

```bash
# Frontend (from client/)
npm run dev              # dev server at http://localhost:5173
npm run build
npm run lint

# Backend (from server/DndCharacterSheet.API/)
dotnet run               # dev server at http://localhost:5000
dotnet ef migrations add <Name>
dotnet ef database update
```

## Architecture

```
client/src/
├── components/
│   ├── CharacterSheet/    # AbilityScores, Skills, CombatStats, Equipment, Spells, Features
│   ├── Layout/            # Header, Footer
│   └── UI/                # Button, Input, Card, Modal, Combobox, SpellPicker
├── pages/                 # Home, CharacterCreator, CharacterList, Login, Register
├── services/
│   ├── api.ts             # Axios instance + JWT interceptor
│   ├── auth.ts            # register/login/logout
│   ├── characters.ts      # character CRUD API calls
│   ├── fiveETools.ts      # fetch races/classes/spells from 5e.tools, cached in IndexedDB
│   └── localStorage.ts    # save/load/delete characters locally
├── stores/
│   ├── characterStore.ts  # current character state + auto-calculations + debounced auto-save
│   ├── authStore.ts       # user session, JWT token
│   └── themeStore.ts      # light/dark mode, persisted in localStorage
├── types/                 # character.ts, api.ts
└── utils/
    ├── calculations.ts    # pure D&D 5e math
    ├── pdfExport.ts       # jsPDF character sheet generation
    └── validators.ts

server/DndCharacterSheet.API/
├── Controllers/           # AuthController, CharactersController
├── Data/                  # ApplicationDbContext, Migrations/
├── DTOs/                  # Auth/ and Characters/ request/response shapes
├── Models/                # User, Character (Data as JSONB)
├── Services/              # IAuthService/AuthService, ICharacterService/CharacterService
├── Middleware/            # ErrorHandlingMiddleware
└── Program.cs             # DI, JWT, CORS, Swagger, middleware pipeline
```

## Key Architecture Decisions

**Character data is JSONB**: `Character.Data` stores the entire sheet as JSON — avoids dozens of normalized tables. See `docs/DATABASE_SCHEMA.md` for structure.

**LocalStorage-first**: Auto-save (debounced 500ms) to localStorage. Cloud save is a deliberate user action. App is fully usable offline.

**Auto-calculations in the store**: Derived values (modifiers, skill bonuses, spell DC) computed in `characterStore.ts` on change, never stored. Pure math in `utils/calculations.ts`.

**5e.tools data**: Races, classes, spells, backgrounds from `5etools-mirror-3/5etools-src` (main branch). Fetched lazily, cached in IndexedDB. Never bundle — fetch at runtime. Filter `edition === 'one'` to exclude 2024 reprints; deduplicate by name.

**JWT in localStorage**: Stored as `authToken`, added via Axios interceptor. Auth store rehydrates on load.

## Routes

- `/` — Home
- `/character/new` — Create character
- `/character/:id` — View/edit character sheet
- `/characters` — Character list (cloud section hidden when not logged in)
- `/login`, `/register`

## Environment Variables

**Frontend** (`.env.local`):
```
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`appsettings.Development.json`, gitignored):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=dnd_character_sheet_dev;Username=postgres;Password=<password>"
  },
  "JwtSettings": {
    "SecretKey": "<min-32-chars>",
    "Issuer": "DndCharacterSheetAPI",
    "Audience": "DndCharacterSheetClient",
    "ExpirationMinutes": 60
  }
}
```

## Reference Docs

- `docs/API_DOCUMENTATION.md` — REST endpoints with request/response examples
- `docs/DATABASE_SCHEMA.md` — EF Core models, JSONB structure
- `docs/DEPLOYMENT.md` — Railway (backend) + Vercel (frontend) deployment guide
