using Horizon.BL;
using System.Data;
using System.Data.SqlClient;

namespace Horizon.DAL;

public class UserService : DBService
{
    public int InsertUserAndTags(User user, List<string> tagNames)
    {
        SqlConnection con = null;
        SqlTransaction transaction = null;
        try
        {
            con = Connect();
            transaction = con.BeginTransaction();

            var userParams = new Dictionary<string, object> {
                { "@Email", user.Email },
                { "@FirstName", user.FirstName },
                { "@LastName", user.LastName },
                { "@HashedPassword", user.HashedPassword },
                { "@BirthDate", user.BirthDate }
            };

            SqlCommand cmdUser = CreateCommand("SP_InsertUser", con, userParams);
            cmdUser.Transaction = transaction;
            SqlParameter newUserIdParam = new SqlParameter("@NewUserId", SqlDbType.Int) { Direction = ParameterDirection.Output };
            cmdUser.Parameters.Add(newUserIdParam);
            cmdUser.ExecuteNonQuery();
            int newUserId = (int)newUserIdParam.Value;

            foreach (var name in tagNames)
            {
                var tagParams = new Dictionary<string, object> {
                    { "@UserId", newUserId }, { "@TagName", name }
                };
                SqlCommand cmdTag = CreateCommand("SP_AddUserTag", con, tagParams);
                cmdTag.Transaction = transaction;
                cmdTag.ExecuteNonQuery();
            }

            transaction.Commit();
            return newUserId;
        }
        catch (Exception)
        {
            transaction?.Rollback();
            return -1;
        }
        finally { con?.Close(); }
    }

    public User? GetUserByEmail(string email, out List<string> userTags)
    {
        userTags = new List<string>();
        User? user = null;
        SqlConnection con = null;

        try
        {
            con = Connect();
            var userParams = new Dictionary<string, object> { { "@Email", email } };
            SqlCommand userCmd = CreateCommand("SP_GetUserByEmail", con, userParams);

            using (SqlDataReader reader = userCmd.ExecuteReader())
            {
                if (reader.Read())
                {
                    user = new User
                    {
                        Id = Convert.ToInt32(reader["Id"]),
                        Email = reader["Email"].ToString(),
                        FirstName = reader["FirstName"].ToString(),
                        LastName = reader["LastName"].ToString(),
                        HashedPassword = reader["HashedPassword"].ToString(),
                        BirthDate = reader["BirthDate"].ToString(),
                        ImgUrl = reader["ImgUrl"] == DBNull.Value ? null : reader["ImgUrl"].ToString(),
                        IsAdmin = Convert.ToBoolean(reader["IsAdmin"]),
                        IsLocked = Convert.ToBoolean(reader["IsLocked"])
                    };
                }
            }

            if (user != null && user.Id.HasValue)
            {
                var tagParams = new Dictionary<string, object> { { "@UserId", user.Id.Value } };
                SqlCommand tagCmd = CreateCommand("SP_GetUserTags", con, tagParams);
                using (SqlDataReader tagReader = tagCmd.ExecuteReader())
                {
                    while (tagReader.Read()) { userTags.Add(tagReader["Name"].ToString()); }
                }
            }
            return user;
        }
        finally { con?.Close(); }
    }
}