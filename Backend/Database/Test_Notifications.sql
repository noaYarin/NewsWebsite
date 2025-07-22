-- Test script to verify the notification system works correctly
-- Run this after applying all the database updates

-- 1. Check the table structure
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Notifications'
ORDER BY ORDINAL_POSITION;

-- 2. Test inserting a notification (replace with actual user/article IDs)
-- EXEC SP_CreateNotification @RecipientId = 1, @SenderId = 2, @NotificationType = 'ArticleShare', @RelatedEntityId = 1, @Message = 'Test shared an article with you';

-- 3. Test getting notifications (replace with actual user ID)  
-- EXEC SP_GetNotifications @UserId = 1, @PageNumber = 1, @PageSize = 10;

-- 4. Test getting unread count (replace with actual user ID)
-- EXEC SP_GetUnreadNotificationCount @UserId = 1;

-- Expected output from step 1 should include these columns:
-- Id, SenderId, RecipientId, ArticleId, Message, NotificationType, IsRead, CreatedAt
