using Horizon.BL;
using Microsoft.AspNetCore.Mvc;

namespace Horizon.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
        [HttpGet("daily")]
        public IActionResult GetDailyStatistics([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var stats = BL.Statistics.GetDailyStatistics(startDate, endDate);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving daily statistics.");
            }
        }

        [HttpGet("general")]
        public IActionResult GetGeneralStatistics()
        {
            try
            {
                var stats = BL.Statistics.GetGeneralStatistics();
                if (stats == null)
                {
                    return NotFound();
                }
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving general statistics.");
            }
        }

        [HttpGet("daily/logins")]
        public IActionResult GetDailyLogins([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var stats = BL.Statistics.GetDailyLogins(startDate, endDate);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving daily login statistics.");
            }
        }

        [HttpGet("daily/article-pulls")]
        public IActionResult GetDailyArticlePulls([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var stats = BL.Statistics.GetDailyArticlePulls(startDate, endDate);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving daily article pull statistics.");
            }
        }

        [HttpGet("daily/article-inserts")]
        public IActionResult GetDailyArticleInserts([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var stats = BL.Statistics.GetDailyArticleInserts(startDate, endDate);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving daily article insert statistics.");
            }
        }
    }
}
