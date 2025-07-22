CREATE PROCEDURE SP_CreateNotification
    @RecipientId INT,
    @SenderId INT,
    @NotificationType NVARCHAR(50),
    @RelatedEntityId INT,
    @Message NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO dbo.Notifications (RecipientId, SenderId, NotificationType, RelatedEntityId, Message, IsRead, CreatedAt)
    VALUES (@RecipientId, @SenderId, @NotificationType, @RelatedEntityId, @Message, 0, GETDATE());
    
    SELECT SCOPE_IDENTITY() AS NotificationId;
END
GO
