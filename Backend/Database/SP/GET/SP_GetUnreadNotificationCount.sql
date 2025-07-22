CREATE PROCEDURE SP_GetUnreadNotificationCount
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT COUNT(*) AS UnreadCount
    FROM dbo.Notifications 
    WHERE RecipientId = @UserId AND IsRead = 0;
END
GO
