# Database Schema

This document defines the complete database structure for the DnD Character Sheet application.

## Overview

The database uses PostgreSQL with Entity Framework Core. We use JSONB columns for flexible character data storage (since D&D characters can have varying structures based on class/race).

## Entity Relationship Diagram

```
┌─────────────────┐
│     Users       │
│─────────────────│
│ Id (PK)         │
│ Username        │
│ Email (unique)  │
│ PasswordHash    │
│ CreatedAt       │
│ UpdatedAt       │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│   Characters    │
│─────────────────│
│ Id (PK)         │
│ UserId (FK)     │
│ Name            │
│ Data (JSONB)    │───── Stores complete character sheet data
│ CreatedAt       │
│ UpdatedAt       │
└─────────────────┘

┌─────────────────┐
│     Themes      │
│─────────────────│
│ Id (PK)         │
│ UserId (FK)     │ (nullable - community themes)
│ Name            │
│ Description     │
│ Data (JSONB)    │───── Stores theme configuration
│ IsPublic        │
│ DownloadCount   │
│ CreatedAt       │
└─────────────────┘
```

## Models

### User Model

```csharp
// Models/User.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DndCharacterSheet.API.Models;

public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<Character> Characters { get; set; } = new List<Character>();
    
    public virtual ICollection<Theme> Themes { get; set; } = new List<Theme>();
}
```

### Character Model

```csharp
// Models/Character.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DndCharacterSheet.API.Models;

public class Character
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Complete character data stored as JSON
    /// This includes abilities, skills, equipment, spells, etc.
    /// Using JSONB for flexibility as different classes/races have different data structures
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string Data { get; set; } = "{}";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;
}
```

### Theme Model

```csharp
// Models/Theme.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DndCharacterSheet.API.Models;

public class Theme
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// UserId is nullable - null means it's a default/system theme
    /// </summary>
    public Guid? UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Theme configuration (colors, fonts, etc.) stored as JSON
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string Data { get; set; } = "{}";

    /// <summary>
    /// Can other users see and use this theme?
    /// </summary>
    public bool IsPublic { get; set; } = false;

    /// <summary>
    /// Track popularity
    /// </summary>
    public int DownloadCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}
```

## ApplicationDbContext

```csharp
// Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using DndCharacterSheet.API.Models;

namespace DndCharacterSheet.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Character> Characters { get; set; }
    public DbSet<Theme> Themes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Username).IsUnique();
            
            entity.HasMany(u => u.Characters)
                .WithOne(c => c.User)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Delete characters when user is deleted
            
            entity.HasMany(u => u.Themes)
                .WithOne(t => t.User!)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.SetNull); // Set theme owner to null when user deleted
        });

        // Character configuration
        modelBuilder.Entity<Character>(entity =>
        {
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CreatedAt);
            
            // Configure JSONB column
            entity.Property(e => e.Data)
                .HasColumnType("jsonb");
        });

        // Theme configuration
        modelBuilder.Entity<Theme>(entity =>
        {
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.IsPublic);
            entity.HasIndex(e => e.DownloadCount);
            
            // Configure JSONB column
            entity.Property(e => e.Data)
                .HasColumnType("jsonb");
        });
    }
}
```

## Character Data JSON Structure

The `Character.Data` JSONB field contains the complete character sheet data:

