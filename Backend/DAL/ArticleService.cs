using System.Data;
using System.Data.SqlClient;
using Horizon.BL;
using Horizon.DTOs;

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

    public List<Article> SearchArticles(string searchTerm)
    {
        var articles = new List<Article>();
        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object> { { "@SearchTerm", searchTerm } };
            SqlCommand cmd = CreateCommand("SP_SearchArticles", con, parameters);

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

    public List<Article> FetchRecentByCategory(string categoryName, int count)
    {
        var articles = new List<Article>();
        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object>
        {
            { "@CategoryName", categoryName },
            { "@Count", count }
        };
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

    public List<Article> FetchRecentByCategoryPaged(string categoryName, int page, int pageSize)
    {
        var articles = new List<Article>();
        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object>
        {
            { "@CategoryName", categoryName },
            { "@PageNumber", page },
            { "@PageSize", pageSize }
        };
            SqlCommand cmd = CreateCommand("SP_GetArticlesByCategory_Paged", con, parameters);
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

    public Article GetArticleById(int id)
    {
        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object> { { "@Id", id } };
            SqlCommand cmd = CreateCommand("SP_GetArticleById", con, parameters);

            using (SqlDataReader reader = cmd.ExecuteReader())
            {
                if (reader.Read())
                {
                    return MapReaderToArticle(reader);
                }
            }
            return null;
        }
        finally { con?.Close(); }
    }
}