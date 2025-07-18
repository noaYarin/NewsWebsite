using Horizon.BL;

namespace Horizon.DTOs
{
    public class CreateReportRequestDto
    {
        public int ReporterUserId { get; set; }
        public int? CommentId { get; set; }
        public int? ArticleId { get; set; }
        public ReportReason Reason { get; set; }
        public string Details { get; set; }
    }
}