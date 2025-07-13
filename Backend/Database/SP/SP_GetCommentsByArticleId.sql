-- Stored Procedure to get all comments for a given article, including author details
CREATE PROCEDURE dbo.SP_GetCommentsByArticleId
    @ArticleId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.Id,
        c.Content,
        c.CreatedAt,
        u.Id AS AuthorId,
        u.FirstName,
        u.LastName,
        u.ImgUrl AS AuthorAvatar
    FROM dbo.Comments c
    INNER JOIN dbo.Users u ON c.AuthorId = u.Id
    WHERE c.ArticleId = @ArticleId
    ORDER BY c.CreatedAt DESC;
END
GO