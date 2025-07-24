using System.Data.SqlClient;
using Horizon.BL;

namespace Horizon.DAL
{
    public class BookmarkService : DBService
    {
        private ArticleService _articleService = new ArticleService();

        public bool ToggleBookmark(int userId, int articleId)
        {
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object> { { "@UserId", userId }, { "@ArticleId", articleId } };
                SqlCommand cmd = CreateCommand("SP_ToggleBookmark", con, parameters);
                return (bool)cmd.ExecuteScalar();
            }
            finally { con?.Close(); }
        }

        public bool IsArticleBookmarked(int userId, int articleId)
        {
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object> { { "@UserId", userId }, { "@ArticleId", articleId } };
                SqlCommand cmd = CreateCommand("SP_IsArticleBookmarked", con, parameters);
                return (bool)cmd.ExecuteScalar();
            }
            finally { con?.Close(); }
        }

        public List<Article> GetUserBookmarks(int userId)
        {
            var articles = new List<Article>();
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object> { { "@UserId", userId } };
                SqlCommand cmd = CreateCommand("SP_GetUserBookmarks", con, parameters);
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        articles.Add(_articleService.MapReaderToArticle(reader));
                    }
                }
                return articles;
            }
            finally { con?.Close(); }
        }

        public List<Article> SearchUserBookmarks(int userId, string searchTerm, int page, int pageSize)
        {
            var articles = new List<Article>();
            SqlConnection con = null;
            try
            {
                con = Connect();
                var parameters = new Dictionary<string, object>
        {
            { "@UserId", userId },
            { "@SearchTerm", searchTerm },
            { "@PageNumber", page },
            { "@PageSize", pageSize }
        };
                SqlCommand cmd = CreateCommand("SP_SearchUserBookmarks", con, parameters);
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        articles.Add(_articleService.MapReaderToArticle(reader));
                    }
                }
                return articles;
            }
            finally { con?.Close(); }
        }
    }
}
