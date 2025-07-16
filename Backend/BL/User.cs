using System.Collections.Generic;
using BCrypt.Net;
using Horizon.DAL;
using Horizon.DTOs;

namespace Horizon.BL;

public class User
{
    public int? Id { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string BirthDate { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsAdmin { get; set; }
    public bool IsLocked { get; set; }
    public string HashedPassword { get; set; }

    public User() { }

    public User(int? id, string email, string firstName, string lastName, string birthDate,
                string? imageUrl, bool isAdmin, bool isLocked, string hashedPassword)
    {
        Id = id;
        Email = email;
        FirstName = firstName;
        LastName = lastName;
        BirthDate = birthDate;
        ImageUrl = imageUrl;
        IsAdmin = isAdmin;
        IsLocked = isLocked;
        HashedPassword = hashedPassword;
    }

    public string Register(string plainTextPassword, List<string> tagNames)
    {
        UserService userService = new();
        TagService tagService = new();

        if (userService.GetUserByEmail(this.Email, out _) != null)
        {
            return "USER_EXISTS";
        }

        if (!tagService.TagsExist(tagNames))
        {
            return "INVALID_TAGS";
        }

        this.HashedPassword = BCrypt.Net.BCrypt.HashPassword(plainTextPassword);
        int newId = userService.InsertUserAndTags(this, tagNames);
        return newId > 0 ? "SUCCESS" : "GENERIC_FAILURE";
    }

    public static User? Login(string email, string password, out List<string> tags)
    {
        UserService userService = new UserService();
        User? userFromDb = userService.GetUserByEmail(email, out tags);

        if (userFromDb != null && BCrypt.Net.BCrypt.Verify(password, userFromDb.HashedPassword))
        {
            return userFromDb;
        }

        tags = new List<string>();
        return null;
    }

    public static bool UserExists(string email)
    {
        var userService = new UserService();
        return userService.GetUserByEmail(email, out _) != null;
    }

    public static UserProfileResponseDto? GetUserProfile(int id)
    {
        var userService = new UserService();
        var user = userService.GetUserById(id);
        if (user == null) return null;

        var interests = userService.GetUserTags(id);
        var blockedUsers = userService.GetBlockedUsers(id);

        return new UserProfileResponseDto
        {
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            BirthDate = user.BirthDate,
            ImageUrl = user.ImageUrl,
            Interests = interests,
            BlockedUsers = blockedUsers,
            IsAdmin = user.IsAdmin,
            IsLocked = user.IsLocked
        };
    }

    public static UserResponseDto? UpdateUserProfile(int id, UpdateProfileRequestDto request)
    {
        var userService = new UserService();
        User updatedUser = userService.UpdateProfile(id, request);
        if (updatedUser == null) return null;

        var interests = userService.GetUserTags(id);
        return new UserResponseDto
        {
            Id = updatedUser.Id.Value,
            Email = updatedUser.Email,
            FirstName = updatedUser.FirstName,
            LastName = updatedUser.LastName,
            ImageUrl = updatedUser.ImageUrl,
            Interests = interests,
            IsAdmin = updatedUser.IsAdmin,
            IsLocked = updatedUser.IsLocked
        };
    }

    public static bool ToggleUserStatus(int userId, string attribute)
    {
        var userService = new UserService();
        var user = userService.GetUserById(userId);
        if (user == null)
        {
            return false;
        }

        userService.ToggleUserStatus(userId, attribute);
        return true;
    }

    public static void UnblockUser(int userId, int blockedUserId)
    {
        var userService = new UserService();
        userService.UnblockUser(userId, blockedUserId);
    }
}