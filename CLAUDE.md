# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

D&D 5e character sheet web app. Works fully client-side without an account (localStorage), with optional cloud sync for registered users. Simple, no bloat.

## Tech Stack

**Frontend** (`client/`): React 18 + TypeScript + Vite + Tailwind CSS (dark mode via `class`), Zustand (state), React Router v6, jsPDF (PDF export), Axios, React Hook Form

**Backend** (`server/DndCharacterSheet.API/`): .NET 10 Web API, PostgreSQL 15+, Entity Framework Core 10 (code-first migrations), JWT auth, BCrypt password hashing, Swagger/OpenAPI

## Commands

### Frontend
```bash
cd client
npm install              # install deps
npm run dev              # dev server at http://localhost:5173
npm run build            # production build
npm run preview          # preview production build
npm run lint             # eslint
```

### Backend
```bash
cd server/DndCharacterSheet.API
dotnet run               # dev server at http://localhost:5000
dotnet build             # compile
dotnet test              # run tests
dotnet ef migrations add <Name>   # create migration
dotnet ef database update         # apply migrations
dotnet ef migrations remove       # undo last migration
```

### Local PostgreSQL (Docker)
```bash
docker run --name dnd-postgres -e POSTGRES_PASSWORD=dev_password -p 5432:5432 -d postgres:15-alpine
```

### Initial project setup (if starting fresh)
```bash
# Backend
cd server
dotnet new webapi -n DndCharacterSheet.API
cd DndCharacterSheet.API
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package BCrypt.Net-Next
dotnet add package Swashbuckle.AspNetCore

# Frontend
cd ../../client
npm create vite@latest . -- --template react-ts
npm install
npm install zustand react-router-dom axios jspdf jspdf-autotable react-hook-form
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
```

## Architecture

```
client/src/
├── components/
│   ├── CharacterSheet/    # AbilityScores, Skills, CombatStats, Equipment, Spells, Features
│   ├── Layout/            # Header, Footer
│   └── UI/                # Button, Input, Card, Modal (reusable primitives)
├── pages/                 # Home, CharacterCreator, CharacterList, Login, Register
├── services/
│   ├── api.ts             # Axios instance + JWT interceptor
│   ├── auth.ts            # register/login/logout wrappers
│   ├── characters.ts      # character CRUD API calls
│   ├── fiveETools.ts      # fetch races/classes/spells from 5e.tools data, cached in IndexedDB
│   └── localStorage.ts    # save/load/delete characters locally
├── stores/
│   ├── characterStore.ts  # current character state + auto-calculations + debounced auto-save
│   ├── authStore.ts       # user session, JWT token
│   └── themeStore.ts      # light/dark mode, persisted in localStorage
├── types/
│   ├── character.ts       # Character, CharacterData interfaces
│   └── api.ts             # API request/response types
└── utils/
    ├── calculations.ts    # pure D&D 5e math (modifiers, proficiency bonus, skill bonuses, spell DC)
    ├── pdfExport.ts       # jsPDF character sheet generation
    └── validators.ts      # form validation helpers

server/DndCharacterSheet.API/
├── Controllers/           # AuthController, CharactersController
├── Data/                  # ApplicationDbContext, Migrations/
├── DTOs/                  # Auth/ and Characters/ request/response shapes
├── Models/                # User, Character (Data as JSONB), Theme
├── Services/              # IAuthService/AuthService, ICharacterService/CharacterService
├── Middleware/            # ErrorHandlingMiddleware (global exception handler)
└── Program.cs             # DI, JWT config, CORS, Swagger, middleware pipeline
```

## Key Architecture Decisions

**Character data is JSONB**: The `Character.Data` column stores the entire character sheet as JSON. This avoids dozens of normalized tables for a flexible schema (different classes/races have different fields). See `DATABASE_SCHEMA.md` for the full JSON structure.

