using Horizon.BL;
using Horizon.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Horizon.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticlesController : ControllerBase
{
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
    public IActionResult GetArticlesByCategory(string categoryName, [FromQuery] int count = 20)
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
}