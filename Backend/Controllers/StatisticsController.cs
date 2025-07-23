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
            var stats = BL.Statistics.GetDailyStatistics(startDate, endDate);
            return Ok(stats);
        }

        [HttpGet("general")]
        public IActionResult GetGeneralStatistics()
        {
            var stats = BL.Statistics.GetGeneralStatistics();
            if (stats == null)
            {
                return NotFound();
            }
            return Ok(stats);
        }

        [HttpGet("daily/logins")]
        public IActionResult GetDailyLogins([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            var stats = BL.Statistics.GetDailyLogins(startDate, endDate);
            return Ok(stats);
        }

        [HttpGet("daily/article-pulls")]
        public IActionResult GetDailyArticlePulls([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            var stats = BL.Statistics.GetDailyArticlePulls(startDate, endDate);
            return Ok(stats);
        }

        [HttpGet("daily/article-inserts")]
        public IActionResult GetDailyArticleInserts([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            var stats = BL.Statistics.GetDailyArticleInserts(startDate, endDate);
            return Ok(stats);
        }
    }
}
