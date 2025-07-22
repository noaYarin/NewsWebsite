CREATE PROCEDURE SP_GetUsersPaginated
    @SearchTerm NVARCHAR(255) = NULL,
    @Page INT = 1,
    @PageSize INT = 10
AS
BEGIN
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    
    -- Get paginated users based on search term
    SELECT 
        Id,
        FirstName,
        LastName,
        Email,
        ImgUrl,
        IsAdmin,
        IsLocked
    FROM Users
    WHERE 
        (@SearchTerm IS NULL OR 
         Email LIKE '%' + @SearchTerm + '%' OR 
         FirstName LIKE '%' + @SearchTerm + '%' OR 
         LastName LIKE '%' + @SearchTerm + '%' OR
         CONCAT(FirstName, ' ', LastName) LIKE '%' + @SearchTerm + '%')
    ORDER BY 
        CASE 
            WHEN @SearchTerm IS NULL THEN FirstName
            WHEN Email LIKE @SearchTerm + '%' THEN 1
            WHEN CONCAT(FirstName, ' ', LastName) LIKE @SearchTerm + '%' THEN 2
            ELSE 3
        END,
        FirstName, LastName
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
    
    -- Get total count for pagination info
    SELECT COUNT(*) AS TotalCount
    FROM Users
    WHERE 
        (@SearchTerm IS NULL OR 
         Email LIKE '%' + @SearchTerm + '%' OR 
         FirstName LIKE '%' + @SearchTerm + '%' OR 
         LastName LIKE '%' + @SearchTerm + '%' OR
         CONCAT(FirstName, ' ', LastName) LIKE '%' + @SearchTerm + '%');
END
GO
