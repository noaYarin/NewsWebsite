GO
-- =============================================
-- Author:		<Noa Yarin Levi>
-- Create date: <25/04/2025>
-- Description:	<Update user>
-- =============================================
CREATE PROCEDURE SP_UpdateUser
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
    -- SET NOCOUNT ON;

    UPDATE [Users]
    SET 
    [Email] = @Email,
    [FirstName] = @FirstName,
    [LastName] = @LastName,
    [HashedPassword] = @HashedPassword,
    [ImgUrl] = @ImgUrl,
    [BirthDate] = @BirthDate,
    [IsAdmin] = @IsAdmin,
    [IsLocked] = @IsLocked
	WHERE [Id] = @UserId;
END
