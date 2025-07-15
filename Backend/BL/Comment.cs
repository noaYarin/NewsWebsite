namespace Horizon.BL;

using Horizon.DAL;
using Horizon.DTOs;

public class Comment
{
    public int Id { get; set; }
    public string Content { get; set; }
    public int AuthorId { get; set; }
    public int ArticleId { get; set; }

    public Comment() { }

    public Comment(int id, string content, int authorId, int articleId)
    {
        Id = id;
        Content = content;
        AuthorId = authorId;
        ArticleId = articleId;
    }

    public bool Add()
    {
        var commentService = new CommentService();
        int newCommentId = commentService.AddComment(this);
        return newCommentId > 0;
    }

    public static List<CommentResponseDto> GetByArticleId(int articleId)
    {
        var commentService = new CommentService();
        return commentService.GetCommentsByArticleId(articleId);
    }

    public static bool Update(int commentId, int requestingUserId, string content)
    {
        var commentService = new CommentService();
        return commentService.UpdateComment(commentId, requestingUserId, content);
    }

    public static bool Delete(int commentId, int requestingUserId)
    {
        var commentService = new CommentService();
        return commentService.DeleteComment(commentId, requestingUserId);
    }
}