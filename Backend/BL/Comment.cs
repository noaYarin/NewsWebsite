namespace Horizon.BL
{
    public class Comment
    {
        public int Id { get; set; }
        public int ArticleId { get; set; }
        public int UserId { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; } //need to add update func dont we ?
        public List<Report> Reports { get; set; }

        public Comment(int id, int articleId, int userId, string content, DateTime createdAt, DateTime updatedAt, List<Report> reports)
        {
            Id = id;
            ArticleId = articleId;
            UserId = userId;
            Content = content;
            CreatedAt = createdAt;
            UpdatedAt = updatedAt;
            Reports = reports;
        }

        public Comment() { }
    }
}
