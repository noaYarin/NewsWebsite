CREATE PROCEDURE SP_CancelFriendRequest
    @SenderId INT,
    @RecipientId INT
AS
BEGIN
    -- Ensure UserOneId is always the smaller ID
    DECLARE @UserOneId INT = IIF(@SenderId < @RecipientId, @SenderId, @RecipientId);
    DECLARE @UserTwoId INT = IIF(@SenderId > @RecipientId, @SenderId, @RecipientId);

    -- Delete the request only if it's 'Pending' AND the action is being performed by the original sender.
    DELETE FROM Friendships
    WHERE UserOneId = @UserOneId
      AND UserTwoId = @UserTwoId
      AND Status = 'Pending'
      AND ActionUserId = @SenderId; -- This ensures only the sender can cancel

    SELECT @@ROWCOUNT;
END
GO