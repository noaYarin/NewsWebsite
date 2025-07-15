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

    public bool UpdateComment(int commentId, int requestingUserId, string content)
    {
        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object>
        {
            { "@CommentId", commentId },
            { "@RequestingUserId", requestingUserId },
            { "@Content", content }
        };

            SqlCommand cmd = CreateCommand("SP_UpdateComment", con, parameters);
            int rowsAffected = (int)cmd.ExecuteScalar();
            return rowsAffected > 0;
        }
        finally { con?.Close(); }
    }

    public bool DeleteComment(int commentId, int requestingUserId)
    {
        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object>
        {
            { "@CommentId", commentId },
            { "@RequestingUserId", requestingUserId }
        };

            SqlCommand cmd = CreateCommand("SP_DeleteComment", con, parameters);
            int rowsAffected = (int)cmd.ExecuteScalar();
            return rowsAffected > 0;
        }
        finally { con?.Close(); }
    }
}