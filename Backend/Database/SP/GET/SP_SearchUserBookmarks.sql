ALTER PROCEDURE SP_SearchUserBookmarks
    @UserId INT,
    @SearchTerm NVARCHAR(255)
AS
BEGIN
    SELECT 
        a.Id,
        a.Title,
        a.Url,
        a.Description,
        a.ImageUrl,
        a.Author,
        a.SourceName,
        a.PublishedAt,
        a.Category
    FROM Articles AS a
    INNER JOIN [UserBookmarkedArticles] AS b ON a.Id = b.ArticleId
    WHERE 
        b.UserId = @UserId
        AND (a.Title LIKE '%' + @SearchTerm + '%' OR a.Description LIKE '%' + @SearchTerm + '%');
END