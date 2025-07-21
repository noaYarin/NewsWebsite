using System.Data.SqlClient;
using Horizon.BL;
using Horizon.DTOs;
using System.Collections.Generic;

namespace Horizon.DAL
{
    public class NotificationService : DBService
    {
        public bool InsertNotification(int recipientId, int senderId, NotificationType notificationType, int? relatedEntityId, string message)
        {
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>
                {
                    { "@RecipientId", recipientId },
                    { "@SenderId", senderId },
                    { "@NotificationType", notificationType.ToString() },
                    { "@RelatedEntityId", relatedEntityId },
                    { "@Message", message }
                };
                SqlCommand cmd = CreateCommand("SP_CreateNotification", con, parameters);
                return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
            }
            finally { con?.Close(); }
        }

        public List<NotificationDto> GetNotificationsForUser(int userId, int page, int pageSize)
        {
            var notifications = new List<NotificationDto>();
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>
                {
                    { "@UserId", userId },
                    { "@PageNumber", page },
                    { "@PageSize", pageSize }
                };
                SqlCommand cmd = CreateCommand("SP_GetNotifications", con, parameters);
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        notifications.Add(MapReaderToNotificationDto(reader));
                    }
                }
                return notifications;
            }
            finally { con?.Close(); }
        }

        public List<NotificationDto> GetRecentNotificationsForUser(int userId, int count)
        {
            var notifications = new List<NotificationDto>();
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>
                {
                    { "@UserId", userId },
                    { "@Count", count }
                };
                SqlCommand cmd = CreateCommand("SP_GetRecentNotifications", con, parameters);
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        notifications.Add(MapReaderToNotificationDto(reader));
                    }
                }
                return notifications;
            }
            finally { con?.Close(); }
        }

        public int GetUnreadCountForUser(int userId)
        {
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object> { { "@UserId", userId } };
                SqlCommand cmd = CreateCommand("SP_GetUnreadNotificationCount", con, parameters);
                return (int)cmd.ExecuteScalar();
            }
            finally { con?.Close(); }
        }

        public bool MarkAsRead(int notificationId, int userId)
        {
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>
                {
                    { "@NotificationId", notificationId },
                    { "@UserId", userId }
                };
                SqlCommand cmd = CreateCommand("SP_MarkNotificationAsRead", con, parameters);
                return (int)cmd.ExecuteScalar() > 0;
            }
            finally { con?.Close(); }
        }

        public int MarkAllAsRead(int userId)
        {
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object> { { "@UserId", userId } };
                SqlCommand cmd = CreateCommand("SP_MarkAllNotificationsAsRead", con, parameters);
                return (int)cmd.ExecuteScalar();
            }
            finally { con?.Close(); }
        }

        private NotificationDto MapReaderToNotificationDto(SqlDataReader reader)
        {
            return new NotificationDto
            {
                Id = Convert.ToInt32(reader["Id"]),
                NotificationType = reader["NotificationType"].ToString(),
                Message = reader["Message"] == DBNull.Value ? null : reader["Message"].ToString(),
                IsRead = Convert.ToBoolean(reader["IsRead"]),
                CreatedAt = Convert.ToDateTime(reader["CreatedAt"]),
                SenderName = reader["SenderName"] == DBNull.Value ? null : reader["SenderName"].ToString(),
                SenderAvatar = reader["SenderAvatar"] == DBNull.Value ? null : reader["SenderAvatar"].ToString(),
                ArticleTitle = reader["ArticleTitle"] == DBNull.Value ? null : reader["ArticleTitle"].ToString()
            };
        }
    }
}