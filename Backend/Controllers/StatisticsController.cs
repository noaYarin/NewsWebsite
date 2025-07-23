using Horizon.BL;
using Microsoft.AspNetCore.Mvc;

namespace Horizon.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
        [HttpGet("daily")]
        public IActionResult GetDailyStatistics([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
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
    }
}
