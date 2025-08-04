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
            try
            {
                var success = Notification.ShareArticle(request);
                if (success)
                {
                    return Ok(new { message = "Article shared successfully." });
                }
                return StatusCode(500, "Failed to share article.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while sharing the article.");
            }
        }

        [HttpGet("{userId}")]
        public IActionResult GetNotifications(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var notifications = Notification.GetNotifications(userId, page, pageSize);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving notifications.");
            }
        }

        [HttpGet("recent/{userId}")]
        public IActionResult GetRecentNotifications(int userId)
        {
            try
            {
                var notifications = Notification.GetRecentNotifications(userId);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving recent notifications.");
            }
        }

        [HttpGet("unread-count/{userId}")]
        public IActionResult GetUnreadCount(int userId)
        {
            try
            {
                int count = Notification.GetUnreadCount(userId);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving unread count.");
            }
        }

        [HttpPut("{notificationId}/read/{userId}")]
        public IActionResult MarkNotificationAsRead(int notificationId, int userId)
        {
            try
            {
                var success = Notification.MarkAsRead(notificationId, userId);
                if (success)
                {
                    return Ok(new { message = "Notification marked as read." });
                }
                return NotFound("Notification not found or you do not have permission to update it.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while marking notification as read.");
            }
        }

        [HttpPut("read-all/{userId}")]
        public IActionResult MarkAllNotificationsAsRead(int userId)
        {
            try
            {
                int count = Notification.MarkAllAsRead(userId);
                return Ok(new { message = $"{count} notifications marked as read." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while marking all notifications as read.");
            }
        }
    }
}