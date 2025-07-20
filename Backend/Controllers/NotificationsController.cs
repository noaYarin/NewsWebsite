using Horizon.BL;
using Horizon.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Horizon.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        [HttpPost("share-article")]
        public IActionResult ShareArticle([FromBody] ShareArticleRequestDto request)
        {
            var success = Notification.ShareArticle(request);
            if (success)
            {
                return Ok(new { message = "Article shared successfully." });
            }
            return StatusCode(500, "Failed to share article.");
        }

        [HttpGet("{userId}")]
        public IActionResult GetNotifications(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var notifications = Notification.GetNotifications(userId, page, pageSize);
            return Ok(notifications);
        }

        [HttpGet("recent/{userId}")]
        public IActionResult GetRecentNotifications(int userId)
        {
            var notifications = Notification.GetRecentNotifications(userId);
            return Ok(notifications);
        }

        [HttpGet("unread-count/{userId}")]
        public IActionResult GetUnreadCount(int userId)
        {
            int count = Notification.GetUnreadCount(userId);
            return Ok(new { count });
        }

        [HttpPut("{notificationId}/read/{userId}")]
        public IActionResult MarkNotificationAsRead(int notificationId, int userId)
        {
            var success = Notification.MarkAsRead(notificationId, userId);
            if (success)
            {
                return Ok(new { message = "Notification marked as read." });
            }
            return NotFound("Notification not found or you do not have permission to update it.");
        }

        [HttpPut("read-all/{userId}")]
        public IActionResult MarkAllNotificationsAsRead(int userId)
        {
            int count = Notification.MarkAllAsRead(userId);
            return Ok(new { message = $"{count} notifications marked as read." });
        }
    }
}