using System.Data.SqlClient;
using Horizon.BL;
using Horizon.DTOs;

namespace Horizon.DAL
{
    public class FriendshipService : DBService
    {
        public bool SendRequest(int senderId, int recipientId)
        {
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>
                {
                    { "@SenderId", senderId },
                    { "@RecipientId", recipientId }
                };
                SqlCommand cmd = CreateCommand("SP_SendFriendRequest", con, parameters);
                var result = cmd.ExecuteScalar();
                return result != null && !(result is string);
            }
            finally { con?.Close(); }
        }

        public bool RespondToRequest(int requesterId, int responderId, FriendshipStatus newStatus)
        {
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>
                {
                    { "@RequesterId", requesterId },
                    { "@ResponderId", responderId },
                    { "@NewStatus", newStatus.ToString() }
                };
                SqlCommand cmd = CreateCommand("SP_RespondToFriendRequest", con, parameters);
                int rowsAffected = (int)cmd.ExecuteScalar();
                return rowsAffected > 0;
            }
            finally { con?.Close(); }
        }

        public bool CancelRequest(int senderId, int recipientId)
        {
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>
                {
                    { "@SenderId", senderId },
                    { "@RecipientId", recipientId }
                };
                SqlCommand cmd = CreateCommand("SP_CancelFriendRequest", con, parameters);
                int rowsAffected = (int)cmd.ExecuteScalar();
                return rowsAffected > 0;
            }
            finally { con?.Close(); }
        }

        public bool RemoveFriend(int userId, int friendId)
        {
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>
                {
                    { "@UserId", userId },
                    { "@FriendId", friendId }
                };
                SqlCommand cmd = CreateCommand("SP_RemoveFriend", con, parameters);
                int rowsAffected = (int)cmd.ExecuteScalar();
                return rowsAffected > 0;
            }
            finally { con?.Close(); }
        }

        public List<FriendDto> GetFriends(int userId)
        {
            var friends = new List<FriendDto>();
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object> { { "@UserId", userId } };
                SqlCommand cmd = CreateCommand("SP_GetFriends", con, parameters);
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        friends.Add(new FriendDto
                        {
                            Id = Convert.ToInt32(reader["Id"]),
                            FullName = reader["FullName"].ToString(),
                            Avatar = reader["Avatar"] == DBNull.Value ? null : reader["Avatar"].ToString()
                        });
                    }
                }
                return friends;
            }
            finally { con?.Close(); }
        }

        public List<FriendDto> GetPendingRequests(int userId)
        {
            var requests = new List<FriendDto>();
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object> { { "@UserId", userId } };
                SqlCommand cmd = CreateCommand("SP_GetPendingFriendRequests", con, parameters);
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        requests.Add(new FriendDto
                        {
                            Id = Convert.ToInt32(reader["Id"]),
                            FullName = reader["FullName"].ToString(),
                            Avatar = reader["Avatar"] == DBNull.Value ? null : reader["Avatar"].ToString()
                        });
                    }
                }
                return requests;
            }
            finally { con?.Close(); }
        }
    }
}
