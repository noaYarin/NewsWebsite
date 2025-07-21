CREATE PROCEDURE SP_GetPendingFriendRequests
    @UserId INT
AS
BEGIN
    -- Get pending friend requests for a user (requests sent TO the user)
    SELECT 
        CASE 
            WHEN f.ActionUserId != @UserId THEN f.ActionUserId
            ELSE CASE WHEN f.UserOneId = @UserId THEN f.UserTwoId ELSE f.UserOneId END
        END AS Id,
        CASE 
            WHEN f.ActionUserId != @UserId THEN CONCAT(u_sender.FirstName, ' ', u_sender.LastName)
            ELSE CASE 
                WHEN f.UserOneId = @UserId THEN CONCAT(u2.FirstName, ' ', u2.LastName)
                ELSE CONCAT(u1.FirstName, ' ', u1.LastName)
            END
        END AS FullName,
        CASE 
            WHEN f.ActionUserId != @UserId THEN u_sender.ImgUrl
            ELSE CASE 
                WHEN f.UserOneId = @UserId THEN u2.ImgUrl
                ELSE u1.ImgUrl
            END
        END AS Avatar
    FROM Friendships f
    INNER JOIN Users u1 ON f.UserOneId = u1.Id
    INNER JOIN Users u2 ON f.UserTwoId = u2.Id
    LEFT JOIN Users u_sender ON f.ActionUserId = u_sender.Id
    WHERE (f.UserOneId = @UserId OR f.UserTwoId = @UserId)
      AND f.Status = 'Pending'
      AND f.ActionUserId != @UserId  -- Requests sent TO the user, not BY the user
    ORDER BY f.CreatedAt DESC;
END
GO