**LocalStorage-first**: Characters save automatically (debounced 500ms) to localStorage. Cloud save is a deliberate user action ("Save to Cloud" button). This means the app is fully usable offline and without an account.

**Auto-calculations in the store**: All derived values (ability modifiers, skill bonuses, proficiency bonus, spell DC/attack) are computed in `characterStore.ts` whenever source values change. They are never stored, always derived. Pure calculation functions live in `utils/calculations.ts`.

**5e.tools data**: Races, classes, spells, and backgrounds come from 5e.tools' public JSON data (GitHub: `5etools-mirror-2/5etools-mirror-2`). Fetched once and cached in IndexedDB. Do not bundle this data — fetch at runtime.

**JWT stored in localStorage**: Token stored in `localStorage` as `authToken`, added to all requests via Axios request interceptor. Auth store rehydrates from localStorage on app load.

**CORS**: Backend allows `http://localhost:5173` in development. Production origin set via environment variable.

## Routes

- `/` — Home/landing page
- `/character/new` — Create new character
- `/character/:id` — View/edit character sheet
- `/characters` — Character list (protected, requires auth)
- `/login`, `/register` — Auth pages

## D&D 5e Calculations

Key formulas in `utils/calculations.ts`:
- Ability modifier: `Math.floor((score - 10) / 2)`
- Proficiency bonus: `Math.ceil(level / 4) + 1` (levels 1-4: +2, 5-8: +3, etc.)
- Skill bonus: ability modifier + (proficient ? proficiencyBonus : 0) + (expertise ? proficiencyBonus : 0)
- Spell save DC: 8 + proficiencyBonus + spellcastingAbilityModifier
- Spell attack bonus: proficiencyBonus + spellcastingAbilityModifier

## .NET 10 OpenAPI Notes

The project uses .NET 10 with `Swashbuckle.AspNetCore`. In .NET 10, the OpenAPI types have moved:
- Use `using Microsoft.OpenApi;` (not `Microsoft.OpenApi.Models`)
- `AddSecurityRequirement` takes a delegate: `options.AddSecurityRequirement(document => new OpenApiSecurityRequirement { [new OpenApiSecuritySchemeReference("Bearer", document)] = [] })`
- Swagger UI route: `app.UseSwagger(o => o.RouteTemplate = "openapi/{documentName}.json")` + `app.UseSwaggerUI(o => o.SwaggerEndpoint("/openapi/v1.json", "..."))`

## Environment Variables

**Frontend** (`.env.local`):
```
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`appsettings.Development.json`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=dnd_character_sheet_dev;Username=postgres;Password=dev_password"
  },
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-must-be-at-least-32-chars-long",
    "Issuer": "DndCharacterSheetAPI",
    "Audience": "DndCharacterSheetClient",
    "ExpirationMinutes": 60
  }
}
```

## MVP Scope

**In MVP:**
- Character sheet with all 5e fields (abilities, skills, saving throws, combat, equipment, spells, features, personality)
- Auto-calculated derived stats
- LocalStorage auto-save (no account required)
- JSON import/export
- PDF export (jsPDF)
- Optional account + cloud save (JWT auth)
- Character list page for logged-in users
- Light/dark mode
- Mobile responsive
- 5e.tools data for race/class/spell selection with auto-population

**Not in MVP (Phase 2):**
- AI character generator
- Custom theme creator / community themes
- Party management, dice roller, combat tracker, real-time collaboration

## Reference Docs

Detailed implementation code and examples are in the docs at the repo root:
- `BACKEND_SETUP.md` — Complete C# code for services, controllers, Program.cs
- `FRONTEND_SETUP_PART1.md` — TypeScript types, services, utilities
- `FRONTEND_SETUP_PART2.md` — Zustand stores, components, routing
- `DATABASE_SCHEMA.md` — EF Core models, JSONB structure, migrations
- `API_DOCUMENTATION.md` — All REST endpoints with request/response examples
- `DEPLOYMENT.md` — Railway/Vercel deployment guide
