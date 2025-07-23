using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using Horizon.BL;
using Horizon.DTOs;

namespace Horizon.DAL
{
    public class NotificationService : DBService
    {
        public bool InsertNotification(int recipientId, int senderId, NotificationType notificationType, int? relatedEntityId, string message)
        {
            if (string.IsNullOrEmpty(message))
            {
                message = GetDefaultMessage(notificationType);
            }

            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>
                {
                    { "@RecipientId", recipientId },
                    { "@SenderId", senderId },
                    { "@NotificationType", notificationType.ToString() },
                    { "@RelatedEntityId", relatedEntityId ?? (object)DBNull.Value },
                    { "@Message", message ?? (object)DBNull.Value }
                };
                SqlCommand cmd = CreateCommand("SP_CreateNotification", con, parameters);
                return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
            }
            finally { con?.Close(); }
        }

        private string GetDefaultMessage(NotificationType notificationType)
        {
            return notificationType switch
            {
                NotificationType.FriendRequest => "sent you a friend request.",
                NotificationType.FriendRequestAccepted => "has accepted your friend request.",
                NotificationType.CommentLike => "has liked your comment.",
                NotificationType.ArticleShare => "shared an article with you.",
                _ => "sent you a system notification."
            };
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

        public bool DeleteNotification(int recipientId, int senderId, NotificationType notificationType, int? relatedEntityId)
        {
            string query = @"
                DELETE FROM Notifications 
                WHERE RecipientId = @RecipientId 
                  AND SenderId = @SenderId 
                  AND NotificationType = @NotificationType 
                  AND RelatedEntityId = @RelatedEntityId";

            SqlConnection con = null;
            try
            {
                con = Connect();
                using (SqlCommand command = new SqlCommand(query, con))
                {
                    command.Parameters.AddWithValue("@RecipientId", recipientId);
                    command.Parameters.AddWithValue("@SenderId", senderId);
                    command.Parameters.AddWithValue("@NotificationType", notificationType.ToString());
                    command.Parameters.AddWithValue("@RelatedEntityId", relatedEntityId ?? (object)DBNull.Value);

                    int rowsAffected = command.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
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
                ArticleTitle = reader["ArticleTitle"] == DBNull.Value ? null : reader["ArticleTitle"].ToString(),
                ArticleId = reader["ArticleId"] == DBNull.Value ? null : Convert.ToInt32(reader["ArticleId"])
            };
        }
    }
}