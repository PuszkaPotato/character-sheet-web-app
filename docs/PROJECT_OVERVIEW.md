# DnD Character Sheet WebApp - Project Overview

## Project Vision

A lightweight, free-to-use web application for creating and managing D&D 5e character sheets with optional cloud storage and AI-powered character generation.

**Key Principle:** Simple, fast, accessible. No unnecessary features in MVP.

## Core Features

### Phase 1 (MVP)
- ✅ Clean character sheet interface
- ✅ Dynamic field auto-calculation (modifiers, bonuses, etc.)
- ✅ 5e.tools data integration for races, classes, spells
- ✅ LocalStorage persistence (no account required)
- ✅ Optional account for cloud storage
- ✅ Basic theming (light/dark mode)
- ✅ PDF export with editable fields
- ✅ Import/Export as JSON

### Phase 2 (Future)
- 🔮 Rule-based character generator (free, unlimited)
- 🔮 LLM-enhanced generator (premium/limited)
- 🔮 Custom theme creation and sharing
- 🔮 Community theme gallery

## Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand (lightweight, simple)
- **Routing:** React Router v6
- **PDF Generation:** jsPDF + jsPDF-AutoTable
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form

**Why these choices:**
- React + TypeScript: Industry standard, type safety for complex character data
- Vite: Fast dev experience, modern build tool
- Tailwind: Rapid development, easy theming
- Zustand: Simpler than Redux, perfect for our needs
- jsPDF: Client-side PDF generation, no backend needed

### Backend
- **Framework:** .NET 8 Web API
- **Database:** PostgreSQL 15+
- **ORM:** Entity Framework Core 8
- **Authentication:** JWT tokens
- **API Documentation:** Swagger/OpenAPI

**Why these choices:**
- .NET 8: Modern, performant, excellent tooling
- PostgreSQL: Robust, free, JSON support for flexible character data
- EF Core: Powerful ORM, code-first migrations
- JWT: Stateless auth, works well with SPA

### Hosting (Initial Free Tier)
- **Frontend:** Vercel or Netlify
- **Backend:** Railway.app or Fly.io
- **Database:** Railway PostgreSQL or Supabase
- **File Storage:** Cloudinary (free tier for character portraits)

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│  ┌──────────────────────────────────────────────┐  │
│  │  Character Sheet UI                           │  │
│  │  - Auto-calculations                          │  │
│  │  - 5e.tools integration                       │  │
│  │  - LocalStorage fallback                      │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  State Management (Zustand)                   │  │
│  │  - Character data                             │  │
│  │  - User session                               │  │
│  │  - Theme settings                             │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                        │
                        │ HTTPS/REST API
                        ▼
┌─────────────────────────────────────────────────────┐
│              Backend (.NET 8 API)                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  Controllers                                   │  │
│  │  - Auth (login, register)                     │  │
│  │  - Characters (CRUD)                          │  │
│  │  - Themes (CRUD)                              │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  Services                                      │  │
│  │  - AuthService (JWT generation)               │  │
│  │  - CharacterService (business logic)          │  │
│  │  - ThemeService                               │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  Data Access (EF Core)                        │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              PostgreSQL Database                     │
│  - Users                                             │
│  - Characters (JSONB for flexibility)                │
│  - Themes (JSONB)                                    │
└─────────────────────────────────────────────────────┘

External APIs:
┌─────────────────────────────────────────────────────┐
│              5e.tools Data                           │
│  - Races, Classes, Spells, Equipment                │
│  - Fetched and cached client-side                   │
└─────────────────────────────────────────────────────┘
```

## Project Structure

### Frontend
```
dnd-character-sheet-client/
├── public/
│   └── logo.svg
├── src/
│   ├── components/
│   │   ├── CharacterSheet/
│   │   │   ├── AbilityScores.tsx
│   │   │   ├── Skills.tsx
│   │   │   ├── CombatStats.tsx
│   │   │   ├── Equipment.tsx
│   │   │   ├── Spells.tsx
│   │   │   └── index.tsx
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── Layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── UI/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Modal.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── CharacterCreator.tsx
│   │   ├── CharacterList.tsx
│   │   └── About.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── characters.ts
│   │   ├── fiveETools.ts
│   │   └── localStorage.ts
│   ├── stores/
│   │   ├── characterStore.ts
│   │   ├── authStore.ts
│   │   └── themeStore.ts
│   ├── types/
│   │   ├── character.ts
│   │   ├── dnd.ts
│   │   └── api.ts
│   ├── utils/
│   │   ├── calculations.ts
│   │   ├── pdfExport.ts
│   │   └── validators.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

