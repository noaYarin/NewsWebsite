CREATE PROCEDURE SP_MarkNotificationAsRead
    @NotificationId INT,
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Notifications 
    SET IsRead = 1 
    WHERE Id = @NotificationId AND RecipientId = @UserId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
