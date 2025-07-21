namespace Horizon.DTOs
{
    public class ArticleSyncDto
    {
        public string Url { get; set; }
        public string Title { get; set; }
        public string? ImageUrl { get; set; }
        public string? Description { get; set; }
        public string? Author { get; set; }
        public string? SourceName { get; set; }
        public DateTime? PublishedAt { get; set; }
        public string? Category { get; set; }
    }
}
