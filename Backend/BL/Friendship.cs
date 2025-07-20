using Horizon.DAL;
using Horizon.DTOs;
using System.Collections.Generic;

namespace Horizon.BL
{
    public class Friendship
    {
        public static bool SendRequest(int senderId, int recipientId)
        {
            var friendshipService = new FriendshipService();
            var notificationService = new NotificationService();

            if (friendshipService.SendRequest(senderId, recipientId))
            {
                notificationService.InsertNotification(recipientId, senderId, NotificationType.FriendRequest, null, null);
                return true;
            }
            return false;
        }

        public static bool RespondToRequest(int requesterId, int responderId, FriendshipStatus response)
        {
            var friendshipService = new FriendshipService();
            var notificationService = new NotificationService();

            if (friendshipService.RespondToRequest(requesterId, responderId, response))
            {
                if (response == FriendshipStatus.Accepted)
                {
                    notificationService.InsertNotification(requesterId, responderId, NotificationType.FriendRequestAccepted, null, null);
                }
                return true;
            }
            return false;
        }

        public static bool CancelRequest(int senderId, int recipientId)
        {
            var friendshipService = new FriendshipService();
            return friendshipService.CancelRequest(senderId, recipientId);
        }


        public static List<FriendDto> GetFriends(int userId)
        {
            var friendshipService = new FriendshipService();
            return friendshipService.GetFriends(userId);
        }

        public static List<FriendDto> GetPendingRequests(int userId)
        {
            var friendshipService = new FriendshipService();
            return friendshipService.GetPendingRequests(userId);
        }
    }
}
