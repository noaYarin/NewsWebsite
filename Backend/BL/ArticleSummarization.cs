using Horizon.DAL;

namespace Horizon.BL;

public class ArticleSummarization
{
    public static async Task<string> SummarizeTextAsync(string text)
    {
        var summarizerService = new SummarizerService();
        return await summarizerService.SummarizeAsync(text);
    }

    // Not used in the current context, but can be useful for future implementations
    public static async Task<string> SummarizeArticleAsync(int articleId)
    {
        var article = Article.GetById(articleId);
        if (article == null)
            throw new ArgumentException("Article not found");

        return await SummarizeFromUrlAsync(article.Url);
    }

    public static async Task<string> SummarizeFromUrlAsync(string url)
    {
        var summarizerService = new SummarizerService();
        return await summarizerService.SummarizeFromUrlAsync(url);
    }
}