using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DndCharacterSheet.API.DTOs.Characters;
using DndCharacterSheet.API.Services;

namespace DndCharacterSheet.API.Controllers;

[ApiController]
[Route("api/characters")]
[Authorize]
public class CharactersController : ControllerBase
{
    private readonly ICharacterService _characterService;

    public CharactersController(ICharacterService characterService)
    {
        _characterService = characterService;
    }

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<ActionResult<CharacterDto>> Create([FromBody] CreateCharacterRequest request)
    {
        var character = await _characterService.CreateAsync(UserId, request);
        return CreatedAtAction(nameof(GetById), new { id = character.Id }, character);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CharacterDto>>> GetAll()
    {
        var characters = await _characterService.GetAllAsync(UserId);
        return Ok(characters);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CharacterDto>> GetById(Guid id)
    {
        var character = await _characterService.GetByIdAsync(UserId, id);
        return Ok(character);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CharacterDto>> Update(Guid id, [FromBody] UpdateCharacterRequest request)
    {
        var character = await _characterService.UpdateAsync(UserId, id, request);
        return Ok(character);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _characterService.DeleteAsync(UserId, id);
        return NoContent();
    }
}
