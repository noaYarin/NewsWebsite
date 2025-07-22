using Horizon.BL;
using Horizon.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Horizon.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticlesController : ControllerBase
{
    public ArticlesController()
    {
    }

    [HttpGet("search")]
    public IActionResult SearchArticles([FromQuery] string term, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (string.IsNullOrWhiteSpace(term))
        {
            return BadRequest("Search term cannot be empty.");
        }
        try
        {
            var articles = Article.Search(term, page, pageSize);
            return Ok(articles);
        }
        catch (System.Exception)
        {
            return StatusCode(500, "An error occurred while searching articles.");
        }
    }


    [HttpGet("{id}")]
    public IActionResult GetArticle(int id)
    {
        try
        {
            var article = Article.GetById(id);

            if (article == null)
            {
                return NotFound(new { message = "Article not found." });
            }
            return Ok(article);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An error occurred while retrieving the article.");
        }
    }

    [HttpPost("sync")]
    public IActionResult SyncArticles([FromBody] List<ArticleSyncDto> articlesFromApi)
    {
        if (articlesFromApi == null || !articlesFromApi.Any())
        {
            return Ok(new List<Article>());
        }

        try
        {
            var syncedArticles = Article.Sync(articlesFromApi);
            return Ok(syncedArticles);
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, "An error occurred while synchronizing articles.");
        }
    }

    [HttpGet("category/{categoryName}")]
    public IActionResult GetArticlesByCategory(string categoryName, [FromQuery] int count = 10)
    {
        try
        {
            var articles = Article.GetRecentByCategory(categoryName, count);
            return Ok(articles);
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, "Could not retrieve articles.");
        }
    }

    [HttpGet("category/{categoryName}/paged")]
    public IActionResult GetArticlesByCategoryPaged(string categoryName, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var pagedArticles = Article.GetRecentByCategoryPaged(categoryName, page, pageSize);
            return Ok(pagedArticles);
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, "Could not retrieve paged articles.");
        }
    }
    [HttpPost("summarize")]
    public async Task<IActionResult> SummarizeArticle([FromBody] SummarizeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ArticleUrl))
            return BadRequest("No text provided.");

        try
        {
            var summary = await ArticleSummarization.SummarizeTextAsync(request.ArticleUrl);
            return Ok(new { summary });
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while summarizing the article.");
        }
    }

}