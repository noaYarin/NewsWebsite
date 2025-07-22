CREATE PROCEDURE SP_GetNotifications
    @UserId INT,
    @PageNumber INT,
    @PageSize INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    SELECT 
        n.Id,
        n.NotificationType,
        n.Message,
        n.IsRead,
        n.CreatedAt,
        u.FirstName + ' ' + u.LastName AS SenderName,
        u.ImgUrl AS SenderAvatar,
        a.Title AS ArticleTitle,
        n.RelatedEntityId AS ArticleId
    FROM dbo.Notifications n
    LEFT JOIN dbo.Users u ON n.SenderId = u.Id
    LEFT JOIN dbo.Articles a ON n.RelatedEntityId = a.Id
    WHERE n.RecipientId = @UserId
    ORDER BY n.CreatedAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
