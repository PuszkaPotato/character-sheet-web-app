# Backend Setup - .NET 8 Web API

This document contains complete implementation details for the backend API.

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Configuration](#configuration)
3. [DTOs](#dtos-data-transfer-objects)
4. [Services](#services)
5. [Controllers](#controllers)
6. [Middleware](#middleware)
7. [Program.cs Configuration](#programcs-configuration)

---

## Initial Setup

### Create Project
```bash
dotnet new webapi -n DndCharacterSheet.API
cd DndCharacterSheet.API
```

### Install NuGet Packages
```bash
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package BCrypt.Net-Next
dotnet add package Swashbuckle.AspNetCore
```

### Project Structure
```
DndCharacterSheet.API/
├── Controllers/
│   ├── AuthController.cs
│   ├── CharactersController.cs
│   └── ThemesController.cs
├── Data/
│   ├── ApplicationDbContext.cs
│   └── Migrations/
├── DTOs/
│   ├── Auth/
│   │   ├── LoginRequest.cs
│   │   ├── RegisterRequest.cs
│   │   └── AuthResponse.cs
│   ├── Characters/
│   │   ├── CharacterDto.cs
│   │   ├── CreateCharacterRequest.cs
│   │   └── UpdateCharacterRequest.cs
│   └── Themes/
│       ├── ThemeDto.cs
│       └── CreateThemeRequest.cs
├── Middleware/
│   └── ErrorHandlingMiddleware.cs
├── Models/
│   ├── User.cs
│   ├── Character.cs
│   └── Theme.cs
├── Services/
│   ├── IAuthService.cs
│   ├── AuthService.cs
│   ├── ICharacterService.cs
│   └── CharacterService.cs
├── appsettings.json
├── appsettings.Development.json
└── Program.cs
```

---

## Configuration

### appsettings.json
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-min-32-characters-long",
    "Issuer": "DndCharacterSheetAPI",
    "Audience": "DndCharacterSheetClient",
    "ExpirationMinutes": 60
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=dnd_character_sheet_dev;Username=postgres;Password=yourpassword"
  }
}
```

### appsettings.Development.json
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=dnd_character_sheet_dev;Username=postgres;Password=dev_password"
  }
}
```

---

## DTOs (Data Transfer Objects)

### Auth DTOs

```csharp
// DTOs/Auth/RegisterRequest.cs
using System.ComponentModel.DataAnnotations;

namespace DndCharacterSheet.API.DTOs.Auth;

public class RegisterRequest
{
    [Required]
    [MinLength(3)]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}
```

```csharp
// DTOs/Auth/LoginRequest.cs
using System.ComponentModel.DataAnnotations;

namespace DndCharacterSheet.API.DTOs.Auth;

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
```

```csharp
// DTOs/Auth/AuthResponse.cs
namespace DndCharacterSheet.API.DTOs.Auth;

public class AuthResponse
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}
```

### Character DTOs

```csharp
// DTOs/Characters/CharacterDto.cs
namespace DndCharacterSheet.API.DTOs.Characters;

public class CharacterDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public object Data { get; set; } = new { };
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

```csharp
// DTOs/Characters/CreateCharacterRequest.cs
using System.ComponentModel.DataAnnotations;

namespace DndCharacterSheet.API.DTOs.Characters;

public class CreateCharacterRequest
{
    [Required]
    [MinLength(1)]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public object Data { get; set; } = new { };
}
```

```csharp
// DTOs/Characters/UpdateCharacterRequest.cs
using System.ComponentModel.DataAnnotations;

namespace DndCharacterSheet.API.DTOs.Characters;

public class UpdateCharacterRequest
{
    [MinLength(1)]
    [MaxLength(100)]
    public string? Name { get; set; }

    public object? Data { get; set; }
}
```

### Theme DTOs

```csharp
// DTOs/Themes/ThemeDto.cs
namespace DndCharacterSheet.API.DTOs.Themes;

public class ThemeDto
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public object Data { get; set; } = new { };
    public bool IsPublic { get; set; }
    public int DownloadCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

```csharp
// DTOs/Themes/CreateThemeRequest.cs
using System.ComponentModel.DataAnnotations;

namespace DndCharacterSheet.API.DTOs.Themes;

public class CreateThemeRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    public object Data { get; set; } = new { };

    public bool IsPublic { get; set; } = false;
}
```

---

## Services

### IAuthService Interface

```csharp
// Services/IAuthService.cs
using DndCharacterSheet.API.DTOs.Auth;

namespace DndCharacterSheet.API.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    string GenerateJwtToken(Guid userId, string email, string username);
}
```

### AuthService Implementation

```csharp
// Services/AuthService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using DndCharacterSheet.API.Data;
using DndCharacterSheet.API.DTOs.Auth;
using DndCharacterSheet.API.Models;

namespace DndCharacterSheet.API.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Check if email already exists
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new InvalidOperationException("Email already registered");
        }

        // Check if username already exists
        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
        {
            throw new InvalidOperationException("Username already taken");
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12);

        // Create user
        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = passwordHash
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Generate token
        var token = GenerateJwtToken(user.Id, user.Email, user.Username);
        var expiresAt = DateTime.UtcNow.AddMinutes(
            int.Parse(_configuration["JwtSettings:ExpirationMinutes"] ?? "60"));

        return new AuthResponse
        {
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            Token = token,
            ExpiresAt = expiresAt
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        // Find user by email
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Generate token
        var token = GenerateJwtToken(user.Id, user.Email, user.Username);
        var expiresAt = DateTime.UtcNow.AddMinutes(
            int.Parse(_configuration["JwtSettings:ExpirationMinutes"] ?? "60"));

        return new AuthResponse
        {
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            Token = token,
            ExpiresAt = expiresAt
        };
    }

    public string GenerateJwtToken(Guid userId, string email, string username)
    {
        var secretKey = _configuration["JwtSettings:SecretKey"] 
            ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = _configuration["JwtSettings:Issuer"] ?? "DndCharacterSheetAPI";
        var audience = _configuration["JwtSettings:Audience"] ?? "DndCharacterSheetClient";
        var expirationMinutes = int.Parse(_configuration["JwtSettings:ExpirationMinutes"] ?? "60");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim("username", username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

### ICharacterService Interface

```csharp
// Services/ICharacterService.cs
using DndCharacterSheet.API.DTOs.Characters;

namespace DndCharacterSheet.API.Services;

public interface ICharacterService
{
    Task<CharacterDto> CreateAsync(Guid userId, CreateCharacterRequest request);
    Task<CharacterDto?> GetByIdAsync(Guid id, Guid userId);
    Task<List<CharacterDto>> GetAllByUserAsync(Guid userId);
    Task<CharacterDto> UpdateAsync(Guid id, Guid userId, UpdateCharacterRequest request);
    Task<bool> DeleteAsync(Guid id, Guid userId);
}
```

### CharacterService Implementation

```csharp
// Services/CharacterService.cs
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using DndCharacterSheet.API.Data;
using DndCharacterSheet.API.DTOs.Characters;
using DndCharacterSheet.API.Models;

namespace DndCharacterSheet.API.Services;

public class CharacterService : ICharacterService
{
    private readonly ApplicationDbContext _context;

    public CharacterService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CharacterDto> CreateAsync(Guid userId, CreateCharacterRequest request)
    {
        var character = new Character
        {
            UserId = userId,
            Name = request.Name,
            Data = JsonSerializer.Serialize(request.Data)
        };

        _context.Characters.Add(character);
        await _context.SaveChangesAsync();

        return MapToDto(character);
    }

    public async Task<CharacterDto?> GetByIdAsync(Guid id, Guid userId)
    {
        var character = await _context.Characters
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        return character == null ? null : MapToDto(character);
    }

    public async Task<List<CharacterDto>> GetAllByUserAsync(Guid userId)
    {
        var characters = await _context.Characters
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.UpdatedAt)
            .ToListAsync();

        return characters.Select(MapToDto).ToList();
    }

    public async Task<CharacterDto> UpdateAsync(Guid id, Guid userId, UpdateCharacterRequest request)
    {
        var character = await _context.Characters
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (character == null)
        {
            throw new KeyNotFoundException($"Character with ID {id} not found");
        }

        if (request.Name != null)
        {
            character.Name = request.Name;
        }

        if (request.Data != null)
        {
            character.Data = JsonSerializer.Serialize(request.Data);
        }

        character.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(character);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var character = await _context.Characters
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (character == null)
        {
            return false;
        }

        _context.Characters.Remove(character);
        await _context.SaveChangesAsync();

        return true;
    }

    private static CharacterDto MapToDto(Character character)
    {
        return new CharacterDto
        {
            Id = character.Id,
            UserId = character.UserId,
            Name = character.Name,
            Data = JsonSerializer.Deserialize<object>(character.Data) ?? new { },
            CreatedAt = character.CreatedAt,
            UpdatedAt = character.UpdatedAt
        };
    }
}
```

---

## Controllers

### AuthController

```csharp
// Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using DndCharacterSheet.API.DTOs.Auth;
using DndCharacterSheet.API.Services;

namespace DndCharacterSheet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var response = await _authService.RegisterAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }
}
```

### CharactersController

```csharp
// Controllers/CharactersController.cs
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DndCharacterSheet.API.DTOs.Characters;
using DndCharacterSheet.API.Services;

namespace DndCharacterSheet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CharactersController : ControllerBase
{
    private readonly ICharacterService _characterService;

    public CharactersController(ICharacterService characterService)
    {
        _characterService = characterService;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user token");
        }
        return userId;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCharacterRequest request)
    {
        try
        {
            var userId = GetUserId();
            var character = await _characterService.CreateAsync(userId, request);
            return CreatedAtAction(nameof(GetById), new { id = character.Id }, character);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var character = await _characterService.GetByIdAsync(id, userId);
            
            if (character == null)
            {
                return NotFound(new { message = "Character not found" });
            }

            return Ok(character);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var userId = GetUserId();
            var characters = await _characterService.GetAllByUserAsync(userId);
            return Ok(characters);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCharacterRequest request)
    {
        try
        {
            var userId = GetUserId();
            var character = await _characterService.UpdateAsync(id, userId, request);
            return Ok(character);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var success = await _characterService.DeleteAsync(id, userId);
            
            if (!success)
            {
                return NotFound(new { message = "Character not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
```

---

## Middleware

### ErrorHandlingMiddleware

```csharp
// Middleware/ErrorHandlingMiddleware.cs
using System.Net;
using System.Text.Json;

namespace DndCharacterSheet.API.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = exception switch
        {
            UnauthorizedAccessException => HttpStatusCode.Unauthorized,
            KeyNotFoundException => HttpStatusCode.NotFound,
            InvalidOperationException => HttpStatusCode.BadRequest,
            _ => HttpStatusCode.InternalServerError
        };

        var response = new
        {
            error = exception.Message,
            statusCode = (int)statusCode
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
```

---

## Program.cs Configuration

```csharp
// Program.cs
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using DndCharacterSheet.API.Data;
using DndCharacterSheet.API.Middleware;
using DndCharacterSheet.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger configuration with JWT support
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "DnD Character Sheet API",
        Version = "v1",
        Description = "API for managing D&D 5e character sheets"
    });

    // Add JWT authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",  // Vite dev server
            "http://localhost:3000",  // Alternative port
            "https://yourdomain.com"  // Production domain
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

// Register application services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICharacterService, CharacterService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Custom error handling middleware
app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.Run();
```

---

## Running the Application

### Development
```bash
# Run migrations
dotnet ef database update

# Start the API
dotnet run

# API will be available at:
# http://localhost:5000
# Swagger UI at: http://localhost:5000/swagger
```

### Testing with Swagger

1. Open `http://localhost:5000/swagger`
2. Test registration:
   - POST `/api/auth/register`
   - Body: `{ "username": "testuser", "email": "test@example.com", "password": "password123" }`
3. Copy the returned `token`
4. Click "Authorize" button in Swagger UI
5. Enter: `Bearer <your-token>`
6. Test character endpoints

---

## Next Document

Proceed to **FRONTEND_SETUP.md** for React frontend implementation.
