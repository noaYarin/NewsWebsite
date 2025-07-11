using Horizon.BL;
using Horizon.DTOs;
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

    public User? GetUserById(int id)
    {
        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object> { { "@Id", id } };
            SqlCommand cmd = CreateCommand("SP_GetUserById", con, parameters);

            using (SqlDataReader reader = cmd.ExecuteReader())
            {
                if (reader.Read())
                {
                    return new User
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
            return null;
        }
        finally
        {
            con?.Close();
        }
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

    public List<string> GetUserTags(int userId)
    {
        var tags = new List<string>();
        SqlConnection con = null;

        try
        {
            con = Connect();
            var tagParams = new Dictionary<string, object> { { "@UserId", userId } };
            SqlCommand tagCmd = CreateCommand("SP_GetUserTags", con, tagParams);

            using (SqlDataReader tagReader = tagCmd.ExecuteReader())
            {
                while (tagReader.Read())
                {
                    tags.Add(tagReader["Name"].ToString());
                }
            }
            return tags;
        }
        catch (Exception ex)
        {
            throw;
        }
        finally
        {
            con?.Close();
        }
    }

    public void UpdateProfile(int userId, UpdateProfileRequestDto profileData)
    {
        SqlConnection con = null;
        SqlTransaction transaction = null;
        try
        {
            con = Connect();
            transaction = con.BeginTransaction();

            var detailsParams = new Dictionary<string, object>
        {
            { "@UserId", userId },
            { "@FirstName", profileData.FirstName },
            { "@LastName", profileData.LastName },
            { "@BirthDate", profileData.BirthDate },
            { "@ImageUrl", profileData.ImageUrl }
        };
            SqlCommand cmdDetails = CreateCommand("SP_UpdateUserDetails", con, detailsParams);
            cmdDetails.Transaction = transaction;
            cmdDetails.ExecuteNonQuery();

            if (!string.IsNullOrEmpty(profileData.NewPassword))
            {
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(profileData.NewPassword);
                var passwordParams = new Dictionary<string, object>
            {
                { "@UserId", userId }, { "@HashedPassword", hashedPassword }
            };
                SqlCommand cmdPass = CreateCommand("SP_UpdateUserPassword", con, passwordParams);
                cmdPass.Transaction = transaction;
                cmdPass.ExecuteNonQuery();
            }

            var deleteTagsParams = new Dictionary<string, object> { { "@UserId", userId } };
            SqlCommand cmdDeleteTags = CreateCommand("SP_DeleteUserTags", con, deleteTagsParams);
            cmdDeleteTags.Transaction = transaction;
            cmdDeleteTags.ExecuteNonQuery();

            foreach (var tagName in profileData.Interests)
            {
                var addTagParams = new Dictionary<string, object>
            {
                { "@UserId", userId }, { "@TagName", tagName }
            };
                SqlCommand cmdAddTag = CreateCommand("SP_AddUserTag", con, addTagParams);
                cmdAddTag.Transaction = transaction;
                cmdAddTag.ExecuteNonQuery();
            }

            transaction.Commit();
        }
        catch (Exception)
        {
            transaction?.Rollback();
            throw;
        }
        finally { con?.Close(); }
    }

    public List<BlockedUserDto> GetBlockedUsers(int userId)
    {
        var blockedUsers = new List<BlockedUserDto>();
        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object> { { "@UserId", userId } };
            SqlCommand cmd = CreateCommand("SP_GetBlockedUsers", con, parameters);
            using (SqlDataReader reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    blockedUsers.Add(new BlockedUserDto
                    {
                        Id = Convert.ToInt32(reader["Id"]),
                        Name = $"{reader["FirstName"]} {reader["LastName"]}",
                        Avatar = reader["ImgUrl"] == DBNull.Value ? null : reader["ImgUrl"].ToString()
                    });
                }
            }
            return blockedUsers;
        }
        finally { con?.Close(); }
    }

    public void UnblockUser(int userId, int blockedUserId)
    {
        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object> {
            { "@UserId", userId },
            { "@BlockedUserId", blockedUserId }
        };
            SqlCommand cmd = CreateCommand("SP_UnblockUser", con, parameters);
            cmd.ExecuteNonQuery();
        }
        finally { con?.Close(); }
    }
}