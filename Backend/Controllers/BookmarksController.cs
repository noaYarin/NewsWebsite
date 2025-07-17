using Horizon.BL;
using Horizon.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Horizon.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookmarksController : ControllerBase
    {
        [HttpPost("toggle")]
        public IActionResult ToggleBookmark([FromBody] BookmarkToggleRequest request)
        {
            try
            {
                var isBookmarked = Bookmark.Toggle(request.UserId, request.ArticleId);
                return Ok(new { isBookmarked });
            }
            catch (System.Exception)
            {
                return StatusCode(500, "An error occurred while toggling the bookmark.");
            }
        }

        [HttpGet("{userId}")]
        public IActionResult GetUserBookmarks(int userId)
        {
            try
            {
                var bookmarks = Bookmark.GetUserBookmarks(userId);
                return Ok(bookmarks);
            }
            catch (System.Exception)
            {
                return StatusCode(500, "An error occurred while fetching bookmarks.");
            }
        }

        [HttpGet("status")]
        public IActionResult GetBookmarkStatus([FromQuery] int userId, [FromQuery] int articleId)
        {
            try
            {
                var isBookmarked = Bookmark.IsArticleBookmarked(userId, articleId);
                return Ok(new { isBookmarked });
            }
            catch (System.Exception)
            {
                return StatusCode(500, "An error occurred while checking bookmark status.");
            }
        }
    }
}
