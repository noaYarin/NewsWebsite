CREATE PROCEDURE SP_CreateNotification
    @RecipientId INT,
    @SenderId INT,
    @NotificationType NVARCHAR(50),
    @RelatedEntityId INT,
    @Message NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Check if the recipient has blocked the sender
        DECLARE @IsBlocked BIT = 0;
        
        -- Check UserBlocks table
        IF OBJECT_ID('UserBlocks', 'U') IS NOT NULL
        BEGIN
            IF EXISTS (
                SELECT 1 
                FROM UserBlocks 
                WHERE UserId = @RecipientId AND BlockedUserId = @SenderId
            )
            BEGIN
                SET @IsBlocked = 1;
            END
        END
        
        -- If not blocked, create the notification
        IF @IsBlocked = 0
        BEGIN
            INSERT INTO dbo.Notifications (RecipientId, SenderId, NotificationType, RelatedEntityId, Message, IsRead, CreatedAt)
            VALUES (@RecipientId, @SenderId, @NotificationType, @RelatedEntityId, @Message, 0, GETDATE());
            
            SELECT SCOPE_IDENTITY() AS NotificationId;
        END
        ELSE
        BEGIN
            -- Return a fake ID so the application doesn't know the notification was blocked
            SELECT -1 AS NotificationId;
        END
        
    END TRY
    BEGIN CATCH
        -- If there's any error, just create the notification normally (fallback behavior)
        INSERT INTO dbo.Notifications (RecipientId, SenderId, NotificationType, RelatedEntityId, Message, IsRead, CreatedAt)
        VALUES (@RecipientId, @SenderId, @NotificationType, @RelatedEntityId, @Message, 0, GETDATE());
        
        SELECT SCOPE_IDENTITY() AS NotificationId;
    END CATCH
END
GO
