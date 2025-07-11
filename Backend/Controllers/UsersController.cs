using Horizon.BL;
using Horizon.DAL;
using Horizon.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace Horizon.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    public UsersController() { }

    [HttpGet("exists/{email}")]
    public IActionResult UserExists(string email)
    {
        var userService = new UserService();
        bool exists = userService.GetUserByEmail(email, out _) != null;
        return Ok(exists);
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequestDto request)
    {
        var emailRegex = new Regex(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
        var nameRegex = new Regex(@"^[a-zA-Z\s'-]{2,30}$");

        var hasMixedCase = new Regex(@"(?=.*[a-z])(?=.*[A-Z])");
        var hasLetterAndNumber = new Regex(@"(?=.*[a-zA-Z])(?=.*\d)");
        var hasLetterAndSpecial = new Regex(@"(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?])");

        if (string.IsNullOrEmpty(request.Email) || !emailRegex.IsMatch(request.Email))
            return BadRequest("A valid email is required.");

        if (string.IsNullOrEmpty(request.Password) || request.Password.Length < 8)
            return BadRequest("Password must be at least 8 characters.");

        if (!hasMixedCase.IsMatch(request.Password))
            return BadRequest("Password must include both uppercase and lowercase letters.");

        if (!hasLetterAndNumber.IsMatch(request.Password) && !hasLetterAndSpecial.IsMatch(request.Password))
            return BadRequest("Password must contain letters with a number or special character.");

        if (string.IsNullOrEmpty(request.FirstName) || !nameRegex.IsMatch(request.FirstName) ||
            string.IsNullOrEmpty(request.LastName) || !nameRegex.IsMatch(request.LastName))
            return BadRequest("First and last name are required and must be valid.");

        if (string.IsNullOrEmpty(request.BirthDate) || !DateTime.TryParse(request.BirthDate, out _))
            return BadRequest("A valid birthdate is required in YYYY-MM-DD format.");

        if (request.Tags == null || request.Tags.Count < 3)
            return BadRequest("At least 3 interests are required.");

        var user = new User
        {
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            BirthDate = request.BirthDate,
            HashedPassword = request.Password
        };

        List<string> tagNames = request.Tags.Select(t => t.Name).ToList();

        bool success = user.Register(tagNames);

        if (!success)
        {
            return BadRequest("Registration failed. The user may already exist or one or more tags are invalid.");
        }

        return Ok(new { message = "User registered successfully." });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequestDto request)
    {
        User? loggedInUser = Horizon.BL.User.Login(request.Email, request.Password, out List<string> userTags);

        if (loggedInUser == null)
        {
            return Unauthorized("Invalid email or password.");
        }

        var response = new UserResponseDto
        {
            Id = loggedInUser.Id.Value,
            Email = loggedInUser.Email,
            FirstName = loggedInUser.FirstName,
            LastName = loggedInUser.LastName,
            ImgUrl = loggedInUser.ImgUrl,
            Tags = userTags
        };
        return Ok(response);
    }
}