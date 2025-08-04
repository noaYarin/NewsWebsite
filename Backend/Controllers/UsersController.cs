using Horizon.BL;
using Horizon.DTOs;
using Horizon.Validators;
using Microsoft.AspNetCore.Mvc;

namespace Horizon.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetUsers([FromQuery] string? searchTerm)
        {
            try
            {
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    var searchedUsers = Horizon.BL.User.SearchByEmail(searchTerm);
                    return Ok(searchedUsers);
                }

                var allUsers = Horizon.BL.User.GetAll();
                return Ok(allUsers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving users.");
            }
        }

        [HttpGet("paginated")]
        public IActionResult GetUsersPaginated([FromQuery] string? searchTerm, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 50) pageSize = 10;

                var result = Horizon.BL.User.GetUsersPaginated(searchTerm, page, pageSize);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving users: {ex.Message}");
            }
        }

        [HttpGet("exists/{email}")]
        public IActionResult UserExists(string email)
        {
            try
            {
                bool exists = Horizon.BL.User.UserExists(email);
                return Ok(exists);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while checking if user exists.");
            }
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequestDto request)
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred during registration.");
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequestDto request)
        {
            try
            {
                User? loggedInUser = Horizon.BL.User.Login(request.Email, request.Password, out List<string> userTags);

                if (loggedInUser == null)
                {
                    return Unauthorized("Invalid email or password.");
                }

                if (loggedInUser.IsLocked)
                {
                    return StatusCode(403, "Your account is locked. Please contact support.");
                }

                BL.Statistics.IncrementUserLogin();

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
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred during login.");
            }
        }

        [HttpGet("profile/{id}")]
        public IActionResult GetProfile(int id)
        {
            try
            {
                var profileDto = Horizon.BL.User.GetUserProfile(id);
                if (profileDto == null) return NotFound();

                return Ok(profileDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving the user profile.");
            }
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

        [HttpPost("{userId}/toggle-block/{userToBlockId}")]
        public IActionResult ToggleBlock(int userId, int userToBlockId)
        {
            try
            {
                bool isNowBlocked = Horizon.BL.User.ToggleBlock(userId, userToBlockId);
                string message = isNowBlocked ? "User blocked successfully." : "User unblocked successfully.";
                return Ok(new { message = message, isBlocked = isNowBlocked });
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while changing the block status.");
            }
        }

        [HttpPut("{id}/toggle-status")]
        public IActionResult ToggleUserStatus(int id, [FromBody] ToggleStatusRequestDto request)
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while toggling user status.");
            }
        }
    }
}