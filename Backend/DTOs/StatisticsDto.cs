using System;

namespace Horizon.DTOs
{
    public class DailyStatisticsDto
    {
        public DateTime StatDate { get; set; }
        public int UserLoginCount { get; set; }
        public int ArticlesPulledCount { get; set; }
        public int ArticlesInsertedCount { get; set; }
        public int CommentsPostedCount { get; set; }
    }

    public class GeneralStatisticsDto
    {
        public int TotalUsers { get; set; }
        public int TotalArticles { get; set; }
        public int TotalComments { get; set; }
    }
}
