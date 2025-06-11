using NewsSiteBackEnd.BL;
using System.Security.Cryptography;
using System.Text;

namespace NewsSiteBackEnd.User
{
	public class User
	{
		public int Id { get; set; }
		public string Email { get; set; }
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string BirthDate { get; set; }
		public string ImgUrl { get; set; }
		public bool MobileUrl { get; set; }
		public bool IsAdmin { get; set; }
		public string HashedPassword { get; set; }
		public List<User> BlockedUsers { get; set; }
		public List<Tag> Tags { get; set; }

		public User() { }
		
		public static int Register(User user)// change params to relvent parms
		{
			user.HashedPassword = HashPassword(user.HashedPassword);
			//pass it ot DB
		}

		public static string HashPassword(string password)// change params to relvent parms
		{
			using (SHA256 sha256 = SHA256.Create())
			{
				Byte[] inputBytes = Encoding.UTF8.GetBytes(password);
				Byte[] hashBytes = sha256.ComputeHash(inputBytes);

				string hashedPassword = Convert.ToBase64String(hashBytes);
				return hashedPassword;
			}

		}

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
		 
		public static int LogOut(User user)// change params to relvent parms
		{
			//TODO DB
		}


	}
}
