# Deployment Guide

This guide covers deploying the DnD Character Sheet app to production.

## Overview

**Recommended Stack (Free Tier):**
- Frontend: Vercel or Netlify
- Backend: Railway.app or Fly.io
- Database: Railway PostgreSQL or Supabase

---

## 1. Database Deployment

### Option A: Railway PostgreSQL

1. Sign up at [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy connection string from "Connect" tab
4. Format: `postgresql://user:password@host:port/dbname`

### Option B: Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Project Settings → Database
4. Copy "Connection string" (Direct connection)
5. Replace `[YOUR-PASSWORD]` with your actual password

**Example Connection String:**
```
postgresql://postgres.abc123:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

---

## 2. Backend Deployment

### Option A: Railway

**2.1 Prepare Backend:**

Create `railway.json` in backend root:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "dotnet DndCharacterSheet.API.dll",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Update `appsettings.Production.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

**2.2 Deploy:**

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. In backend folder: `railway init`
4. Link to your project
5. `railway up`

**2.3 Configure Environment Variables in Railway Dashboard:**
```
DATABASE_URL=<your-postgres-connection-string>
JWT_SECRET=<generate-a-secure-random-string>
ASPNETCORE_ENVIRONMENT=Production
```

**2.4 Update Program.cs** to read from environment:
```csharp
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") 
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? builder.Configuration["JwtSettings:SecretKey"];
```

**2.5 Run Migrations:**
```bash
railway run dotnet ef database update
```

---

### Option B: Fly.io

**2.1 Install Fly CLI:**
```bash
curl -L https://fly.io/install.sh | sh
```

**2.2 Login and Launch:**
```bash
fly auth login
cd server/DndCharacterSheet.API
fly launch
```

**2.3 Set Environment Variables:**
```bash
fly secrets set DATABASE_URL="<connection-string>"
fly secrets set JWT_SECRET="<random-string>"
fly secrets set ASPNETCORE_ENVIRONMENT="Production"
```

**2.4 Deploy:**
```bash
fly deploy
```

---

## 3. Frontend Deployment

### Option A: Vercel

**3.1 Prepare Frontend:**

Update `.env.production`:
```
VITE_API_URL=https://your-backend.railway.app/api
```

**3.2 Deploy:**

1. Install Vercel CLI: `npm i -g vercel`
2. In client folder: `vercel login`
3. `vercel`
4. Follow prompts
5. Set environment variable in Vercel dashboard:
   - `VITE_API_URL` = your backend URL

**3.3 Configure vercel.json:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### Option B: Netlify

**3.1 Create `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  VITE_API_URL = "https://your-backend.railway.app/api"
```

**3.2 Deploy:**

1. Install CLI: `npm i -g netlify-cli`
2. `netlify login`
3. `netlify init`
4. `netlify deploy --prod`

---

## 4. CORS Configuration

Update backend `Program.cs` with production domain:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "https://your-app.vercel.app",
            "https://your-custom-domain.com"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

---

## 5. Custom Domain (Optional)

### Frontend (Vercel):
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records with your registrar

### Backend (Railway):
1. Go to Project Settings → Domains
2. Generate domain or add custom domain
3. Update DNS CNAME record

---

## 6. Environment Variables Checklist

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Random secure string (min 32 chars)
- `ASPNETCORE_ENVIRONMENT` - "Production"
- `JWT_ISSUER` - Your API domain
- `JWT_AUDIENCE` - Your frontend domain

**Frontend:**
- `VITE_API_URL` - Backend API URL

---

## 7. Post-Deployment Testing

✅ Test these flows in production:

1. **Registration:**
   - Visit your frontend URL
   - Register new account
   - Verify email format
   - Check database for user entry

2. **Login:**
   - Login with test account
   - Verify token is stored
   - Check auth endpoints work

3. **Character Creation:**
   - Create new character
   - Save to cloud
   - Verify appears in database
   - Load character list

4. **LocalStorage:**
   - Create character without login
   - Refresh page
   - Verify character persists
   - Export as JSON
   - Import JSON

5. **PDF Export:**
   - Open character sheet
   - Export as PDF
   - Verify PDF downloads
   - Check if fields are editable

---

## 8. Monitoring & Logging

### Railway:
- View logs in dashboard
- Set up error alerts

### Vercel:
- Check deployment logs
- Enable Web Analytics

### Application Insights (Optional):
Add to .NET for detailed monitoring:
```bash
dotnet add package Microsoft.ApplicationInsights.AspNetCore
```

---

## 9. Cost Estimates (Monthly)

**Free Tier (Recommended for MVP):**
- Vercel: Free (includes custom domain)
- Railway: $5 (includes 500 hours + PostgreSQL)
- Supabase: Free (2 projects, 500MB database)

**Total: $0-5/month for initial launch**

**Paid Tier (If you scale):**
- Vercel Pro: $20/month
- Railway: ~$20/month (depends on usage)
- Supabase Pro: $25/month

**Total: ~$65/month for higher traffic**

---

## 10. Backup Strategy

### Database Backups:
**Railway:**
- Automatic daily backups included
- Manual backups in dashboard

**Supabase:**
- Daily backups (7-day retention on free tier)
- Enable Point-in-time Recovery (Pro tier)

### Manual Backup:
```bash
pg_dump -h your-host -U postgres -d dbname > backup.sql
```

---

## 11. Security Checklist

Before going live:

- [ ] JWT secret is secure random string (32+ chars)
- [ ] Database credentials are in environment variables
- [ ] CORS is configured with specific domains (not `*`)
- [ ] HTTPS is enabled (automatic with Vercel/Railway)
- [ ] Password hashing uses BCrypt with work factor 12
- [ ] API rate limiting is enabled (future)
- [ ] SQL injection protection (EF Core handles this)
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info

---

## 12. CI/CD (Optional)

### GitHub Actions for Backend:
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railwayapp/cli@v1
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        with:
          command: up
```

### GitHub Actions for Frontend:
Vercel automatically deploys on push to main if linked to GitHub.

---

## 13. Troubleshooting

**Issue: Backend 500 errors**
- Check Railway logs
- Verify DATABASE_URL is correct
- Ensure migrations ran: `railway run dotnet ef database update`

**Issue: CORS errors**
- Verify frontend URL in CORS policy
- Check if domain includes `https://`
- Ensure `AllowCredentials()` is set

**Issue: JWT token not working**
- Verify JWT_SECRET is set
- Check token expiration time
- Ensure Authorization header format: `Bearer <token>`

**Issue: Frontend can't reach API**
- Verify VITE_API_URL in production
- Check if backend is running
- Test API directly with cURL

---

## 14. Scaling Considerations

**If you hit 100+ concurrent users:**
- Upgrade Railway plan for more resources
- Enable Redis for session caching
- Add CDN for static assets (Cloudflare)
- Implement API rate limiting
- Use database connection pooling

---

## Success Criteria

Deployment is successful when:
- [ ] Frontend loads at production URL
- [ ] Backend API responds to health check
- [ ] Can register new user
- [ ] Can login and create character
- [ ] Character saves to database
- [ ] PDF export works
- [ ] Mobile responsive design works
- [ ] SSL certificate is active
- [ ] No console errors in browser

---

## Launch Checklist

**Pre-Launch:**
- [ ] All features tested in production
- [ ] Database backups enabled
- [ ] Error monitoring set up
- [ ] Analytics configured (optional)
- [ ] Custom domain configured (optional)
- [ ] Privacy policy added (if collecting emails)
- [ ] About page explains AI collaboration

**Launch:**
- [ ] Share URL with test users
- [ ] Monitor logs for errors
- [ ] Gather feedback
- [ ] Fix critical bugs within 24 hours

**Post-Launch:**
- [ ] Set up automated backups
- [ ] Plan Phase 2 features
- [ ] Implement user feedback
- [ ] Optimize performance

---

You're ready to deploy! 🚀
