using Horizon.BL;
using Horizon.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Horizon.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        [HttpPost]
        public IActionResult CreateReport([FromBody] CreateReportRequestDto request)
        {
            if (!request.CommentId.HasValue && !request.ArticleId.HasValue)
            {
                return BadRequest("Either CommentId or ArticleId must be provided.");
            }
            if (request.CommentId.HasValue && request.ArticleId.HasValue)
            {
                return BadRequest("A report can be for a comment or an article, not both.");
            }

            var report = new Report
            {
                ReporterUserId = request.ReporterUserId,
                ReportedCommentId = request.CommentId,
                ReportedArticleId = request.ArticleId,
                Reason = request.Reason,
                Details = request.Details
            };

            try
            {
                if (report.Create())
                {
                    return StatusCode(201, new { message = "Report submitted successfully." });
                }
                return StatusCode(500, "Failed to submit report.");
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, "An error occurred while submitting the report.");
            }
        }
    }
}