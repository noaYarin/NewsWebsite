using Horizon.BL;

namespace Horizon.DTOs
{
    public class CreateReportRequestDto
    {
        public int ReporterUserId { get; set; }
        public int? CommentId { get; set; }
        public int? ArticleId { get; set; }
        public ReportReason Reason { get; set; }
        public string Details { get; set; } = "";
    }

    public class ReportResponseDto
    {
        public int Id { get; set; }
        public int ReporterUserId { get; set; }
        public int? ReportedCommentId { get; set; }
        public int? ReportedArticleId { get; set; }
        public ReportReason Reason { get; set; }
        public string Details { get; set; } = "";
        public ReportStatus Status { get; set; }
        public string AdminNotes { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateReportStatusDto
    {
        public ReportStatus NewStatus { get; set; }
        public string AdminNotes { get; set; } = "";
    }
}