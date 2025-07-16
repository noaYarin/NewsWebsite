using Horizon.BL;
using Horizon.DTOs;
using Horizon.Validators;
using Microsoft.AspNetCore.Mvc;

namespace Horizon.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    [HttpGet("exists/{email}")]
    public IActionResult UserExists(string email)
    {
        bool exists = Horizon.BL.User.UserExists(email);
        return Ok(exists);
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequestDto request)
    {
        List<string> validationErrors = RequestValidator.ValidateRegistrationRequest(request);
        if (validationErrors.Any())
        {
            return BadRequest(new { errors = validationErrors });
        }

        var user = new User
        {
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            BirthDate = request.BirthDate,
        };

        List<string> tagNames = request.Tags.Select(t => t.Name).ToList();
        string result = user.Register(request.Password, tagNames);

        return result switch
        {
            "SUCCESS" => Ok(new { message = "User registered successfully." }),
            "USER_EXISTS" => Conflict("This email address is already in use."),
            "INVALID_TAGS" => BadRequest("One or more selected interests are invalid."),
            _ => StatusCode(500, "Registration failed due to an unknown error.")
        };
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
            ImageUrl = loggedInUser.ImageUrl,
            Interests = userTags,
            IsAdmin = loggedInUser.IsAdmin,
            IsLocked = loggedInUser.IsLocked
        };
        return Ok(response);
    }

    [HttpGet("profile/{id}")]
    public IActionResult GetProfile(int id)
    {
        var profileDto = Horizon.BL.User.GetUserProfile(id);
        if (profileDto == null) return NotFound();

        return Ok(profileDto);
    }

    [HttpPut("profile/{id}")]
    public IActionResult UpdateProfile(int id, [FromBody] UpdateProfileRequestDto request)
    {
        List<string> validationErrors = RequestValidator.ValidateProfileUpdateRequest(request);
        if (validationErrors.Any())
        {
            return BadRequest(new { errors = validationErrors });
        }

        try
        {
            UserResponseDto? response = Horizon.BL.User.UpdateUserProfile(id, request);
            return Ok(response);
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while updating the profile.");
        }
    }

    [HttpDelete("{userId}/blocked/{blockedUserId}")]
    public IActionResult UnblockUser(int userId, int blockedUserId)
    {
        try
        {
            Horizon.BL.User.UnblockUser(userId, blockedUserId);
            return Ok(new { message = "User unblocked successfully." });
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred.");
        }
    }

    [HttpPut("{id}/toggle-status")]
    public IActionResult ToggleUserStatus(int id, [FromBody] ToggleStatusRequestDto request)
    {
        if (request.Attribute != "IsAdmin" && request.Attribute != "IsLocked")
        {
            return BadRequest(new { message = "Invalid attribute specified. Use 'IsAdmin' or 'IsLocked'." });
        }

        var success = Horizon.BL.User.ToggleUserStatus(id, request.Attribute);

        if (!success)
        {
            return NotFound(new { message = "User not found." });
        }

        var updatedProfile = Horizon.BL.User.GetUserProfile(id);
        return Ok(updatedProfile);
    }
}