ALTER PROCEDURE SP_RespondToFriendRequest
    @RequesterId INT,
    @ResponderId INT,
    @NewStatus NVARCHAR(50) -- 'Accepted' or 'Declined'
AS
BEGIN
    DECLARE @UserOneId INT = IIF(@RequesterId < @ResponderId, @RequesterId, @ResponderId);
    DECLARE @UserTwoId INT = IIF(@RequesterId > @ResponderId, @RequesterId, @ResponderId);

    IF @NewStatus = 'Accepted'
    BEGIN
        UPDATE Friendships
        SET Status = 'Accepted', ActionUserId = @ResponderId, UpdatedAt = GETDATE()
        WHERE UserOneId = @UserOneId
          AND UserTwoId = @UserTwoId
          AND Status = 'Pending'
          AND ActionUserId != @ResponderId; -- SECURITY CHECK
    END
    ELSE -- Declined
    BEGIN
        DELETE FROM Friendships
        WHERE UserOneId = @UserOneId
          AND UserTwoId = @UserTwoId
          AND Status = 'Pending'
          AND ActionUserId != @ResponderId; -- SECURITY CHECK
    END

    SELECT @@ROWCOUNT;
END
GO
