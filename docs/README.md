# DnD Character Sheet WebApp - Complete Documentation

**Project Type:** AI Collaboration Experiment  
**Built with:** Claude (Anthropic AI) + Human Guidance  
**Purpose:** Explore how far an LLM can autonomously develop a full-stack web application

---

## 📋 What is This?

A lightweight, free-to-use web application for creating and managing D&D 5th Edition character sheets. The app works entirely client-side (no account needed), with optional cloud storage for registered users.

**Core Principles:**
- ✨ Simple, clean interface
- 🚀 Fast and lightweight
- 💰 Free to use
- 🔐 No account required (optional cloud save)
- 📊 Auto-calculate all stats
- 📄 Export as PDF
- 🎨 Customizable themes
- 🤖 AI-powered character generator (future)

---

## 📚 Documentation Index

Read these documents in order:

### 1. **START HERE →** [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)
Quick overview for Claude Code to begin building immediately.

### 2. **PROJECT_OVERVIEW.md** - High-level architecture
- Technology stack decisions
- Project structure
- Development principles
- Success metrics

### 3. **IMPLEMENTATION_ORDER.md** - Step-by-step build sequence
- Phase-by-phase implementation plan
- Testing checklist after each phase
- Common issues and solutions
- MVP definition of done

### 4. **DATABASE_SCHEMA.md** - Database design
- Entity models (User, Character, Theme)
- Relationships and indexes
- JSONB data structures
- Migration commands

### 5. **BACKEND_SETUP.md** - .NET 8 API implementation
- Complete C# code for all services
- Controllers with full CRUD operations
- JWT authentication
- Error handling middleware

### 6. **FRONTEND_SETUP_PART1.md** - React foundation
- TypeScript type definitions
- Services layer (API, auth, localStorage)
- Utility functions (auto-calculations)
- Environment configuration

### 7. **FRONTEND_SETUP_PART2.md** - React components
- Zustand stores (state management)
- UI components (Button, Input, Card)
- Character sheet components
- Routing configuration

### 8. **API_DOCUMENTATION.md** - REST API reference
- All endpoints with request/response examples
- Authentication flow
- Error response format
- cURL testing examples

### 9. **DEPLOYMENT.md** - Production deployment
- Railway/Fly.io backend hosting
- Vercel/Netlify frontend hosting
- Database setup (Railway/Supabase)
- Environment variables
- SSL and custom domains

---

## 🎯 For Claude Code: How to Use These Docs

1. **Read QUICK_START_GUIDE.md first** - It gives you the build order and key decisions
2. **Follow IMPLEMENTATION_ORDER.md** - It breaks down every step with testing checkpoints
3. **Reference other docs** as needed for detailed implementation
4. **Copy code directly** from BACKEND_SETUP.md and FRONTEND_SETUP_*.md files
5. **Test frequently** using the checklists provided

---

## 🏗️ Tech Stack

**Backend:**
- .NET 8 Web API
- PostgreSQL 15+
- Entity Framework Core 8
- JWT Authentication
- BCrypt password hashing

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)
- React Router v6 (routing)
- jsPDF (PDF export)
- Axios (HTTP client)

**Hosting:**
- Frontend: Vercel or Netlify (free tier)
- Backend: Railway or Fly.io ($5/month)
- Database: Railway PostgreSQL or Supabase (free tier)

---

## 📦 Project Structure

