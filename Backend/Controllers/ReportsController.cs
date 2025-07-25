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
            catch (System.Exception)
            {
                return StatusCode(500, "An error occurred while submitting the report.");
            }
        }

        [HttpGet("pending")]
        public IActionResult GetPendingReports()
        {
            try
            {
                var pendingReports = Report.GetAllPendingReports();
                var reportDtos = pendingReports.Select(r => new ReportResponseDto
                {
                    Id = r.Id,
                    ReporterUserId = r.ReporterUserId,
                    ReportedCommentId = r.ReportedCommentId,
                    ReportedArticleId = r.ReportedArticleId,
                    Reason = r.Reason,
                    Details = r.Details,
                    Status = r.Status,
                    AdminNotes = r.AdminNotes ?? "",
                    CreatedAt = r.CreatedAt
                }).ToList();

                return Ok(reportDtos);
            }
            catch (System.Exception)
            {
                return StatusCode(500, "An error occurred while retrieving pending reports.");
            }
        }

        [HttpGet]
        public IActionResult GetAllReports()
        {
            try
            {
                var allReports = Report.GetAllReports();
                var reportDtos = allReports.Select(r => new ReportResponseDto
                {
                    Id = r.Id,
                    ReporterUserId = r.ReporterUserId,
                    ReportedCommentId = r.ReportedCommentId,
                    ReportedArticleId = r.ReportedArticleId,
                    Reason = r.Reason,
                    Details = r.Details,
                    Status = r.Status,
                    AdminNotes = r.AdminNotes ?? "",
                    CreatedAt = r.CreatedAt
                }).ToList();

                return Ok(reportDtos);
            }
            catch (System.Exception)
            {
                return StatusCode(500, "An error occurred while retrieving reports.");
            }
        }

        [HttpPut("{reportId}/status")]
        public IActionResult UpdateReportStatus(int reportId, [FromBody] UpdateReportStatusDto request)
        {
            try
            {
                bool success = Report.UpdateReportStatus(reportId, request.NewStatus, request.AdminNotes);
                if (success)
                {
                    return Ok(new { message = "Report status updated successfully." });
                }
                return NotFound("Report not found or could not be updated.");
            }
            catch (System.Exception)
            {
                return StatusCode(500, "An error occurred while updating the report status.");
            }
        }
    }
}