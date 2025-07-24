using System.Data.SqlClient;
using Horizon.BL;

namespace Horizon.DAL
{
    public class ReportService : DBService
    {
        public int InsertReport(Report report)
        {
            SqlConnection? con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>
                {
                    { "@ReporterUserId", report.ReporterUserId },
                    { "@ReportedCommentId", (object?)report.ReportedCommentId ?? DBNull.Value },
                    { "@ReportedArticleId", (object?)report.ReportedArticleId ?? DBNull.Value },
                    { "@Reason", report.Reason.ToString() },
                    { "@Details", report.Details ?? "" }
                };

                SqlCommand cmd = CreateCommand("SP_CreateReport", con, parameters);
                var newId = cmd.ExecuteScalar();
                return Convert.ToInt32(newId);
            }
            finally { con?.Close(); }
        }

        public List<Report> GetAllPendingReports()
        {
            SqlConnection? con = null;
            List<Report> reports = new List<Report>();
            try
            {
                con = Connect();
                SqlCommand cmd = CreateCommand("SP_GetAllReports", con, new Dictionary<string, object>());
                SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    var statusStr = reader["Status"]?.ToString() ?? "Pending";
                    if (statusStr == "Pending")
                    {
                        var report = new Report
                        {
                            Id = Convert.ToInt32(reader["Id"]),
                            ReporterUserId = Convert.ToInt32(reader["ReporterUserId"]),
                            ReportedArticleId = reader["ReportedArticleId"] == DBNull.Value ? null : Convert.ToInt32(reader["ReportedArticleId"]),
                            ReportedCommentId = reader["ReportedCommentId"] == DBNull.Value ? null : Convert.ToInt32(reader["ReportedCommentId"]),
                            Reason = Enum.Parse<ReportReason>(reader["Reason"]?.ToString() ?? "Other"),
                            Status = Enum.Parse<ReportStatus>(statusStr),
                            Details = reader["Details"]?.ToString() ?? "",
                            AdminNotes = reader["AdminNotes"]?.ToString() ?? ""
                        };
                        reports.Add(report);
                    }
                }
            }
            finally { con?.Close(); }
            return reports;
        }

        public bool UpdateReportStatus(int reportId, ReportStatus newStatus, string adminNotes = "")
        {
            SqlConnection? con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>
                {
                    { "@ReportId", reportId },
                    { "@NewStatus", newStatus.ToString() },
                    { "@AdminNotes", adminNotes ?? "" }
                };

                SqlCommand cmd = CreateCommand("SP_UpdateReportStatus", con, parameters);
                var rowsAffected = Convert.ToInt32(cmd.ExecuteScalar());
                return rowsAffected > 0;
            }
            finally { con?.Close(); }
        }
    }
}