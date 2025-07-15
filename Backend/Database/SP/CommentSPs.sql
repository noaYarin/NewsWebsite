-- Stored Procedure to update a comment.
-- Allows the original author OR an admin to update.
ALTER PROCEDURE SP_UpdateComment
    @CommentId INT,
    @RequestingUserId INT,
    @Content NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the requesting user is an admin
    DECLARE @IsAdmin BIT;
    SELECT @IsAdmin = IsAdmin FROM Users WHERE Id = @RequestingUserId;

    -- Update the comment if it exists AND (the user is the author OR the user is an admin)
    UPDATE Comments
    SET Content = @Content
    WHERE Id = @CommentId AND (AuthorId = @RequestingUserId OR @IsAdmin = 1);

    -- Return 1 for success, 0 for failure (not found or no permission)
    SELECT @@ROWCOUNT;
END
GO

-- Stored Procedure to delete a comment.
-- Allows the original author OR an admin to delete.
ALTER PROCEDURE SP_DeleteComment
    @CommentId INT,
    @RequestingUserId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the requesting user is an admin
    DECLARE @IsAdmin BIT;
    SELECT @IsAdmin = IsAdmin FROM Users WHERE Id = @RequestingUserId;

    -- Delete the comment if it exists AND (the user is the author OR the user is an admin)
    DELETE FROM Comments
    WHERE Id = @CommentId AND (AuthorId = @RequestingUserId OR @IsAdmin = 1);

    -- Return 1 for success, 0 for failure (not found or no permission)
    SELECT @@ROWCOUNT;
END
GO