```json
{
  "basicInfo": {
    "name": "Gandalf",
    "race": "Human (Variant)",
    "class": "Wizard",
    "subclass": "School of Evocation",
    "level": 5,
    "background": "Sage",
    "alignment": "Neutral Good",
    "experiencePoints": 6500
  },
  "abilities": {
    "strength": 8,
    "dexterity": 14,
    "constitution": 12,
    "intelligence": 18,
    "wisdom": 13,
    "charisma": 10
  },
  "proficiencyBonus": 3,
  "savingThrows": {
    "strength": { "proficient": false },
    "dexterity": { "proficient": false },
    "constitution": { "proficient": false },
    "intelligence": { "proficient": true },
    "wisdom": { "proficient": true },
    "charisma": { "proficient": false }
  },
  "skills": {
    "acrobatics": { "proficient": false, "expertise": false },
    "animalHandling": { "proficient": false, "expertise": false },
    "arcana": { "proficient": true, "expertise": false },
    "athletics": { "proficient": false, "expertise": false },
    "deception": { "proficient": false, "expertise": false },
    "history": { "proficient": true, "expertise": false },
    "insight": { "proficient": false, "expertise": false },
    "intimidation": { "proficient": false, "expertise": false },
    "investigation": { "proficient": true, "expertise": false },
    "medicine": { "proficient": false, "expertise": false },
    "nature": { "proficient": false, "expertise": false },
    "perception": { "proficient": false, "expertise": false },
    "performance": { "proficient": false, "expertise": false },
    "persuasion": { "proficient": false, "expertise": false },
    "religion": { "proficient": true, "expertise": false },
    "sleightOfHand": { "proficient": false, "expertise": false },
    "stealth": { "proficient": false, "expertise": false },
    "survival": { "proficient": false, "expertise": false }
  },
  "combat": {
    "armorClass": 12,
    "initiative": 2,
    "speed": 30,
    "maxHitPoints": 28,
    "currentHitPoints": 28,
    "temporaryHitPoints": 0,
    "hitDice": {
      "total": "5d6",
      "current": 5
    },
    "deathSaves": {
      "successes": 0,
      "failures": 0
    }
  },
  "equipment": [
    {
      "id": "item-1",
      "name": "Staff of Power",
      "quantity": 1,
      "weight": 4,
      "description": "This staff can be wielded as a magic quarterstaff...",
      "equipped": true
    },
    {
      "id": "item-2",
      "name": "Spellbook",
      "quantity": 1,
      "weight": 3,
      "description": "Contains wizard spells",
      "equipped": false
    }
  ],
  "currency": {
    "copper": 0,
    "silver": 0,
    "electrum": 0,
    "gold": 500,
    "platinum": 0
  },
  "spellcasting": {
    "spellcastingAbility": "intelligence",
    "spellSaveDC": 15,
    "spellAttackBonus": 7,
    "spellSlots": {
      "1": { "max": 4, "used": 0 },
      "2": { "max": 3, "used": 0 },
      "3": { "max": 2, "used": 0 }
    },
    "spellsKnown": [
      {
        "id": "spell-1",
        "name": "Fireball",
        "level": 3,
        "school": "Evocation",
        "castingTime": "1 action",
        "range": "150 feet",
        "components": "V, S, M (a tiny ball of bat guano and sulfur)",
        "duration": "Instantaneous",
        "description": "A bright streak flashes...",
        "prepared": true
      }
    ],
    "cantrips": [
      {
        "id": "cantrip-1",
        "name": "Fire Bolt",
        "school": "Evocation",
        "description": "You hurl a mote of fire..."
      }
    ]
  },
  "features": [
    {
      "id": "feature-1",
      "name": "Spellcasting",
      "source": "Wizard",
      "description": "You have learned to cast spells..."
    },
    {
      "id": "feature-2",
      "name": "Arcane Recovery",
      "source": "Wizard",
      "description": "You have learned to regain some of your magical energy..."
    }
  ],
  "traits": [
    {
      "id": "trait-1",
      "name": "Darkvision",
      "source": "Racial",
      "description": "You can see in dim light..."
    }
  ],
  "proficiencies": {
    "armor": ["Light Armor"],
    "weapons": ["Simple Weapons"],
    "tools": ["Alchemist's Supplies"],
    "languages": ["Common", "Draconic", "Elvish"]
  },
  "personality": {
    "traits": "I use polysyllabic words to convey the impression of great erudition.",
    "ideals": "Knowledge. The path to power and self-improvement is through knowledge.",
    "bonds": "I've been searching my whole life for the answer to a certain question.",
    "flaws": "I am easily distracted by the promise of information."
  },
  "backstory": "Born in a small village, Gandalf showed an early aptitude for magic...",
  "appearance": {
    "age": 28,
    "height": "5'10\"",
    "weight": "160 lbs",
    "eyes": "Blue",
    "skin": "Fair",
    "hair": "Brown",
    "portraitUrl": null
  },
  "allies": [],
  "notes": "Additional notes and reminders..."
}
```

