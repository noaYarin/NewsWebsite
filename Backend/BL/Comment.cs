namespace Horizon.BL;

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
}