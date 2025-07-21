using Horizon.BL;
using Horizon.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Horizon.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FriendsController : ControllerBase
    {
        [HttpPost("request")]
        public IActionResult SendFriendRequest([FromBody] FriendRequestDto request)
        {
            var success = Friendship.SendRequest(request.SenderId, request.RecipientId);
            if (success)
            {
                return Ok(new { message = "Friend request sent successfully." });
            }
            return BadRequest("Failed to send friend request. The request may already exist or you are already friends.");
        }

        [HttpPut("respond")]
        public IActionResult RespondToFriendRequest([FromBody] RespondToFriendRequestDto request)
        {
            var success = Friendship.RespondToRequest(request.RequesterId, request.ResponderId, request.Response);
            if (success)
            {
                return Ok(new { message = "Successfully responded to friend request." });
            }
            return BadRequest("Failed to respond to friend request. You may not be the recipient or the request does not exist.");
        }

        [HttpDelete("cancel")]
        public IActionResult CancelFriendRequest([FromBody] CancelFriendRequestDto request)
        {
            var success = Friendship.CancelRequest(request.SenderId, request.RecipientId);
            if (success)
            {
                return Ok(new { message = "Friend request canceled." });
            }
            return BadRequest("Failed to cancel friend request. You may not be the sender or the request does not exist.");
        }

        [HttpDelete("remove")]
        public IActionResult RemoveFriend([FromBody] RemoveFriendDto request)
        {
            var success = Friendship.RemoveFriend(request.UserId, request.FriendId);
            if (success)
            {
                return Ok(new { message = "Friend removed successfully." });
            }
            return BadRequest("Failed to remove friend. You may not be friends or the friendship does not exist.");
        }

        [HttpGet("{userId}")]
        public IActionResult GetFriends(int userId)
        {
            var friends = Friendship.GetFriends(userId);
            return Ok(friends);
        }

        [HttpGet("pending/{userId}")]
        public IActionResult GetPendingRequests(int userId)
        {
            var requests = Friendship.GetPendingRequests(userId);
            return Ok(requests);
        }

        [HttpGet("outgoing/{userId}")]
        public IActionResult GetOutgoingRequests(int userId)
        {
            var requests = Friendship.GetOutgoingRequests(userId);
            return Ok(requests);
        }
    }
}
