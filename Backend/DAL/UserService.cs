using System.Data;
using System.Data.SqlClient;
using Horizon.BL;
using Horizon.DTOs;

namespace Horizon.DAL;

public class UserService : DBService
{
    static private User MapReaderToUser(SqlDataReader reader)
    {
        return new User
        {
            Id = Convert.ToInt32(reader["Id"]),
            Email = reader["Email"].ToString(),
            FirstName = reader["FirstName"].ToString(),
            LastName = reader["LastName"].ToString(),
            HashedPassword = reader["HashedPassword"].ToString(),
            BirthDate = reader["BirthDate"].ToString(),
            ImageUrl = reader["ImgUrl"] == DBNull.Value ? null : reader["ImgUrl"].ToString(),
            IsAdmin = Convert.ToBoolean(reader["IsAdmin"]),
            IsLocked = Convert.ToBoolean(reader["IsLocked"])
        };
    }

    static private UserSummaryDto MapReaderToUserSummary(SqlDataReader reader)
    {
        return new UserSummaryDto
        {
            Id = Convert.ToInt32(reader["Id"]),
            Email = reader["Email"].ToString(),
            FullName = $"{reader["FirstName"]} {reader["LastName"]}",
            ImageUrl = reader["ImgUrl"] == DBNull.Value ? null : reader["ImgUrl"].ToString(),
            IsAdmin = Convert.ToBoolean(reader["IsAdmin"]),
            IsLocked = Convert.ToBoolean(reader["IsLocked"])
        };
    }

    public List<UserSummaryDto> GetAllUsers()
    {
        var users = new List<UserSummaryDto>();
        SqlConnection con = null;
        try
        {
            con = Connect();
            SqlCommand cmd = CreateCommand("SP_GetAllUsers", con, new Dictionary<string, object>());
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    users.Add(MapReaderToUserSummary(reader));
                }
            }
            return users;
        }
        finally { con?.Close(); }
    }

    public List<UserSummaryDto> SearchUsersByEmail(string emailTerm)
    {
        var users = new List<UserSummaryDto>();
        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object> { { "@EmailTerm", emailTerm } };
            SqlCommand cmd = CreateCommand("SP_SearchUsersByEmail", con, parameters);
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    users.Add(MapReaderToUserSummary(reader));
                }
            }
            return users;
        }
        finally { con?.Close(); }
    }

    public PaginatedUsersResponseDto GetUsersPaginated(string? searchTerm, int page, int pageSize)
    {
        var result = new PaginatedUsersResponseDto
        {
            Users = new List<UserSummaryDto>(),
            Page = page,
            PageSize = pageSize
        };

        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object>
            {
                { "@SearchTerm", searchTerm ?? (object)DBNull.Value },
                { "@Page", page },
                { "@PageSize", pageSize }
            };

            SqlCommand cmd = CreateCommand("SP_GetUsersPaginated", con, parameters);
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    result.Users.Add(MapReaderToUserSummary(reader));
                }

                if (reader.NextResult() && reader.Read())
                {
                    result.TotalCount = Convert.ToInt32(reader["TotalCount"]);
                }
            }

            result.HasNextPage = (page * pageSize) < result.TotalCount;
            return result;
        }
        finally { con?.Close(); }
    }

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
                    { "@UserId", newUserId },
                    { "@TagName", name }
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
                    return MapReaderToUser(reader);
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
                    user = MapReaderToUser(reader);
                }
            }

            if (user != null && user.Id.HasValue)
            {
                var tagParams = new Dictionary<string, object> { { "@UserId", user.Id.Value } };
                SqlCommand tagCmd = CreateCommand("SP_GetUserTags", con, tagParams);
                using (SqlDataReader tagReader = tagCmd.ExecuteReader())
                {
                    while (tagReader.Read())
                    {
                        userTags.Add(tagReader["Name"].ToString());
                    }
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

    public User UpdateProfile(int userId, UpdateProfileRequestDto profileData)
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
            return GetUserById(userId);
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

    public bool ToggleBlockStatus(int userId, int blockedUserId)
    {
        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object>
        {
            { "@UserId", userId },
            { "@BlockedUserId", blockedUserId }
        };

            SqlCommand cmd = CreateCommand("SP_ToggleUserBlock", con, parameters);
            SqlParameter isBlockedParam = new SqlParameter("@IsBlocked", SqlDbType.Bit)
            {
                Direction = ParameterDirection.Output
            };
            cmd.Parameters.Add(isBlockedParam);

            cmd.ExecuteNonQuery();

            return Convert.ToBoolean(isBlockedParam.Value);
        }
        finally { con?.Close(); }
    }

    public void ToggleUserStatus(int userId, string attribute)
    {
        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object> {
                { "@UserId", userId },
                { "@Attribute", attribute }
            };
            SqlCommand cmd = CreateCommand("SP_ToggleUserStatus", con, parameters);
            cmd.ExecuteNonQuery();
        }
        finally { con?.Close(); }
    }
}