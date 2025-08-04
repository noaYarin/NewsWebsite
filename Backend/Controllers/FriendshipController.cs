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
            try
            {
                var success = Friendship.SendRequest(request.SenderId, request.RecipientId);
                if (success)
                {
                    return Ok(new { message = "Friend request sent successfully." });
                }
                return BadRequest("Failed to send friend request. The request may already exist or you are already friends.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while sending the friend request.");
            }
        }

        [HttpPut("respond")]
        public IActionResult RespondToFriendRequest([FromBody] RespondToFriendRequestDto request)
        {
            try
            {
                var success = Friendship.RespondToRequest(request.RequesterId, request.ResponderId, request.Response);
                if (success)
                {
                    return Ok(new { message = "Successfully responded to friend request." });
                }
                return BadRequest("Failed to respond to friend request. You may not be the recipient or the request does not exist.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while responding to the friend request.");
            }
        }

        [HttpDelete("cancel")]
        public IActionResult CancelFriendRequest([FromBody] CancelFriendRequestDto request)
        {
            try
            {
                var success = Friendship.CancelRequest(request.SenderId, request.RecipientId);
                if (success)
                {
                    return Ok(new { message = "Friend request canceled." });
                }
                return BadRequest("Failed to cancel friend request. You may not be the sender or the request does not exist.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while canceling the friend request.");
            }
        }

        [HttpDelete("remove")]
        public IActionResult RemoveFriend([FromBody] RemoveFriendDto request)
        {
            try
            {
                var success = Friendship.RemoveFriend(request.UserId, request.FriendId);
                if (success)
                {
                    return Ok(new { message = "Friend removed successfully." });
                }
                return BadRequest("Failed to remove friend. You may not be friends or the friendship does not exist.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while removing the friend.");
            }
        }

        [HttpGet("{userId}")]
        public IActionResult GetFriends(int userId)
        {
            try
            {
                var friends = Friendship.GetFriends(userId);
                return Ok(friends);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving friends.");
            }
        }

        [HttpGet("pending/{userId}")]
        public IActionResult GetPendingRequests(int userId)
        {
            try
            {
                var requests = Friendship.GetPendingRequests(userId);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving pending requests.");
            }
        }

        [HttpGet("outgoing/{userId}")]
        public IActionResult GetOutgoingRequests(int userId)
        {
            try
            {
                var requests = Friendship.GetOutgoingRequests(userId);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving outgoing requests.");
            }
        }
    }
}
