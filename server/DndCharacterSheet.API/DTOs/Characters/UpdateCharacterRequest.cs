using System.ComponentModel.DataAnnotations;

namespace DndCharacterSheet.API.DTOs.Characters;

public class UpdateCharacterRequest
{
    [MaxLength(100)]
    public string? Name { get; set; }

    public string? Data { get; set; }
}
