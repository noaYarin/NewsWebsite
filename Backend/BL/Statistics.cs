using System;
using System.Collections.Generic;
using Horizon.DAL;
using Horizon.DTOs;

namespace Horizon.BL
{
    public class Statistics
    {
        public static IEnumerable<DailyStatisticsDto> GetDailyStatistics(DateTime? startDate = null, DateTime? endDate = null)
        {
            var statisticsService = new StatisticsService();
            return statisticsService.GetDailyStatistics(startDate, endDate);
        }

        public static GeneralStatisticsDto GetGeneralStatistics()
        {
            var statisticsService = new StatisticsService();
            return statisticsService.GetGeneralStatistics();
        }

        public static void IncrementUserLogin()
        {
            new StatisticsService().IncrementDailyStat("UserLogin");
        }

        public static void IncrementArticlesPulled(int count = 1)
        {
            var statisticsService = new StatisticsService();
            for (int i = 0; i < count; i++)
            {
                statisticsService.IncrementDailyStat("ArticlePulled");
            }
        }

        public static void IncrementArticlesInserted()
        {
            new StatisticsService().IncrementDailyStat("ArticleInserted");
        }
        public static void IncrementCommentsPosted()
        {
            new StatisticsService().IncrementDailyStat("CommentPosted");
        }

        public static IEnumerable<DailyStatisticsDto> GetDailyLogins(DateTime? startDate = null, DateTime? endDate = null)
        {
            var statisticsService = new StatisticsService();
            return statisticsService.GetDailyLogins(startDate, endDate);
        }

        public static IEnumerable<DailyStatisticsDto> GetDailyArticlePulls(DateTime? startDate = null, DateTime? endDate = null)
        {
            var statisticsService = new StatisticsService();
            return statisticsService.GetDailyArticlePulls(startDate, endDate);
        }

        public static IEnumerable<DailyStatisticsDto> GetDailyArticleInserts(DateTime? startDate = null, DateTime? endDate = null)
        {
            var statisticsService = new StatisticsService();
            return statisticsService.GetDailyArticleInserts(startDate, endDate);
        }
    }
}

