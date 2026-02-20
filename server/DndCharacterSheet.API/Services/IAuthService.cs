using DndCharacterSheet.API.DTOs.Auth;

namespace DndCharacterSheet.API.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
}
