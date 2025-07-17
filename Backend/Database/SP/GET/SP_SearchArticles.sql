CREATE PROCEDURE SP_SearchArticles
    @SearchTerm NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM Articles
    WHERE Title LIKE '%' + @SearchTerm + '%' OR Description LIKE '%' + @SearchTerm + '%'
    ORDER BY PublishedAt DESC;
END
GO
