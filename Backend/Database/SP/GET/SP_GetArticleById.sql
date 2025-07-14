-- Creates the stored procedure to get a single article by its ID
CREATE PROCEDURE SP_GetArticleById
    @Id INT
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
    FROM 
        Articles
    WHERE 
        Id = @Id;
END
GO