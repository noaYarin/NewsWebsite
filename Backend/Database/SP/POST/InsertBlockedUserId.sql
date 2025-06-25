SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE SP_InsertBlockedUser
	@UserId INT,
	@Id INT,
    @Email NVARCHAR(255),
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100),
    @HashedPassword NVARCHAR(255),
    @ImgUrl NVARCHAR(100),
    @BirthDate DATE,
    @IsAdmin BIT,
    @IsLocked BIT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1 
        FROM Users 
        WHERE Id = @Id
    )
    BEGIN
        INSERT INTO Users (
            Id,
            Email,
            FirstName,
            LastName,
            HashedPassword,
            ImgUrl,
            BirthDate,
            IsAdmin,
            IsLocked
        )
        VALUES (
            @Id,
            @Email,
            @FirstName,
            @LastName,
            @HashedPassword,
            @ImgUrl,
            @BirthDate,
            @IsAdmin,
            @IsLocked
        );
    END

    IF NOT EXISTS (
        SELECT 1 
        FROM BlockedUsers 
        WHERE UserId = @UserId AND BlockedUserId = @Id
    )
    BEGIN
        INSERT INTO BlockedUsers (UserId, BlockedUserId)
        VALUES (@UserId, @Id);
    END
END
GO
