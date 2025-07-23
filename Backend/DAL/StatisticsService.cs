using System.Data;
using System.Data.SqlClient;
using Horizon.DTOs;

namespace Horizon.DAL
{
    public class StatisticsService : DBService
    {
        public void IncrementDailyStat(string statName)
        {
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>
                {
                    { "@StatName", statName }
                };
                SqlCommand cmd = CreateCommand("SP_IncrementDailyStat", con, parameters);
                cmd.ExecuteNonQuery();
            }
            finally
            {
                con?.Close();
            }
        }

        public IEnumerable<DailyStatisticsDto> GetDailyStatistics(DateTime startDate, DateTime endDate)
        {
            var stats = new List<DailyStatisticsDto>();
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>
                {
                    { "@StartDate", startDate },
                    { "@EndDate", endDate }
                };
                SqlCommand cmd = CreateCommand("SP_GetDailyStatistics", con, parameters);
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        stats.Add(new DailyStatisticsDto
                        {
                            StatDate = Convert.ToDateTime(reader["StatDate"]),
                            UserLoginCount = Convert.ToInt32(reader["UserLoginCount"]),
                            ArticlesPulledCount = Convert.ToInt32(reader["ArticlesPulledCount"]),
                            ArticlesInsertedCount = Convert.ToInt32(reader["ArticlesInsertedCount"]),
                            CommentsPostedCount = Convert.ToInt32(reader["CommentsPostedCount"])
                        });
                    }
                }
                return stats;
            }
            finally
            {
                con?.Close();
            }
        }

        public GeneralStatisticsDto GetGeneralStatistics()
        {
            GeneralStatisticsDto stats = null;
            SqlConnection con = null;
            try
            {
                con = Connect();
                SqlCommand cmd = CreateCommand("SP_GetGeneralStatistics", con, null);
                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        stats = new GeneralStatisticsDto
                        {
                            TotalUsers = Convert.ToInt32(reader["TotalUsers"]),
                            TotalArticles = Convert.ToInt32(reader["TotalArticles"]),
                            TotalComments = Convert.ToInt32(reader["TotalComments"])
                        };
                    }
                }
                return stats;
            }
            finally
            {
                con?.Close();
            }
        }
    }
}

