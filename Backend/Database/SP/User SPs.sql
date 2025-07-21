-- Gets a summary of all users for an admin panel
CREATE PROCEDURE SP_GetAllUsers
AS
BEGIN
    SELECT Id, Email, FirstName, LastName, ImgUrl, IsAdmin, IsLocked
    FROM Users
    ORDER BY FirstName, LastName;
END
GO

-- Searches for users by a part of their email address
CREATE PROCEDURE SP_SearchUsersByEmail
    @EmailTerm NVARCHAR(255)
AS
BEGIN
    SELECT Id, Email, FirstName, LastName, ImgUrl, IsAdmin, IsLocked
    FROM Users
    WHERE Email LIKE '%' + @EmailTerm + '%'
    ORDER BY FirstName, LastName;
END
GO

-- Creates a block relationship between two users
CREATE PROCEDURE SP_BlockUser
    @UserId INT,
    @UserToBlockId INT
AS
BEGIN
    -- Prevent user from blocking themselves
    IF @UserId = @UserToBlockId
    BEGIN
        RETURN;
    END

    -- Prevent duplicate entries
    IF NOT EXISTS (SELECT 1 FROM UserBlocks WHERE UserId = @UserId AND BlockedUserId = @UserToBlockId)
    BEGIN
        INSERT INTO UserBlocks (UserId, BlockedUserId)
        VALUES (@UserId, @UserToBlockId);
    END
END
GO