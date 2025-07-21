CREATE PROCEDURE SP_ToggleCommentLike
    @CommentId INT,
    @UserId INT,
    @IsNowLiked BIT OUTPUT
AS
BEGIN
    -- This makes sure SQL Server doesn't send back the count of rows affected
    SET NOCOUNT ON;

    -- Check if the user has already liked this comment
    IF EXISTS (SELECT 1 FROM CommentLikes WHERE CommentId = @CommentId AND UserId = @UserId)
    BEGIN
        -- If the like exists, DELETE it (unlike)
        DELETE FROM CommentLikes
        WHERE CommentId = @CommentId AND UserId = @UserId;
        
        SET @IsNowLiked = 0; -- Set output to false (not liked)
    END
    ELSE
    BEGIN
        -- If the like does not exist, INSERT it (like)
        INSERT INTO CommentLikes (CommentId, UserId)
        VALUES (@CommentId, @UserId);

        SET @IsNowLiked = 1; -- Set output to true (is now liked)
    END
END
GO