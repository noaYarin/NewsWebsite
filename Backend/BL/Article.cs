using System.Collections.Generic;
using System.Linq;
using Horizon.DAL;
using Horizon.DTOs;

namespace Horizon.BL;

public class Article
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Url { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public string? Author { get; set; }
    public string? SourceName { get; set; }
    public DateTime? PublishedAt { get; set; }
    public string? Category { get; set; }

    public Article() { }

    public Article(int id, string title, string url, string? imageUrl, string? description,
                   string? author, string? sourceName, DateTime? publishedAt, string? category)
    {
        Id = id;
        Title = title;
        Url = url;
        ImageUrl = imageUrl;
        Description = description;
        Author = author;
        SourceName = sourceName;
        PublishedAt = publishedAt;
        Category = category;
    }

    public static Article GetById(int id)
    {
        var articleService = new ArticleService();
        return articleService.GetArticleById(id);
    }

    public static List<Article> Sync(List<ArticleSyncDto> articlesFromAPI)
    {
        var articleService = new ArticleService();
        var urls = articlesFromAPI.Select(a => a.Url).ToList();

        var existingArticles = articleService.GetArticlesByUrls(urls);
        var existingUrls = existingArticles.Select(a => a.Url).ToHashSet();

        var newArticleDtos = articlesFromAPI.Where(a => !existingUrls.Contains(a.Url)).ToList();

        if (newArticleDtos.Any())
        {
            articleService.BulkInsert(newArticleDtos);
            return articleService.GetArticlesByUrls(urls);
        }

        return existingArticles;
    }

    public static List<Article> GetRecentByCategory(string categoryName, int count)
    {
        var articleService = new ArticleService();
        return articleService.FetchRecentByCategory(categoryName, count);
    }

    public static List<Article> GetRecentByCategoryPaged(string categoryName, int page, int pageSize)
    {
        var articleService = new ArticleService();
        return articleService.FetchRecentByCategoryPaged(categoryName, page, pageSize);
    }
}