### Backend
```
DndCharacterSheet.API/
├── Controllers/
│   ├── AuthController.cs
│   ├── CharactersController.cs
│   └── ThemesController.cs
├── Models/
│   ├── User.cs
│   ├── Character.cs
│   └── Theme.cs
├── DTOs/
│   ├── Auth/
│   │   ├── LoginRequest.cs
│   │   ├── RegisterRequest.cs
│   │   └── AuthResponse.cs
│   └── Characters/
│       ├── CharacterDto.cs
│       └── CreateCharacterRequest.cs
├── Services/
│   ├── IAuthService.cs
│   ├── AuthService.cs
│   ├── ICharacterService.cs
│   └── CharacterService.cs
├── Data/
│   ├── ApplicationDbContext.cs
│   └── Migrations/
├── Middleware/
│   └── ErrorHandlingMiddleware.cs
├── Program.cs
├── appsettings.json
└── DndCharacterSheet.API.csproj
```

## Data Flow

### Creating a Character (No Account)
1. User fills out character sheet form
2. Auto-calculations trigger on field changes
3. Data saved to localStorage on every change (debounced)
4. User can export as JSON or PDF

### Creating a Character (With Account)
1. User fills out character sheet form
2. Auto-calculations trigger on field changes
3. Data saved to localStorage as backup
4. User clicks "Save to Cloud"
5. POST request to `/api/characters`
6. Backend stores in PostgreSQL
7. Success confirmation shown

### Loading a Character
1. User visits Character List page
2. If logged in: Fetch from API
3. If not logged in: Load from localStorage
4. Populate character sheet with data
5. Enable editing/saving

## Security Considerations

### Frontend
- No sensitive data in localStorage (only character sheets)
- JWT token stored in httpOnly cookie (if possible) or secure localStorage
- Input validation and sanitization
- XSS prevention (React does this by default)

### Backend
- Password hashing with BCrypt (work factor 12)
- JWT tokens with short expiration (1 hour)
- Refresh token mechanism (stored in database)
- Rate limiting on auth endpoints
- CORS configuration (allow only frontend domain)
- SQL injection prevention (EF Core parameterized queries)

## Performance Targets

- Initial page load: < 2 seconds
- Character sheet render: < 500ms
- Auto-calculation updates: < 100ms
- API response time: < 200ms (p95)
- PDF export: < 3 seconds

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Android (last 2 versions)

## Accessibility Goals

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader friendly
- Color contrast ratios meeting standards
- Focus indicators visible
- ARIA labels on interactive elements

## Development Principles

1. **Start simple, iterate fast** - MVP first, features later
2. **Make it work, make it right, make it fast** - In that order
3. **Client-side first** - Minimize backend complexity
4. **Progressive enhancement** - Works without account, better with account
5. **Mobile-friendly** - Responsive design from day one

## Success Metrics

### MVP Launch
- [ ] Can create a character sheet in < 5 minutes
- [ ] All calculations work correctly
- [ ] Data persists across sessions
- [ ] PDF export works on desktop and mobile
- [ ] < 5 critical bugs reported in first week

### Phase 2
- [ ] 100+ active users
- [ ] 500+ characters created
- [ ] < 1% error rate on generator
- [ ] Positive community feedback

## Attribution & Transparency

This project is built as an experiment in LLM-assisted development:
- Landing page footer: "Built as an AI collaboration experiment with Claude"
- About page: Detailed explanation of development process
- GitHub README: Clear documentation of what's AI-generated vs human-guided
- Open source license: MIT (if you choose to open source it)

## Next Steps

Follow these documents in order:
1. **IMPLEMENTATION_ORDER.md** - Read this next for step-by-step plan
2. **DATABASE_SCHEMA.md** - Database design
3. **BACKEND_SETUP.md** - Backend implementation
4. **FRONTEND_SETUP.md** - Frontend implementation
5. **API_DOCUMENTATION.md** - API contracts
6. **DEPLOYMENT.md** - Going live

---

**Note for Claude Code:** This is a complete project. Start with IMPLEMENTATION_ORDER.md to see the build sequence. Each document is self-contained and can be implemented independently.