## Theme Data JSON Structure

The `Theme.Data` JSONB field contains theme configuration:

```json
{
  "colors": {
    "primary": "#8b5cf6",
    "secondary": "#ec4899",
    "background": "#1f2937",
    "surface": "#374151",
    "text": "#f9fafb",
    "textSecondary": "#d1d5db",
    "border": "#4b5563",
    "accent": "#10b981",
    "error": "#ef4444",
    "warning": "#f59e0b",
    "success": "#10b981"
  },
  "fonts": {
    "heading": "Cinzel, serif",
    "body": "Inter, sans-serif",
    "mono": "JetBrains Mono, monospace"
  },
  "spacing": {
    "scale": 1.0
  },
  "borderRadius": {
    "small": "0.25rem",
    "medium": "0.5rem",
    "large": "1rem"
  },
  "customCss": ""
}
```

## Indexes Strategy

### Performance Indexes
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Character queries
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_created_at ON characters(created_at);

-- JSONB search (example - add as needed)
CREATE INDEX idx_characters_data_name ON characters USING gin ((data->'basicInfo'->>'name') gin_trgm_ops);

-- Theme queries
CREATE INDEX idx_themes_user_id ON themes(user_id);
CREATE INDEX idx_themes_public ON themes(is_public) WHERE is_public = true;
CREATE INDEX idx_themes_downloads ON themes(download_count DESC);
```

## Database Migrations

### Initial Migration Commands
```bash
# Create migration
dotnet ef migrations add InitialCreate

# Apply migration
dotnet ef database update

# Rollback migration
dotnet ef migrations remove

# Generate SQL script
dotnet ef migrations script
```

### Seed Data (Optional)

```csharp
// Data/DbSeeder.cs
public static class DbSeeder
{
    public static void SeedDefaultThemes(ApplicationDbContext context)
    {
        if (context.Themes.Any()) return;

        var themes = new List<Theme>
        {
            new Theme
            {
                Name = "Classic D&D",
                Description = "Traditional red and white theme",
                IsPublic = true,
                Data = @"{
                    ""colors"": {
                        ""primary"": ""#dc2626"",
                        ""secondary"": ""#fef2f2"",
                        ""background"": ""#ffffff""
                    }
                }"
            },
            new Theme
            {
                Name = "Dark Dungeon",
                Description = "Dark mode for late-night gaming",
                IsPublic = true,
                Data = @"{
                    ""colors"": {
                        ""primary"": ""#a855f7"",
                        ""background"": ""#0f172a"",
                        ""text"": ""#f1f5f9""
                    }
                }"
            }
        };

        context.Themes.AddRange(themes);
        context.SaveChanges();
    }
}
```

## Connection String Examples

### Development (appsettings.Development.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=dnd_character_sheet_dev;Username=postgres;Password=yourpassword"
  }
}
```

### Production (Environment Variables)
```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

### Docker Compose (for local development)
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: dnd_character_sheet_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Backup Strategy

### Automated Backups
```bash
# Daily backup script
pg_dump -h localhost -U postgres dnd_character_sheet_prod > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h localhost -U postgres dnd_character_sheet_prod < backup_20250220.sql
```

### Cloud Provider Backups
Most hosting providers (Railway, Supabase) provide automatic backups. Enable:
- Daily automated backups
- 7-day retention minimum
- Point-in-time recovery (if available)

---

## Next Document

Proceed to **BACKEND_SETUP.md** for complete backend implementation guide.
