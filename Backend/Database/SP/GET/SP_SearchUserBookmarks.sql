USE [igroup107_test2]
GO
ALTER PROCEDURE [dbo].[SP_SearchUserBookmarks]
    @UserId INT,
    @SearchTerm NVARCHAR(255),
    @PageNumber INT,
    @PageSize INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    SELECT
        a.Id,
        a.Title,
        a.Url,
        a.Description,
        a.ImageUrl,
        a.Author,
        a.SourceName,
        a.PublishedAt,
        a.Category,
        CASE
            WHEN a.Title LIKE '%' + @SearchTerm + '%' THEN 3
            WHEN a.Category LIKE '%' + @SearchTerm + '%' THEN 2
            WHEN a.Description LIKE '%' + @SearchTerm + '%' THEN 1
            ELSE 0
        END AS Relevance
    FROM
        Articles AS a
    INNER JOIN
        [UserBookmarkedArticles] AS b ON a.Id = b.ArticleId
    WHERE
        b.UserId = @UserId
        AND (
            a.Title LIKE '%' + @SearchTerm + '%'
            OR a.Description LIKE '%' + @SearchTerm + '%'
            OR a.Category LIKE '%' + @SearchTerm + '%'
        )
    ORDER BY
        Relevance DESC, a.PublishedAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END