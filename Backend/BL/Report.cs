using Horizon.DAL;

namespace Horizon.BL
{
    public class Report
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

        public Report() { }

        public Report(int id, int reporterUserId, int? reportedCommentId, int? reportedArticleId, ReportReason reason,
                      string details, ReportStatus status, string adminNotes, DateTime createdAt)
        {
            Id = id;
            ReporterUserId = reporterUserId;
            ReportedCommentId = reportedCommentId;
            ReportedArticleId = reportedArticleId;
            Reason = reason;
            Details = details;
            Status = status;
            AdminNotes = adminNotes;
            CreatedAt = createdAt;
        }

        public bool Create()
        {
            var reportService = new ReportService();
            int newId = reportService.InsertReport(this);
            if (newId > 0)
            {
                this.Id = newId;
                return true;
            }
            return false;
        }

        public static List<Report> GetAllPendingReports()
        {
            var reportService = new ReportService();
            return reportService.GetAllPendingReports();
        }

        public static List<Report> GetAllReports()
        {
            var reportService = new ReportService();
            return reportService.GetAllReports();
        }

        public bool UpdateStatus(ReportStatus newStatus, string adminNotes = "")
        {
            var reportService = new ReportService();
            bool success = reportService.UpdateReportStatus(this.Id, newStatus, adminNotes);
            if (success)
            {
                this.Status = newStatus;
                this.AdminNotes = adminNotes;
            }
            return success;
        }

        public static bool UpdateReportStatus(int reportId, ReportStatus newStatus, string adminNotes = "")
        {
            var reportService = new ReportService();
            return reportService.UpdateReportStatus(reportId, newStatus, adminNotes);
        }
    }
}