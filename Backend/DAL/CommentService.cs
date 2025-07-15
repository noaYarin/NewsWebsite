using System.Data.SqlClient;
using Horizon.BL;
using Horizon.DTOs;

namespace Horizon.DAL;

public class CommentService : DBService
{
    public int AddComment(Comment comment)
    {
        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object>
        {
            { "@ArticleId", comment.ArticleId },
            { "@AuthorId", comment.AuthorId },
            { "@Content", comment.Content }
        };

            SqlCommand cmd = CreateCommand("SP_InsertComment", con, parameters);

            var newId = cmd.ExecuteScalar();
            return Convert.ToInt32(newId);
        }
        finally { con?.Close(); }
    }

    public List<CommentResponseDto> GetCommentsByArticleId(int articleId)
    {
        var comments = new List<CommentResponseDto>();
        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object> { { "@ArticleId", articleId } };
            SqlCommand cmd = CreateCommand("SP_GetCommentsByArticleId", con, parameters);
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    comments.Add(new CommentResponseDto
                    {
                        Id = Convert.ToInt32(reader["Id"]),
                        Content = reader["Content"].ToString(),
                        CreatedAt = Convert.ToDateTime(reader["CreatedAt"]),
                        AuthorId = Convert.ToInt32(reader["AuthorId"]),
                        AuthorName = $"{reader["FirstName"]} {reader["LastName"]}",
                        AuthorAvatar = reader["AuthorAvatar"] == DBNull.Value ? null : reader["AuthorAvatar"].ToString()
                    });
                }
            }
            return comments;
        }
        finally { con?.Close(); }
    }
}