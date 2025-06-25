using Horizon.BL;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Horizon.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        // GET: api/<UsersController>
        [HttpGet]
        public IEnumerable<User> Get()
        {
            User user = new User();
            return user.Read();
        }


        // register
        [HttpPost("register")]
        public bool Post([FromBody] User user)
        {
            return user.Register();
        }

        // login
        [HttpPost("logIn")]
        public User? Post([FromBody] JsonElement data)
        {
            string email = data.GetProperty("email").GetString();
            string password = data.GetProperty("hashedPassword").GetString();
            User user = new User();
            return user.LogIn(email,password);
        }

        // Add user tags
        [HttpPost("userTags")]
        public int InsertUserTags([FromBody] JsonElement data)
        {
            int userId = data.GetProperty("UserId").GetInt32();

            Tag tag = new Tag
            {
                Name = data.GetProperty("Name").GetString()
            };

            User user = new User();
            return user.AddUserTags(userId, tag);
        }

        //Add user articles

        [HttpPost("userArticles")]
        public int InsertUserSavedArticles([FromBody] JsonElement data)
        {
            int userId = data.GetProperty("UserId").GetInt32();

            Article article = new Article
            {
                UserId = userId,
                Title = data.GetProperty("Title").GetString(),
                Tags = new List<Tag>(),
                Comments = new List<Comment>(),
                Reports = new List<Report>()
            };

            User user = new User();
            return user.SavedUserArticles(userId, article);
        }

        // Add blocked user 
        [HttpPost("blockedUsers")]
        public int InsertBlockedUser([FromBody] JsonElement data)
        {
            int userId = data.GetProperty("UserId").GetInt32();

            User blockedUser = new User
            {

                Id = userId,
                Email = data.GetProperty("Email").GetString(),
                FirstName = data.GetProperty("FirstName").GetString(),
                LastName = data.GetProperty("LastName").GetString(),
                BirthDate = data.GetProperty("BirthDate").GetString(),
                ImgUrl = data.GetProperty("ImgUrl").GetString(),
                IsAdmin = data.GetProperty("IsAdmin").GetBoolean(),
                IsLocked = data.GetProperty("IsLocked").GetBoolean(),
                HashedPassword = data.GetProperty("HashedPassword").GetString(),
                Tags = new List<Tag>(),
                BlockedUsers = new List<User>(),
                SavedArticles = new List<Article>()
            };

            User user = new User();
            return user.AddBlockedUser(userId, blockedUser);
        }


        // GET api/<UsersController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // PUT api/<UsersController>/5
        [HttpPut("{id}")]
        public User Put(int userId, [FromBody] User updatedUser)
        {
            User user = new User();
            return user.UpdateUser(userId, updatedUser);
        }

        // DELETE api/<UsersController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

        // Delete saved Article
        [HttpDelete("{id}")]
        public int DeleteSavedArticle(JsonElement data)
        {
            int userId = data.GetProperty("UserId").GetInt32();
            int articleId = data.GetProperty("ArticleId").GetInt32();
            User user = new User();
            return user.DeleteSavedArticle(userId,articleId);
        }

        // Delete saved Article
        [HttpDelete("{id}")]
        public int DeleteUserTag(JsonElement data)
        {
            int userId = data.GetProperty("UserId").GetInt32();
            int tagId = data.GetProperty("TagId").GetInt32();
            User user = new User();
            return user.DeleteUserTag(userId, tagId);
        }


        // Delete blocked User
        [HttpDelete("{id}")]
        public int DeleteBlockedUser(JsonElement data)
        {
            int userId = data.GetProperty("UserId").GetInt32();
            int blockedUserId = data.GetProperty("TagId").GetInt32();
            User user = new User();
            return user.DeleteBlockedUser(userId, blockedUserId);
        }
    }
}
