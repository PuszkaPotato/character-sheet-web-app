# Character Sheet Web App & Generator

## Note from the human in charge of this project

This application was born out of my curiosity to how far Claude can get by itself. I gave it an idea for this project,
but when it comes to the planning, tech stack choice and execution I left it upto it.

One mistake I have made in the beginning was actually asking it to make a plan while logged into my account because it surely was influenced by me developing in .Net, and perhaps it would have chosen a different tech stack if I ran it in anonymous chat instead.

---

A D&D 5th Edition character sheet app that works entirely in your browser — no account needed. Create and manage characters, track spells, and export to PDF. Optionally register to sync characters to the cloud.

## Features

- **Full 5e character sheet** — ability scores, skills, saving throws, combat stats, equipment, spellcasting, features, and notes
- **Auto-calculated stats** — modifiers, proficiency bonus, skill bonuses, spell save DC, and spell attack bonus update instantly
- **5e.tools data** — searchable dropdowns for races, classes, subclasses, and backgrounds pulled live from the 5etools dataset; spell browser covering PHB, XGE, and TCE
- **LocalStorage auto-save** — your character saves to the browser every half second, no account required
- **Cloud sync** — register and log in to save characters to the server and access them from anywhere
- **JSON import/export** — back up or share characters as files
- **PDF export** — download a formatted character sheet
- **Dark mode** — system-aware, toggleable

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router v6 |
| Backend | .NET 10 Web API, Entity Framework Core 10, PostgreSQL |
| Auth | JWT (stored in localStorage), BCrypt password hashing |
| PDF | jsPDF |

## Running Locally

### Prerequisites
- Node.js 18+
- .NET 10 SDK
- PostgreSQL 15+

### Backend

```bash
cd server/DndCharacterSheet.API
```

Create `appsettings.Development.json` (gitignored):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=dnd_character_sheet_dev;Username=postgres;Password=yourpassword"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key-must-be-at-least-32-characters",
    "Issuer": "DndCharacterSheetAPI",
    "Audience": "DndCharacterSheetClient",
    "ExpirationMinutes": "60"
  }
}
```

```bash
dotnet ef database update
dotnet run
# API available at http://localhost:5000
# Swagger UI at http://localhost:5000/swagger
```

### Frontend

```bash
cd client
```

Create `.env.local`:

```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm install
npm run dev
# App available at http://localhost:5173
```

## License

MIT
