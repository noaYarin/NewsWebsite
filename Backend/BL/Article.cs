namespace Horizon.BL;

public class Article
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Url { get; set; }
    public string? ImageUrl { get; set; }

    public Article() { }

    public Article(int id, string title, string url, string? imageUrl)
    {
        Id = id;
        Title = title;
        Url = url;
        ImageUrl = imageUrl;
    }
}