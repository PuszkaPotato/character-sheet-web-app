# Implementation Order

This document outlines the exact sequence for building the DnD Character Sheet WebApp. Follow these steps in order for the smoothest development experience.

## Prerequisites

### Required Software
- Node.js 18+ and npm
- .NET 8 SDK
- PostgreSQL 15+ (or use Docker)
- Git
- VS Code (recommended) or your preferred IDE

### Recommended VS Code Extensions
- C# Dev Kit
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens

## Phase 1: Project Initialization (Day 1)

### Step 1: Create Project Directories
```bash
mkdir dnd-character-sheet
cd dnd-character-sheet
mkdir client server docs
```

### Step 2: Initialize Backend (.NET API)
```bash
cd server
dotnet new webapi -n DndCharacterSheet.API
cd DndCharacterSheet.API
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package BCrypt.Net-Next
dotnet add package Swashbuckle.AspNetCore
```

### Step 3: Initialize Frontend (React + Vite)
```bash
cd ../../client
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install zustand react-router-dom axios
npm install jspdf jspdf-autotable
npm install react-hook-form
npm install @types/node --save-dev
```

### Step 4: Configure Tailwind CSS
Follow the configuration in FRONTEND_SETUP.md section "Tailwind Configuration"

---

## Phase 2: Database & Models (Day 1-2)

### Step 5: Create Database Models
Create these files in `server/DndCharacterSheet.API/Models/`:
- `User.cs` - See DATABASE_SCHEMA.md
- `Character.cs`
- `Theme.cs`

### Step 6: Create ApplicationDbContext
Create `Data/ApplicationDbContext.cs` - See DATABASE_SCHEMA.md

### Step 7: Configure Database Connection
Update `appsettings.json` with PostgreSQL connection string

### Step 8: Create Initial Migration
```bash
cd server/DndCharacterSheet.API
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## Phase 3: Backend API Foundation (Day 2-3)

### Step 9: Create DTOs
Create all DTO classes in `DTOs/` folder - See API_DOCUMENTATION.md

### Step 10: Implement AuthService
Create `Services/AuthService.cs` with:
- User registration (password hashing)
- Login (JWT generation)
- Token validation

### Step 11: Create AuthController
Create `Controllers/AuthController.cs` with:
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me` (test endpoint)

### Step 12: Configure JWT Authentication
Update `Program.cs` with JWT middleware - See BACKEND_SETUP.md

### Step 13: Test Auth Endpoints
Use Swagger UI at `http://localhost:5000/swagger` to test registration and login

---

## Phase 4: Character CRUD Backend (Day 3-4)

### Step 14: Implement CharacterService
Create `Services/CharacterService.cs` with full CRUD operations

### Step 15: Create CharactersController
Create `Controllers/CharactersController.cs` with all endpoints - See API_DOCUMENTATION.md

### Step 16: Test Character Endpoints
Test all CRUD operations via Swagger

---

## Phase 5: Frontend Foundation (Day 4-5)

### Step 17: Create Type Definitions
Create all TypeScript interfaces in `client/src/types/`:
- `character.ts` - Main character interface
- `dnd.ts` - D&D specific types (abilities, skills, etc.)
- `api.ts` - API request/response types

### Step 18: Set Up API Service
Create `client/src/services/api.ts` with Axios configuration

### Step 19: Create Zustand Stores
Create these stores:
- `stores/authStore.ts` - User authentication state
- `stores/characterStore.ts` - Current character data
- `stores/themeStore.ts` - UI theme settings

### Step 20: Set Up Routing
Create `App.tsx` with React Router setup:
- `/` - Home page
- `/character/new` - Character creator
- `/character/:id` - Character sheet view/edit
- `/characters` - Character list (requires auth)
- `/login` - Login page
- `/register` - Register page

---

## Phase 6: Character Sheet UI (Day 5-7)

### Step 21: Create Base Components
Create these reusable UI components:
- `components/UI/Button.tsx`
- `components/UI/Input.tsx`
- `components/UI/Card.tsx`
- `components/UI/Modal.tsx`

### Step 22: Build Character Sheet Components
Create in `components/CharacterSheet/`:

**Priority 1 (Core Display):**
- `CharacterHeader.tsx` - Name, class, race, level
- `AbilityScores.tsx` - The 6 ability scores with modifiers
- `Skills.tsx` - Skill list with proficiency checkboxes
- `CombatStats.tsx` - AC, HP, Initiative, Speed

