# Quick Start Guide for Claude Code

This guide helps Claude Code get started building the DnD Character Sheet app quickly.

## Overview
You are building a web app for creating D&D 5e character sheets. The app works WITHOUT login (localStorage), but users can optionally create an account to save characters to the cloud.

**Tech Stack:**
- Backend: .NET 8 Web API + PostgreSQL + Entity Framework Core
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Auth: JWT tokens with BCrypt password hashing

---

## Step-by-Step Build Order

### PHASE 1: Backend Foundation (2-3 hours)

**1.1 Set up .NET project:**
```bash
mkdir -p dnd-character-sheet/server
cd dnd-character-sheet/server
dotnet new webapi -n DndCharacterSheet.API
cd DndCharacterSheet.API
```

**1.2 Install packages:**
```bash
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package BCrypt.Net-Next
dotnet add package Swashbuckle.AspNetCore
```

**1.3 Create Models** (see DATABASE_SCHEMA.md):
- `Models/User.cs`
- `Models/Character.cs`
- `Models/Theme.cs`
- `Data/ApplicationDbContext.cs`

**1.4 Configure database** in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=dnd_character_sheet_dev;Username=postgres;Password=dev_password"
  },
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-must-be-at-least-32-chars-long-for-security",
    "Issuer": "DndCharacterSheetAPI",
    "Audience": "DndCharacterSheetClient",
    "ExpirationMinutes": 60
  }
}
```

**1.5 Run migrations:**
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

**1.6 Create Services** (see BACKEND_SETUP.md):
- `Services/IAuthService.cs` + `AuthService.cs`
- `Services/ICharacterService.cs` + `CharacterService.cs`

**1.7 Create DTOs** (see BACKEND_SETUP.md):
- `DTOs/Auth/` - LoginRequest, RegisterRequest, AuthResponse
- `DTOs/Characters/` - CharacterDto, CreateCharacterRequest, UpdateCharacterRequest

**1.8 Create Controllers** (see BACKEND_SETUP.md):
- `Controllers/AuthController.cs`
- `Controllers/CharactersController.cs`

**1.9 Configure Program.cs** with:
- Database context
- JWT authentication
- CORS for frontend
- Dependency injection
- Error handling middleware

**1.10 Test:**
```bash
dotnet run
# Open http://localhost:5000/swagger
# Test /auth/register and /auth/login
```

---

### PHASE 2: Frontend Foundation (2-3 hours)

**2.1 Set up React project:**
```bash
cd ../../
mkdir client
cd client
npm create vite@latest . -- --template react-ts
npm install
```

**2.2 Install dependencies:**
```bash
npm install zustand react-router-dom axios jspdf jspdf-autotable react-hook-form
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
```

**2.3 Configure Tailwind** (see FRONTEND_SETUP_PART1.md):
- Update `tailwind.config.js`
- Update `src/index.css` with Tailwind directives
- Enable dark mode

**2.4 Create Type Definitions** (see FRONTEND_SETUP_PART1.md):
- `src/types/character.ts` - Complete Character interface
- `src/types/api.ts` - API request/response types

**2.5 Set up Services** (see FRONTEND_SETUP_PART1.md):
- `src/services/api.ts` - Axios instance with interceptors
- `src/services/auth.ts` - Authentication functions
- `src/services/characters.ts` - Character CRUD
- `src/services/localStorage.ts` - Local storage helpers

**2.6 Create Stores** (see FRONTEND_SETUP_PART2.md):
- `src/stores/authStore.ts` - User authentication state
- `src/stores/characterStore.ts` - Current character state
- `src/stores/themeStore.ts` - Dark mode toggle

**2.7 Create Utilities** (see FRONTEND_SETUP_PART1.md):
- `src/utils/calculations.ts` - All D&D 5e auto-calculations

**2.8 Test:**
```bash
npm run dev
# Visit http://localhost:5173
```

---

### PHASE 3: Core UI Components (3-4 hours)

**3.1 Base Components:**
- `src/components/UI/Button.tsx`
- `src/components/UI/Input.tsx`
- `src/components/UI/Card.tsx`

**3.2 Layout Components:**
- `src/components/Layout/Header.tsx` - Nav with login/logout
- `src/components/Layout/Footer.tsx`

**3.3 Character Sheet Components:**
- `src/components/CharacterSheet/AbilityScores.tsx` - 6 ability scores
- `src/components/CharacterSheet/Skills.tsx` - Skill list with proficiencies
- `src/components/CharacterSheet/CombatStats.tsx` - AC, HP, Initiative
- `src/components/CharacterSheet/Equipment.tsx` - Inventory
- `src/components/CharacterSheet/Spells.tsx` - Spell list
- `src/components/CharacterSheet/index.tsx` - Main sheet container

---

### PHASE 4: Pages & Routing (2 hours)

**4.1 Create Pages:**
- `src/pages/Home.tsx` - Landing page
- `src/pages/CharacterCreator.tsx` - Main character sheet editor
- `src/pages/CharacterList.tsx` - User's saved characters
- `src/pages/Login.tsx` - Login form
- `src/pages/Register.tsx` - Registration form

**4.2 Set up Routing in `src/App.tsx`:**
- Home route `/`
- Character creator `/character/new`
- Character editor `/character/:id`
- Character list `/characters` (protected route)
- Auth routes `/login`, `/register`

---

### PHASE 5: Core Features (4-5 hours)

**5.1 Auto-calculations:**
Hook up all auto-calculations in `characterStore`:
- Ability modifiers from scores
- Skill bonuses from abilities + proficiency
- Spell save DC and attack bonus
- Proficiency bonus from level

**5.2 LocalStorage persistence:**
- Auto-save character to localStorage on every change (debounced 500ms)
- Load character from localStorage on app start
- Export/Import JSON functionality

**5.3 Cloud Save:**
- "Save to Cloud" button in character sheet
- Sync localStorage → API when user is logged in
- Load from API in CharacterList page

**5.4 PDF Export:**
Create `src/utils/pdfExport.ts`:
- Generate PDF using jsPDF
- Layout matching D&D character sheet
- Fillable form fields
- Download with character name as filename

---

### PHASE 6: 5e.tools Integration (3-4 hours)

**6.1 Research 5e.tools:**
- Find their data API or JSON repository
- Understand structure of races, classes, spells

**6.2 Create Service:**
`src/services/fiveETools.ts`:
- Fetch races with traits
- Fetch classes with features
- Fetch spells by class
- Cache in localStorage/IndexedDB

**6.3 Selection Components:**
- `src/components/RaceSelector.tsx` - Dropdown with preview
- `src/components/ClassSelector.tsx` - Dropdown with preview
- `src/components/SpellPicker.tsx` - Searchable spell list

**6.4 Auto-populate:**
When user selects race/class:
- Add racial traits
- Add class features
- Grant proficiencies
- Add starting equipment

---

## Testing Checklist

After each phase, verify:

✅ **Backend:**
- [ ] API runs without errors
- [ ] Swagger UI accessible
- [ ] Can register new user
- [ ] Can login and get JWT token
- [ ] Can create character (with token)
- [ ] Can get character list (with token)

✅ **Frontend:**
- [ ] App loads without console errors
- [ ] Can create new character
- [ ] Ability scores update modifiers
- [ ] Skills calculate correct bonuses
- [ ] Dark mode toggle works
- [ ] Data persists in localStorage after refresh

✅ **Integration:**
- [ ] Frontend can call backend API
- [ ] CORS configured correctly
- [ ] JWT authentication works
- [ ] Character saves to database
- [ ] Can load saved character

---

## MVP Definition of Done

The minimum viable product is complete when:

1. ✅ User can create a D&D 5e character sheet
2. ✅ All ability scores, skills, saves auto-calculate
3. ✅ Character persists in localStorage (no account needed)
4. ✅ User can register and login
5. ✅ User can save character to cloud (when logged in)
6. ✅ User can load saved characters
7. ✅ Export character as PDF
8. ✅ Import/Export JSON
9. ✅ Light/dark mode works
10. ✅ Responsive on mobile and desktop

---

## Common Gotchas

**CORS Issues:**
Make sure `Program.cs` has:
```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
// ...
app.UseCors("AllowFrontend");
```

**JWT Token Storage:**
Store token in localStorage and add to Axios interceptor:
```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**PostgreSQL Connection:**
If using Docker:
```bash
docker run --name postgres -e POSTGRES_PASSWORD=dev_password -p 5432:5432 -d postgres:15-alpine
```

---

## File Structure Summary

```
dnd-character-sheet/
├── server/
│   └── DndCharacterSheet.API/
│       ├── Controllers/
│       ├── Data/
│       ├── DTOs/
│       ├── Models/
│       ├── Services/
│       └── Program.cs
└── client/
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        ├── stores/
        ├── types/
        ├── utils/
        └── App.tsx
```

---

## Next Steps After MVP

**Phase 2 Features:**
1. Rule-based character generator
2. Custom theme creator
3. Community theme gallery
4. Multi-character party management
5. LLM-enhanced generator (premium)

**Read these docs for details:**
- **IMPLEMENTATION_ORDER.md** - Detailed step-by-step
- **DATABASE_SCHEMA.md** - Database models
- **BACKEND_SETUP.md** - Complete backend code
- **FRONTEND_SETUP_PART1.md** - Frontend types & services
- **FRONTEND_SETUP_PART2.md** - Components & routing
- **API_DOCUMENTATION.md** - API endpoints reference
