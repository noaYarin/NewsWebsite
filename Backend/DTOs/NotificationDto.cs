namespace Horizon.DTOs
{
    public class ShareArticleRequestDto
    {
        public int SenderId { get; set; }
        public int RecipientId { get; set; }
        public int ArticleId { get; set; }
        public string? Message { get; set; }
    }

    public class NotificationDto
    {
        public int Id { get; set; }
        public string NotificationType { get; set; }
        public string? Message { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? SenderName { get; set; }
        public string? SenderAvatar { get; set; }
        public string? ArticleTitle { get; set; }
        public int? ArticleId { get; set; }
    }
}