**Priority 2 (Functionality):**
- `Equipment.tsx` - Inventory list
- `Spells.tsx` - Spell list for casters
- `Features.tsx` - Class/race features
- `Notes.tsx` - Backstory and notes

### Step 23: Implement Auto-Calculations
Create `utils/calculations.ts` with functions:
- `calculateAbilityModifier(score: number): number`
- `calculateProficiencyBonus(level: number): number`
- `calculateSkillBonus(ability, proficient, level): number`
- `calculateSpellSaveDC(spellcastingAbility, proficiencyBonus): number`
- `calculateSpellAttackBonus(spellcastingAbility, proficiencyBonus): number`

Hook these up in the character store to recalculate on changes

### Step 24: Create Character Creator Page
Build `pages/CharacterCreator.tsx` with step-by-step form:
1. Basic info (name, race, class, level)
2. Ability scores (point buy or manual entry)
3. Skills selection
4. Equipment
5. Spells (if applicable)

---

## Phase 7: LocalStorage & Data Persistence (Day 7-8)

### Step 25: Implement LocalStorage Service
Create `services/localStorage.ts` with:
- `saveCharacter(character: Character): void`
- `loadCharacter(id: string): Character | null`
- `loadAllCharacters(): Character[]`
- `deleteCharacter(id: string): void`

### Step 26: Add Auto-Save
In character store, add debounced auto-save:
```typescript
// Save to localStorage 500ms after last change
useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.saveCharacter(character);
  }, 500);
  return () => clearTimeout(timer);
}, [character]);
```

### Step 27: Import/Export JSON
Add buttons and functions for:
- Export: Download character as JSON file
- Import: Upload JSON file and load character

---

## Phase 8: 5e.tools Integration (Day 8-9)

### Step 28: Research 5e.tools Data Structure
- Explore https://5e.tools (or their data repository)
- Understand their JSON structure for races, classes, spells

### Step 29: Create 5eTools Service
Create `services/fiveETools.ts` with:
- `fetchRaces(): Promise<Race[]>`
- `fetchClasses(): Promise<Class[]>`
- `fetchSpells(classId: string): Promise<Spell[]>`
- `fetchBackgrounds(): Promise<Background[]>`
- Cache responses in localStorage/IndexedDB

### Step 30: Build Selection Components
Create:
- `components/RaceSelector.tsx` - Dropdown with preview
- `components/ClassSelector.tsx` - Dropdown with preview
- `components/SpellPicker.tsx` - Searchable spell list

### Step 31: Integrate Auto-Population
When user selects race/class/background:
- Auto-populate proficiencies
- Add racial traits to character
- Add class features
- Grant starting equipment

---

## Phase 9: Authentication UI (Day 9-10)

### Step 32: Create Auth Service
Create `services/auth.ts` wrapping API calls:
- `register(email, password, username)`
- `login(email, password)`
- `logout()`
- `getCurrentUser()`

### Step 33: Build Auth Components
Create:
- `components/Auth/Login.tsx` - Login form
- `components/Auth/Register.tsx` - Registration form
- `components/Layout/Header.tsx` - Navigation with login/logout

### Step 34: Implement Protected Routes
Add route guards:
```typescript
<Route path="/characters" element={
  <ProtectedRoute>
    <CharacterList />
  </ProtectedRoute>
} />
```

### Step 35: Add Cloud Save Feature
In character sheet, add:
- "Save to Cloud" button (requires login)
- Loading indicator during save
- Success/error toast notifications

---

## Phase 10: Character List & Cloud Sync (Day 10-11)

### Step 36: Create Character List Page
Build `pages/CharacterList.tsx`:
- Fetch user's characters from API
- Display as cards with preview
- "New Character" button
- Delete confirmation modal

### Step 37: Implement Character Loading
- Click character card → Load into editor
- Handle merge conflicts (cloud vs local)
- Show warning if unsaved local changes

---

## Phase 11: PDF Export (Day 11-12)

### Step 38: Create PDF Export Service
Create `utils/pdfExport.ts`:
- Use jsPDF to generate PDF
- Layout matching D&D 5e official character sheet
- Map character data to form fields
- Make fields editable

