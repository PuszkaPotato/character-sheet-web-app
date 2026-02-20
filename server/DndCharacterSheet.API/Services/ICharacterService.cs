using DndCharacterSheet.API.DTOs.Characters;

namespace DndCharacterSheet.API.Services;

public interface ICharacterService
{
    Task<CharacterDto> CreateAsync(Guid userId, CreateCharacterRequest request);
    Task<IEnumerable<CharacterDto>> GetAllAsync(Guid userId);
    Task<CharacterDto> GetByIdAsync(Guid userId, Guid characterId);
    Task<CharacterDto> UpdateAsync(Guid userId, Guid characterId, UpdateCharacterRequest request);
    Task DeleteAsync(Guid userId, Guid characterId);
}
