CREATE PROCEDURE dbo.SP_GetRecentArticlesByCategory
    @CategoryName NVARCHAR(100),
    @Minutes INT = 60 -- Looks for articles saved in the last hour
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Id,
        Title,
        Url,
        Description,
        ImageUrl,
        Author,
        SourceName,
        PublishedAt,
        Category
    FROM dbo.Articles
    WHERE Category = @CategoryName AND CreatedAt >= DATEADD(minute, -@Minutes, GETDATE())
    ORDER BY PublishedAt DESC;
END
GO