### Step 39: Add Export Button
In character sheet:
- "Export as PDF" button
- Filename: `CharacterName_Level_Class.pdf`
- Download automatically

### Step 40: Test PDF on Multiple Devices
- Desktop browsers
- Mobile browsers
- Ensure fields are fillable on Adobe Reader

---

## Phase 12: Theming (Day 12-13)

### Step 41: Implement Theme System
Create `stores/themeStore.ts`:
- Light/dark mode toggle
- Store preference in localStorage
- Apply CSS classes dynamically

### Step 42: Create Theme Toggle
Add toggle in header:
```typescript
<button onClick={toggleTheme}>
  {theme === 'dark' ? '☀️' : '🌙'}
</button>
```

### Step 43: Style Dark Mode
Use Tailwind's dark mode classes:
```css
<div className="bg-white dark:bg-gray-900">
```

---

## Phase 13: Polish & Testing (Day 13-15)

### Step 44: Responsive Design
Test on:
- Desktop (1920x1080, 1366x768)
- Tablet (iPad, 768x1024)
- Mobile (iPhone, 390x844)

Fix layout issues with Tailwind responsive classes

### Step 45: Error Handling
Add try-catch blocks:
- API calls with user-friendly error messages
- Form validation errors
- Network failure handling

### Step 46: Loading States
Add loading indicators:
- API requests
- PDF generation
- Character list loading

### Step 47: Accessibility Audit
- Add ARIA labels
- Test keyboard navigation
- Run Lighthouse audit (aim for 90+ score)

### Step 48: Performance Optimization
- Lazy load components
- Memoize expensive calculations
- Optimize re-renders with React.memo

---

## Phase 14: Deployment (Day 15-16)

### Step 49: Deploy Database
- Sign up for Railway or Supabase
- Create PostgreSQL instance
- Run migrations on production DB

### Step 50: Deploy Backend
- Deploy to Railway or Fly.io
- Set environment variables (JWT secret, DB connection)
- Test API endpoints in production

### Step 51: Deploy Frontend
- Deploy to Vercel or Netlify
- Set environment variable for API URL
- Test full flow in production

### Step 52: Configure Domain (Optional)
- Purchase domain or use free subdomain
- Set up SSL certificate
- Configure DNS

---

## Testing Checklist

After each phase, test these core flows:

### Flow 1: No-Account Usage
1. ✅ Visit site
2. ✅ Create new character
3. ✅ Fill out character sheet
4. ✅ See auto-calculations work
5. ✅ Export as PDF
6. ✅ Refresh page - character still there
7. ✅ Export as JSON
8. ✅ Import JSON in new session

### Flow 2: With-Account Usage
1. ✅ Register account
2. ✅ Login
3. ✅ Create character
4. ✅ Save to cloud
5. ✅ Logout
6. ✅ Login on different device/browser
7. ✅ Load character from cloud
8. ✅ Edit and save changes

### Flow 3: 5e.tools Integration
1. ✅ Select race → Traits appear
2. ✅ Select class → Features appear
3. ✅ Select background → Skills granted
4. ✅ Search spells → Filter by class/level
5. ✅ Add spell → Auto-calculate spell slots

---

## MVP Definition of Done

The MVP is complete when:
- [ ] User can create a complete D&D 5e character sheet
- [ ] All ability scores, skills, and stats auto-calculate correctly
- [ ] Character persists in localStorage without account
- [ ] User can register, login, and save characters to cloud
- [ ] PDF export works and generates fillable fields
- [ ] Import/Export JSON functionality works
- [ ] Site is responsive on mobile and desktop
- [ ] Light/dark mode works
- [ ] No critical bugs in core functionality
- [ ] Deployed and accessible via public URL

---

## Common Issues & Solutions

### Issue: CORS errors when calling backend from frontend
**Solution:** Configure CORS in `Program.cs`:
```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.WithOrigins("http://localhost:5173", "https://yourdomain.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

### Issue: JWT token not persisting across refreshes
**Solution:** Store token in localStorage and rehydrate auth store on app load

### Issue: PDF export fails on mobile
**Solution:** Use smaller fonts and simpler layout for mobile PDF generation

### Issue: 5e.tools API rate limiting
**Solution:** Cache all fetched data in IndexedDB, only fetch once per session

---

## Next Document to Read

Proceed to **DATABASE_SCHEMA.md** for detailed database structure.
