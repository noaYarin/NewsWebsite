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

        public IEnumerable<DailyStatisticsDto> GetDailyStatistics(DateTime? startDate = null, DateTime? endDate = null)
        {
            var stats = new List<DailyStatisticsDto>();
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>();
                if (startDate.HasValue)
                    parameters.Add("@StartDate", startDate.Value);
                if (endDate.HasValue)
                    parameters.Add("@EndDate", endDate.Value);

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

        public IEnumerable<DailyStatisticsDto> GetDailyLogins(DateTime? startDate = null, DateTime? endDate = null)
        {
            var stats = new List<DailyStatisticsDto>();
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>();
                if (startDate.HasValue)
                    parameters.Add("@StartDate", startDate.Value);
                if (endDate.HasValue)
                    parameters.Add("@EndDate", endDate.Value);

                SqlCommand cmd = CreateCommand("SP_GetDailyLogins", con, parameters);
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        stats.Add(new DailyStatisticsDto
                        {
                            StatDate = Convert.ToDateTime(reader["StatDate"]),
                            UserLoginCount = Convert.ToInt32(reader["UserLoginCount"])
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

        public IEnumerable<DailyStatisticsDto> GetDailyArticlePulls(DateTime? startDate = null, DateTime? endDate = null)
        {
            var stats = new List<DailyStatisticsDto>();
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>();
                if (startDate.HasValue)
                    parameters.Add("@StartDate", startDate.Value);
                if (endDate.HasValue)
                    parameters.Add("@EndDate", endDate.Value);

                SqlCommand cmd = CreateCommand("SP_GetDailyArticlePulls", con, parameters);
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        stats.Add(new DailyStatisticsDto
                        {
                            StatDate = Convert.ToDateTime(reader["StatDate"]),
                            ArticlesPulledCount = Convert.ToInt32(reader["ArticlesPulledCount"])
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

        public IEnumerable<DailyStatisticsDto> GetDailyArticleInserts(DateTime? startDate = null, DateTime? endDate = null)
        {
            var stats = new List<DailyStatisticsDto>();
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>();
                if (startDate.HasValue)
                    parameters.Add("@StartDate", startDate.Value);
                if (endDate.HasValue)
                    parameters.Add("@EndDate", endDate.Value);

                SqlCommand cmd = CreateCommand("SP_GetDailyArticleInserts", con, parameters);
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        stats.Add(new DailyStatisticsDto
                        {
                            StatDate = Convert.ToDateTime(reader["StatDate"]),
                            ArticlesInsertedCount = Convert.ToInt32(reader["ArticlesInsertedCount"])
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
    }
}

