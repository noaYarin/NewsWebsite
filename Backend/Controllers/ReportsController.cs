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
            var report = new Report
            {
                ReporterUserId = request.ReporterUserId,
                ReportedCommentId = request.CommentId,
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