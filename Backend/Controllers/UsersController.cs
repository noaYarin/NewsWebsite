using Horizon.BL;
using Horizon.DAL;
using Horizon.DTOs;
using Horizon.Validators;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace Horizon.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController() 
    {
        _userService = new UserService();
    }

    [HttpGet("exists/{email}")]
    public IActionResult UserExists(string email)
    {
        bool exists = _userService.GetUserByEmail(email, out _) != null;
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
            HashedPassword = request.Password
        };

        List<string> tagNames = request.Tags.Select(t => t.Name).ToList();
        string result = user.Register(tagNames);

        if (result == "USER_EXISTS")
            return Conflict("This email address is already in use.");

        if (result == "INVALID_TAGS")
            return BadRequest("One or more selected interests are invalid.");

        if (result != "SUCCESS")
            return BadRequest("Registration failed due to an unknown error.");

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
            ImageUrl = loggedInUser.ImageUrl,
            Interests = userTags
        };
        return Ok(response);
    }

    [HttpGet("profile/{id}")]
    public IActionResult GetProfile(int id)
    {
        var userService = new UserService();
        var user = userService.GetUserById(id);
        if (user == null) return NotFound();

        var interests = userService.GetUserTags(id);

        var profileDto = new UserProfileResponseDto
        {
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            BirthDate = user.BirthDate,
            ImageUrl = user.ImageUrl,
            Interests = interests,
            BlockedUsers = new List<BlockedUserDto>()
        };
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
            var userService = new UserService();
            User updatedUser = userService.UpdateProfile(id, request);
            var interests = userService.GetUserTags(id);
            var response = new UserResponseDto
            {
                Id = updatedUser.Id.Value,
                Email = updatedUser.Email,
                FirstName = updatedUser.FirstName,
                LastName = updatedUser.LastName,
                ImageUrl = updatedUser.ImageUrl,
                Interests = interests
            };

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
            var userService = new UserService();
            userService.UnblockUser(userId, blockedUserId);
            return Ok(new { message = "User unblocked successfully." });
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred.");
        }
    }
}