namespace Horizon.DTOs;

public class ArticleDataForCommentDto
{
    public string Url { get; set; }
    public string Title { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public string? Author { get; set; }
    public string? SourceName { get; set; }
    public DateTime? PublishedAt { get; set; }
}

public class AddCommentRequestDto
{
    public int ArticleId { get; set; }
    public string Content { get; set; }
    public int AuthorId { get; set; }
}

public class CommentResponseDto
{
    public int Id { get; set; }
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public int AuthorId { get; set; }
    public string AuthorName { get; set; }
    public string? AuthorAvatar { get; set; }
    public int LikeCount { get; set; }
    public bool IsLikedByCurrentUser { get; set; }
}

public class EditCommentRequestDto
{
    public int AuthorId { get; set; }
    public string Content { get; set; }
}