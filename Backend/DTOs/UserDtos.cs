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