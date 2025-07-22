using Horizon.DAL;

namespace Horizon.BL;

public class ArticleSummarization
{
    public static async Task<string> SummarizeTextAsync(string text)
    {
        var summarizerService = new SummarizerService();
        return await summarizerService.SummarizeAsync(text);
    }

    public static async Task<string> SummarizeFromUrlAsync(string url)
    {
        var summarizerService = new SummarizerService();
        return await summarizerService.SummarizeFromUrlAsync(url);
    }

    public static async Task<string> SummarizeArticleAsync(int articleId)
    {
        var article = Article.GetById(articleId);
        if (article == null)
            throw new ArgumentException("Article not found");

        return await SummarizeFromUrlAsync(article.Url);
    }
}