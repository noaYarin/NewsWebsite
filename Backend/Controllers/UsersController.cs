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


        // POST- register
        [HttpPost("register")]
        public bool Post([FromBody] User user)
        {
            return user.Register();
        }

        // POST- login
        [HttpPost("logIn")]
        public User? Post([FromBody] JsonElement data)
        {
            string email = data.GetProperty("email").GetString();
            string password = data.GetProperty("hashedPassword").GetString();
            User user = new User();
            return user.LogIn(email,password);
        }

        // POST- Add user tags
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

        // GET api/<UsersController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // PUT api/<UsersController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<UsersController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