```
dnd-character-sheet/
├── docs/                          # ← You are here
│   ├── README.md
│   ├── QUICK_START_GUIDE.md
│   ├── PROJECT_OVERVIEW.md
│   ├── IMPLEMENTATION_ORDER.md
│   ├── DATABASE_SCHEMA.md
│   ├── BACKEND_SETUP.md
│   ├── FRONTEND_SETUP_PART1.md
│   ├── FRONTEND_SETUP_PART2.md
│   ├── API_DOCUMENTATION.md
│   └── DEPLOYMENT.md
│
├── server/
│   └── DndCharacterSheet.API/
│       ├── Controllers/
│       ├── Data/
│       ├── DTOs/
│       ├── Models/
│       ├── Services/
│       ├── Middleware/
│       ├── appsettings.json
│       └── Program.cs
│
└── client/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── CharacterSheet/
    │   │   ├── Layout/
    │   │   └── UI/
    │   ├── pages/
    │   ├── services/
    │   ├── stores/
    │   ├── types/
    │   ├── utils/
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

---

## ✅ MVP Feature Checklist

The minimum viable product includes:

**Character Sheet:**
- [ ] Basic info (name, race, class, level, background)
- [ ] Ability scores (STR, DEX, CON, INT, WIS, CHA) with auto-calculated modifiers
- [ ] Skills with proficiency/expertise toggles
- [ ] Saving throws
- [ ] Combat stats (AC, HP, Initiative, Speed)
- [ ] Equipment/inventory
- [ ] Spellcasting (for casters)
- [ ] Features & traits
- [ ] Personality & backstory
- [ ] Notes section

**Functionality:**
- [ ] Auto-calculate derived stats (modifiers, bonuses, spell DC)
- [ ] LocalStorage persistence (works without account)
- [ ] Export/Import as JSON
- [ ] Export as fillable PDF
- [ ] Optional user registration/login
- [ ] Cloud save (when logged in)
- [ ] Character list management
- [ ] Light/dark mode
- [ ] Mobile responsive

**Data Integration:**
- [ ] 5e.tools data for races, classes, spells
- [ ] Auto-populate features when selecting race/class
- [ ] Searchable spell list

---

## 🚫 NOT in MVP (Phase 2)

- AI character generator (rule-based or LLM)
- Custom theme creator
- Community theme gallery
- Party management
- Character versioning/history
- Real-time collaboration
- Dice roller
- Combat tracker

---

## 🧪 Testing Approach

**Unit Tests:**
- Auto-calculation functions (utils/calculations.ts)
- Service functions (business logic)

**Integration Tests:**
- API endpoints (can register, login, CRUD characters)
- Database operations

**E2E Tests (Optional):**
- Full user flows (create character → save → reload)

**Manual Testing:**
- Test on Chrome, Firefox, Safari
- Test on mobile (iOS Safari, Chrome Android)
- Test dark mode
- Test PDF export

---

## 📊 Success Metrics

**MVP Launch Goals:**
- 100+ characters created in first month
- < 5 critical bugs reported
- 90+ Lighthouse score
- < 2 second initial load time
- Works on all major browsers

---

## 🔐 Security Considerations

- ✅ JWT tokens with 1-hour expiration
- ✅ BCrypt password hashing (work factor 12)
- ✅ HTTPS enforced in production
- ✅ CORS configured with specific domains
- ✅ SQL injection prevention (EF Core parameterized queries)
- ✅ XSS prevention (React escapes by default)
- ✅ No sensitive data in localStorage (only character sheets)

---

## 💡 Development Tips

**For Claude Code:**

1. **Start with backend** - It's the foundation. Get database + API working first.
2. **Test incrementally** - After each file, verify it works before moving on.
3. **Use Swagger** - Test all API endpoints in Swagger UI before building frontend.
4. **Copy-paste is OK** - These docs have complete code. Use it!
5. **Don't over-engineer** - Build MVP first, optimize later.

**Common Mistakes to Avoid:**

- ❌ Don't forget CORS configuration
- ❌ Don't skip database migrations
- ❌ Don't hardcode secrets in appsettings.json
- ❌ Don't forget JWT token in Axios interceptor
- ❌ Don't skip localStorage auto-save (key feature!)

---

## 🚀 Deployment Workflow

1. **Backend:** Deploy to Railway → Get API URL
2. **Frontend:** Update VITE_API_URL → Deploy to Vercel
3. **Test:** Register, login, create character, save to cloud
4. **Monitor:** Check logs for errors
5. **Iterate:** Fix bugs, add Phase 2 features

---

## 📝 Attribution

This project is built as an experiment in AI-assisted development:
- **Human:** Provided requirements, guidance, and oversight
- **Claude (AI):** Generated architecture, code, and documentation
- **Result:** Full-stack web application built collaboratively

The goal is transparency about AI's capabilities in software development. All code and documentation are provided as-is for educational purposes.

---

## 📄 License

MIT License (or your preferred open-source license)

---

## 🎉 Ready to Build!

Start with **QUICK_START_GUIDE.md** and follow the build order. You've got everything you need!

**Estimated Time to MVP:** 15-20 hours of focused development

Good luck! 🎲✨
