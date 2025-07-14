using Horizon.BL;
using Horizon.DTOs;
using System.Data;
using System.Data.SqlClient;

namespace Horizon.DAL;

public class ArticleService : DBService
{
    private Article MapReaderToArticle(SqlDataReader reader)
    {
        return new Article
        {
            Id = Convert.ToInt32(reader["Id"]),
            Title = reader["Title"].ToString(),
            Url = reader["Url"].ToString(),
            Description = reader["Description"] == DBNull.Value ? null : reader["Description"].ToString(),
            ImageUrl = reader["ImageUrl"] == DBNull.Value ? null : reader["ImageUrl"].ToString(),
            Author = reader["Author"] == DBNull.Value ? null : reader["Author"].ToString(),
            SourceName = reader["SourceName"] == DBNull.Value ? null : reader["SourceName"].ToString(),
            PublishedAt = reader["PublishedAt"] == DBNull.Value ? null : Convert.ToDateTime(reader["PublishedAt"]),
            Category = reader["Category"] == DBNull.Value ? null : reader["Category"].ToString()
        };
    }

    public List<Article> GetArticlesByUrls(List<string> urls)
    {
        var articles = new List<Article>();
        var urlTable = new DataTable();
        urlTable.Columns.Add("Url", typeof(string));
        foreach (var url in urls)
        {
            urlTable.Rows.Add(url);
        }

        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object> { { "@UrlList", urlTable } };
            SqlCommand cmd = CreateCommand("SP_GetArticlesByUrls", con, parameters);
            cmd.Parameters["@UrlList"].TypeName = "dbo.UrlList";

            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    articles.Add(MapReaderToArticle(reader));
                }
            }
            return articles;
        }
        finally { con?.Close(); }
    }

    public void BulkInsert(List<ArticleSyncDto> newArticles)
    {
        var articleTable = new DataTable();
        articleTable.Columns.Add("Title", typeof(string));
        articleTable.Columns.Add("Url", typeof(string));
        articleTable.Columns.Add("Description", typeof(string));
        articleTable.Columns.Add("ImageUrl", typeof(string));
        articleTable.Columns.Add("Author", typeof(string));
        articleTable.Columns.Add("SourceName", typeof(string));
        articleTable.Columns.Add("PublishedAt", typeof(DateTime));
        articleTable.Columns.Add("Category", typeof(string));

        foreach (var article in newArticles)
        {
            articleTable.Rows.Add(
                article.Title,
                article.Url,
                (object)article.Description ?? DBNull.Value,
                (object)article.ImageUrl ?? DBNull.Value,
                (object)article.Author ?? DBNull.Value,
                (object)article.SourceName ?? DBNull.Value,
                (object)article.PublishedAt ?? DBNull.Value,
                (object)article.Category ?? DBNull.Value
            );
        }

        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object> { { "@ArticleList", articleTable } };
            SqlCommand cmd = CreateCommand("SP_BulkInsertArticles", con, parameters);
            cmd.Parameters["@ArticleList"].TypeName = "dbo.ArticleListType";
            cmd.ExecuteNonQuery();
        }
        finally { con?.Close(); }
    }

    public List<Article> FetchRecentByCategory(string categoryName)
    {
        var articles = new List<Article>();
        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object> { { "@CategoryName", categoryName } };
            SqlCommand cmd = CreateCommand("SP_GetRecentArticlesByCategory", con, parameters);
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    articles.Add(MapReaderToArticle(reader));
                }
            }
            return articles;
        }
        finally { con?.Close(); }
    }
}