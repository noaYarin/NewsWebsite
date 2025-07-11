-- Create the table to link users to those they've blocked
CREATE TABLE UserBlockedUsers (
    UserId INT NOT NULL FOREIGN KEY REFERENCES Users(Id),
    BlockedUserId INT NOT NULL FOREIGN KEY REFERENCES Users(Id),
    PRIMARY KEY (UserId, BlockedUserId)
);
GO

-- Stored procedure to get the list of users someone has blocked
IF OBJECT_ID('SP_GetBlockedUsers', 'P') IS NOT NULL DROP PROCEDURE SP_GetBlockedUsers;
GO
CREATE PROCEDURE SP_GetBlockedUsers @UserId INT
AS BEGIN
    SELECT U.Id, U.FirstName, U.LastName, U.ImgUrl
    FROM Users U
    INNER JOIN UserBlockedUsers B ON U.Id = B.BlockedUserId
    WHERE B.UserId = @UserId;
END
GO

-- Stored procedure to unblock a user
IF OBJECT_ID('SP_UnblockUser', 'P') IS NOT NULL DROP PROCEDURE SP_UnblockUser;
GO
CREATE PROCEDURE SP_UnblockUser @UserId INT, @BlockedUserId INT
AS BEGIN
    DELETE FROM UserBlockedUsers
    WHERE UserId = @UserId AND BlockedUserId = @BlockedUserId;
END
GO