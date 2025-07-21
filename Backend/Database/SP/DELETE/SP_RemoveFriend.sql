CREATE PROCEDURE SP_RemoveFriend
    @UserId INT,
    @FriendId INT
AS
BEGIN
    DECLARE @UserOneId INT = IIF(@UserId < @FriendId, @UserId, @FriendId);
    DECLARE @UserTwoId INT = IIF(@UserId > @FriendId, @UserId, @FriendId);
    
    -- Delete the friendship if it exists and is accepted
    DELETE FROM Friendships
    WHERE UserOneId = @UserOneId
      AND UserTwoId = @UserTwoId
      AND Status = 'Accepted';
    
    SELECT @@ROWCOUNT;
END
GO
