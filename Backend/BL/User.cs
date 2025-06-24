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
        public bool IsLocked { get; set; }
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
            if (!db.IsUserExists(this.Email,"",false))
            {
                this.HashedPassword = HashPassword(this.HashedPassword);
                db.InsertUser(this);
                return true;
            }
          
            return false;
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
      public User LogIn(string email, string password)
      {
            DBservices db = new DBservices();
            string hashedPassword = HashPassword(password);

            if (db.IsUserExists(email, hashedPassword, true))
            {
                return db.GetUserByEmail(email);
            }

            return null;
      }

        public int AddUserTags(int UserId, Tag tag)
        {
            DBservices db = new DBservices();
            return db.InsertUserTags(UserId, tag);
        }

        public int SavedUserArticles(int UserId, Article article)
        {
            DBservices db = new DBservices();
            return db.InsertUserSavedArticles(UserId, article);
        }


        public static int LogOut(User user)// change params to relvent parms
        {
            //TODO DB
            return 0;
        }
    }
}
