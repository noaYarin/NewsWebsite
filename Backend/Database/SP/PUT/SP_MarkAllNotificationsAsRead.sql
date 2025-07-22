CREATE PROCEDURE SP_MarkAllNotificationsAsRead
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Notifications 
    SET IsRead = 1 
    WHERE RecipientId = @UserId AND IsRead = 0;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
