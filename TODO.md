# TODO

Tasks in priority order. Update this file as work progresses.

## In Progress
_nothing currently_

## Up Next

### 1. Smoke test full stack
Walk through the complete flow end-to-end with both servers running:
- Register new account
- Login
- Create a character
- Save to cloud
- Reload the page
- Verify character appears in the cloud list and data is intact
- Verify localStorage character also survives reload
- Test JSON export/import
- Test PDF export

### 2. Deployment
Deploy to production. See `docs/DEPLOYMENT.md` for full instructions.
- [ ] Backend → Railway (needs `railway.json`, env vars, migrations)
- [ ] Frontend → Vercel (needs `vercel.json`, `VITE_API_URL` set to prod backend)
- [ ] Update CORS in `Program.cs` with production frontend domain
- [ ] Smoke test in production after deploy

## Backlog

### Auto-populate hit die on class select
When a class is chosen via the Combobox, optionally set `combat.hitDice.total`
(e.g. Fighter → "1d10", Wizard → "1d6"). Low priority.

## Done

- Full character sheet (abilities, skills, saving throws, combat, equipment, spells, features, notes)
- LocalStorage auto-save (debounced 500ms)
- Cloud save (JWT-authenticated)
- JSON import/export
- PDF export (jsPDF)
- JWT auth: register, login, logout
- Character list page (cloud + local)
- Light/dark mode (Tailwind `class` strategy)
- 5e.tools integration: race/class/background Combobox, SpellPicker modal
- EF Core migration applied to local PostgreSQL
