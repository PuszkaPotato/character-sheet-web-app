using Microsoft.EntityFrameworkCore;
using DndCharacterSheet.API.Data;
using DndCharacterSheet.API.DTOs.Characters;
using DndCharacterSheet.API.Models;

namespace DndCharacterSheet.API.Services;

public class CharacterService : ICharacterService
{
    private readonly ApplicationDbContext _db;

    public CharacterService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<CharacterDto> CreateAsync(Guid userId, CreateCharacterRequest request)
    {
        var character = new Character
        {
            UserId = userId,
            Name = request.Name,
            Data = request.Data
        };

        _db.Characters.Add(character);
        await _db.SaveChangesAsync();
        return ToDto(character);
    }

    public async Task<IEnumerable<CharacterDto>> GetAllAsync(Guid userId)
    {
        var characters = await _db.Characters
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.UpdatedAt)
            .ToListAsync();

        return characters.Select(ToDto);
    }

    public async Task<CharacterDto> GetByIdAsync(Guid userId, Guid characterId)
    {
        var character = await _db.Characters
            .SingleOrDefaultAsync(c => c.Id == characterId && c.UserId == userId)
            ?? throw new KeyNotFoundException("Character not found.");

        return ToDto(character);
    }

    public async Task<CharacterDto> UpdateAsync(Guid userId, Guid characterId, UpdateCharacterRequest request)
    {
        var character = await _db.Characters
            .SingleOrDefaultAsync(c => c.Id == characterId && c.UserId == userId)
            ?? throw new KeyNotFoundException("Character not found.");

        if (request.Name is not null) character.Name = request.Name;
        if (request.Data is not null) character.Data = request.Data;
        character.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return ToDto(character);
    }

    public async Task DeleteAsync(Guid userId, Guid characterId)
    {
        var character = await _db.Characters
            .SingleOrDefaultAsync(c => c.Id == characterId && c.UserId == userId)
            ?? throw new KeyNotFoundException("Character not found.");

        _db.Characters.Remove(character);
        await _db.SaveChangesAsync();
    }

    private static CharacterDto ToDto(Character c) => new()
    {
        Id = c.Id,
        UserId = c.UserId,
        Name = c.Name,
        Data = c.Data,
        CreatedAt = c.CreatedAt,
        UpdatedAt = c.UpdatedAt
    };
}
