namespace Horizon.DTOs;

public class TagDto
{
    public string Name { get; set; }
}

public class RegisterRequestDto
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string BirthDate { get; set; }
    public List<TagDto> Tags { get; set; }
}

public class LoginRequestDto
{
    public string Email { get; set; }
    public string Password { get; set; }
}

public class UserResponseDto
{
    public int Id { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string? ImgUrl { get; set; }
    public List<string> Tags { get; set; }
}

public class BlockedUserDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Avatar { get; set; }
}

public class UserProfileResponseDto
{
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string BirthDate { get; set; }
    public string? ImageUrl { get; set; }
    public List<string> Interests { get; set; }
    public List<BlockedUserDto> BlockedUsers { get; set; }
}

public class UpdateProfileRequestDto
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string BirthDate { get; set; }
    public string? ImageUrl { get; set; }
    public string? NewPassword { get; set; }
    public List<string> Interests { get; set; }
}