using System.Security.Cryptography;
using System.Text;

namespace Horizon.BL
{
    public class User
    {
        public int ?Id { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string BirthDate { get; set; }
        public string ImgUrl { get; set; }
        public bool IsAdmin { get; set; }
        public string HashedPassword { get; set; }
        public List<User> ?BlockedUsers { get; set; }
        public List<Tag> ?Tags { get; set; }
        public List<Article> ?SavedArticles { get; set; }

        public User() { }

        public List<User> Read()
        {
            DBservices db = new DBservices();
            return db.GetAllUsers();
        }
      
       public bool Register()
       {
            DBservices db = new DBservices();
            if (db.IsEmailExists(this.Email))
            {
                return false;
            }
            this.HashedPassword = HashPassword(this.HashedPassword);
            db.InsertUser(this);
            return true;
        }


        public static string HashPassword(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                Byte[] inputBytes = Encoding.UTF8.GetBytes(password);
                Byte[] hashBytes = sha256.ComputeHash(inputBytes);

                string hashedPassword = Convert.ToBase64String(hashBytes);
                return hashedPassword;
            }

        }
        /*
      public static int LogIn(string email, string password)// change params to relvent parms
      {

          //bring data from db and than check for each user if it is his email and password

          if (email == user.Email && HashPassword(password) == user.Password)
          {
              //continue and return  
              return 1;
          }

          return 0; // if user nor found
      }
     */
        public static int LogOut(User user)// change params to relvent parms
        {
            //TODO DB
            return 0;
        }
    }
}
