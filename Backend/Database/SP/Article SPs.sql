-- Stored Procedure to get a list of existing articles based on a list of URLs
CREATE PROCEDURE dbo.SP_GetArticlesByUrls
    @UrlList dbo.UrlList READONLY
AS
BEGIN
    SET NOCOUNT ON;

    SELECT  a.Id,
            a.Title,
            a.Url,
            a.Description,
            a.ImageUrl,
            a.Author,
            a.SourceName,
            a.PublishedAt,
            a.CreatedAt
    FROM dbo.Articles a
    INNER JOIN @UrlList u ON a.Url = u.Url;
END
GO


-- Stored Procedure to insert a batch of new articles
CREATE PROCEDURE dbo.SP_BulkInsertArticles
    @ArticleList dbo.ArticleListType READONLY
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Articles (Title, Url, Description, ImageUrl, Author, SourceName, PublishedAt)
    SELECT  Title,
            Url,
            Description,
            ImageUrl,
            Author,
            SourceName,
            PublishedAt
    FROM @ArticleList;
END
GO


-- Stored Procedure to insert a single new comment
CREATE PROCEDURE dbo.SP_InsertComment
    @ArticleId INT,
    @AuthorId  INT,
    @Content   NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Comments (ArticleId, AuthorId, Content)
    VALUES (@ArticleId, @AuthorId, @Content);

    -- Optionally, you can return the ID of the new comment
    SELECT SCOPE_IDENTITY() AS NewCommentId;
END
GO