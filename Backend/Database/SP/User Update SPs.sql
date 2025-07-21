-- Gets a user's details by their ID
IF OBJECT_ID('SP_GetUserById', 'P') IS NOT NULL DROP PROCEDURE SP_GetUserById;
GO
CREATE PROCEDURE SP_GetUserById @Id INT
AS BEGIN
    SELECT Id, Email, FirstName, LastName, BirthDate, ImgUrl, IsAdmin
    FROM Users WHERE Id = @Id;
END
GO

-- Updates a user's basic profile information
IF OBJECT_ID('SP_UpdateUserDetails', 'P') IS NOT NULL DROP PROCEDURE SP_UpdateUserDetails;
GO
CREATE PROCEDURE SP_UpdateUserDetails
    @UserId INT,
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100),
    @BirthDate NVARCHAR(50),
    @ImageUrl NVARCHAR(500)
AS BEGIN
    UPDATE Users
    SET FirstName = @FirstName, LastName = @LastName, BirthDate = @BirthDate, ImgUrl = @ImageUrl
    WHERE Id = @UserId;
END
GO

-- Updates a user's password
IF OBJECT_ID('SP_UpdateUserPassword', 'P') IS NOT NULL DROP PROCEDURE SP_UpdateUserPassword;
GO
CREATE PROCEDURE SP_UpdateUserPassword @UserId INT, @HashedPassword NVARCHAR(MAX)
AS BEGIN
    UPDATE Users SET HashedPassword = @HashedPassword WHERE Id = @UserId;
END
GO

-- Deletes all existing tags for a user (used before re-inserting the new list)
IF OBJECT_ID('SP_DeleteUserTags', 'P') IS NOT NULL DROP PROCEDURE SP_DeleteUserTags;
GO
CREATE PROCEDURE SP_DeleteUserTags @UserId INT
AS BEGIN
    DELETE FROM UserTags WHERE UserId = @UserId;
END
GO