using System;
using System.Collections.Generic;
using Horizon.DAL;
using Horizon.DTOs;

namespace Horizon.BL
{
    public class Statistics
    {
        public static IEnumerable<DailyStatisticsDto> GetDailyStatistics(DateTime startDate, DateTime endDate)
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
    }
}

