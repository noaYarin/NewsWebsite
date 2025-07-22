using System.Collections.Generic;
using Horizon.DAL;
using Horizon.DTOs;

namespace Horizon.BL
{
    public class Notification
    {
        public static bool ShareArticle(ShareArticleRequestDto request)
        {
            var notificationService = new NotificationService();
            //var friendshipService = new FriendshipService();
            //if (!friendshipService.AreFriends(request.SenderId, request.RecipientId)) return false;

            return notificationService.InsertNotification(request.RecipientId, request.SenderId, NotificationType.ArticleShare, request.ArticleId, request.Message);
        }

        public static List<NotificationDto> GetNotifications(int userId, int page, int pageSize)
        {
            var notificationService = new NotificationService();
            return notificationService.GetNotificationsForUser(userId, page, pageSize);
        }

        public static List<NotificationDto> GetRecentNotifications(int userId)
        {
            var notificationService = new NotificationService();
            return notificationService.GetRecentNotificationsForUser(userId, 5);
        }

        public static int GetUnreadCount(int userId)
        {
            var notificationService = new NotificationService();
            return notificationService.GetUnreadCountForUser(userId);
        }

        public static bool MarkAsRead(int notificationId, int userId)
        {
            var notificationService = new NotificationService();
            return notificationService.MarkAsRead(notificationId, userId);
        }

        public static int MarkAllAsRead(int userId)
        {
            var notificationService = new NotificationService();
            return notificationService.MarkAllAsRead(userId);
        }
    }
}