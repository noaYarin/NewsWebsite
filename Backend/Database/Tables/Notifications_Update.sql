-- Update Notifications table to include NotificationType
-- This should be run after the existing table creation

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Notifications' AND COLUMN_NAME = 'NotificationType')
BEGIN
    ALTER TABLE dbo.Notifications 
    ADD NotificationType NVARCHAR(50) NOT NULL DEFAULT 'ArticleShare';
END
GO

-- Also make ArticleId nullable to support non-article notifications like friend requests
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Notifications' AND COLUMN_NAME = 'ArticleId' AND IS_NULLABLE = 'NO')
BEGIN
    -- Drop foreign key constraint temporarily
    ALTER TABLE dbo.Notifications DROP CONSTRAINT FK_Notifications_Article;
    
    -- Alter the column to be nullable
    ALTER TABLE dbo.Notifications ALTER COLUMN ArticleId INT NULL;
    
    -- Re-add the foreign key constraint
    ALTER TABLE dbo.Notifications 
    ADD CONSTRAINT FK_Notifications_Article FOREIGN KEY (ArticleId) REFERENCES dbo.Articles(Id);
END
GO
