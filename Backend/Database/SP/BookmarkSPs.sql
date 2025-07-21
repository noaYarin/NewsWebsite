-- Procedure to add or remove a bookmark
CREATE PROCEDURE SP_ToggleBookmark
    @UserId INT,
    @ArticleId INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM UserBookmarkedArticles WHERE UserId = @UserId AND ArticleId = @ArticleId)
    BEGIN
        DELETE FROM UserBookmarkedArticles WHERE UserId = @UserId AND ArticleId = @ArticleId;
        SELECT CAST(0 AS BIT); -- Now it's not bookmarked
    END
    ELSE
    BEGIN
        INSERT INTO UserBookmarkedArticles (UserId, ArticleId) VALUES (@UserId, @ArticleId);
        SELECT CAST(1 AS BIT); -- Now it is bookmarked
    END
END
GO

-- Procedure to check if a single article is bookmarked
CREATE PROCEDURE SP_IsArticleBookmarked
    @UserId INT,
    @ArticleId INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM UserBookmarkedArticles WHERE UserId = @UserId AND ArticleId = @ArticleId)
        SELECT CAST(1 AS BIT);
    ELSE
        SELECT CAST(0 AS BIT);
END
GO

-- Procedure to get all bookmarked articles for a user
CREATE PROCEDURE SP_GetUserBookmarks
    @UserId INT
AS
BEGIN
    SELECT
        a.Id, a.Title, a.Url, a.Description, a.ImageUrl, a.Author, a.SourceName, a.PublishedAt, a.Category
    FROM Articles a
    JOIN UserBookmarkedArticles b ON a.Id = b.ArticleId
    WHERE b.UserId = @UserId
    ORDER BY b.SavedAt DESC;
END
GO