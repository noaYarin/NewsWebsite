CREATE PROCEDURE SP_SendFriendRequest
    @SenderId INT,
    @RecipientId INT
AS
BEGIN
    -- Prevent user from sending a request to themselves
    IF @SenderId = @RecipientId
    BEGIN
        SELECT 'Cannot send friend request to yourself' AS ErrorMessage;
        RETURN;
    END

    DECLARE @UserOneId INT = IIF(@SenderId < @RecipientId, @SenderId, @RecipientId);
    DECLARE @UserTwoId INT = IIF(@SenderId > @RecipientId, @SenderId, @RecipientId);

    -- Check if friendship already exists
    IF EXISTS (SELECT 1 FROM Friendships WHERE UserOneId = @UserOneId AND UserTwoId = @UserTwoId)
    BEGIN
        SELECT 'Friendship relationship already exists' AS ErrorMessage;
        RETURN;
    END

    -- Insert new friend request
    INSERT INTO Friendships (UserOneId, UserTwoId, Status, ActionUserId, CreatedAt, UpdatedAt)
    VALUES (@UserOneId, @UserTwoId, 'Pending', @SenderId, GETDATE(), GETDATE());

    SELECT @@ROWCOUNT;
END
GO
