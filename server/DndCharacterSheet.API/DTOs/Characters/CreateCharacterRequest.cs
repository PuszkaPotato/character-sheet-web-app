using System.ComponentModel.DataAnnotations;

namespace DndCharacterSheet.API.DTOs.Characters;

public class CreateCharacterRequest
{
    [Required, MinLength(1), MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public string Data { get; set; } = "{}";
}
