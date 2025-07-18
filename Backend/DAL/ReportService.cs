using System.Data.SqlClient;
using Horizon.BL;

namespace Horizon.DAL
{
    public class ReportService : DBService
    {
        public int InsertReport(Report report)
        {
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>
                {
                    { "@ReporterUserId", report.ReporterUserId },
                    { "@ReportedCommentId", report.ReportedCommentId },
                    { "@ReportedArticleId", report.ReportedArticleId },
                    { "@Reason", report.Reason.ToString() },
                    { "@Details", report.Details }
                };

                SqlCommand cmd = CreateCommand("SP_CreateReport", con, parameters);
                var newId = cmd.ExecuteScalar();
                return Convert.ToInt32(newId);
            }
            finally { con?.Close(); }
        }
    }
}