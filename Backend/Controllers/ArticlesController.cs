using Horizon.BL;
using Horizon.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Horizon.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticlesController : ControllerBase
{
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
    public IActionResult GetArticlesByCategory(string categoryName)
    {
        try
        {
            var articles = Article.GetRecentByCategory(categoryName);
            return Ok(articles);
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, "Could not retrieve articles.");
        }
    }
}