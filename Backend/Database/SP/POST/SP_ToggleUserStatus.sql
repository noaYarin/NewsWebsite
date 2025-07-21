CREATE PROCEDURE SP_ToggleUserStatus
    @UserId INT,
    @Attribute NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    IF @Attribute = 'IsAdmin'
    BEGIN
        UPDATE Users SET IsAdmin = ~IsAdmin WHERE Id = @UserId;
    END
    ELSE IF @Attribute = 'IsLocked'
    BEGIN
        UPDATE Users SET IsLocked = ~IsLocked WHERE Id = @UserId;
    END
END