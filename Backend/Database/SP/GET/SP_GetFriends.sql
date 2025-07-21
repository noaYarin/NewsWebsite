CREATE PROCEDURE SP_GetFriends
    @UserId INT
AS
BEGIN
    -- Get all friends for a user (bidirectional friendship)
    SELECT DISTINCT
        CASE 
            WHEN f.UserOneId = @UserId THEN u2.Id
            ELSE u1.Id
        END AS Id,
        CASE 
            WHEN f.UserOneId = @UserId THEN CONCAT(u2.FirstName, ' ', u2.LastName)
            ELSE CONCAT(u1.FirstName, ' ', u1.LastName)
        END AS FullName,
        CASE 
            WHEN f.UserOneId = @UserId THEN u2.ImgUrl
            ELSE u1.ImgUrl
        END AS Avatar
    FROM Friendships f
    INNER JOIN Users u1 ON f.UserOneId = u1.Id
    INNER JOIN Users u2 ON f.UserTwoId = u2.Id
    WHERE (f.UserOneId = @UserId OR f.UserTwoId = @UserId)
      AND f.Status = 'Accepted'
    ORDER BY FullName;
END
GO
