using Horizon.BL;
using Horizon.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Horizon.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    [HttpPost]
    public IActionResult AddComment([FromBody] AddCommentRequestDto request)
    {
        var comment = new Comment
        {
            ArticleId = request.ArticleId,
            Content = request.Content,
            AuthorId = request.AuthorId
        };

        try
        {
            bool success = comment.Add();
            if (success)
            {
                return Ok(new { message = "Comment added successfully." });
            }
            return StatusCode(500, "Failed to add comment.");
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, "An error occurred while adding the comment.");
        }
    }

    [HttpGet("{articleId}")]
    public IActionResult GetComments(int articleId)
    {
        try
        {
            var comments = Comment.GetByArticleId(articleId);
            return Ok(comments);
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, "Could not retrieve comments.");
        }
    }

    [HttpPut("{id}")]
    public IActionResult EditComment(int id, [FromBody] EditCommentRequestDto request)
    {
        try
        {
            bool success = Comment.Update(id, request.AuthorId, request.Content);

            if (success)
            {
                return Ok(new { message = "Comment updated successfully." });
            }
            return Forbid("You are not authorized to edit this comment, or the comment does not exist.");
        }
        catch (System.Exception)
        {
            return StatusCode(500, "An error occurred while updating the comment.");
        }
    }

    [HttpDelete("{id}/{requestingUserId}")]
    public IActionResult DeleteComment(int id, int requestingUserId)
    {
        try
        {
            bool success = Comment.Delete(id, requestingUserId);

            if (success)
            {
                return Ok(new { message = "Comment deleted successfully." });
            }
            return Forbid("You are not authorized to delete this comment, or the comment does not exist.");
        }
        catch (System.Exception)
        {
            return StatusCode(500, "An error occurred while deleting the comment.");
        }
    }
}