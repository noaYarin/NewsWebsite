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
        public string Details { get; set; }
        public ReportStatus Status { get; set; }

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
    }
}