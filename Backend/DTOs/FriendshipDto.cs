using Horizon.BL;

namespace Horizon.DTOs
{
    public class FriendRequestDto
    {
        public int SenderId { get; set; }
        public int RecipientId { get; set; }
    }

    public class CancelFriendRequestDto
    {
        public int SenderId { get; set; }
        public int RecipientId { get; set; }
    }

    public class RespondToFriendRequestDto
    {
        public int RequesterId { get; set; }
        public int ResponderId { get; set; }
        public FriendshipStatus Response { get; set; }
    }

    public class FriendDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string? Avatar { get; set; }
    }
}
