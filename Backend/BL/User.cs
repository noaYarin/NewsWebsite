using Horizon.DAL;

namespace Horizon.BL;

public class User
{
    public int? Id { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string BirthDate { get; set; }
    public string? ImgUrl { get; set; }
    public bool IsAdmin { get; set; }
    public bool IsLocked { get; set; }
    public string HashedPassword { get; set; }

    public bool Register(List<string> tagNames)
    {
        UserService userService = new UserService();
        TagService tagService = new TagService();

        if (!tagService.TagsExist(tagNames))
        {
            return false;
        }

        if (userService.GetUserByEmail(this.Email, out _) != null)
        {
            return false;
        }

        this.HashedPassword = BCrypt.Net.BCrypt.HashPassword(this.HashedPassword);
        int newId = userService.InsertUserAndTags(this, tagNames);
        return newId > 0;
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
}