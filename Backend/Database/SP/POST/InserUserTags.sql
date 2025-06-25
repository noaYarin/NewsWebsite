SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE SP_InsertUserTags 
	@UserId INT,
    @TagName NVARCHAR(100)
AS
BEGIN

	SET NOCOUNT ON;

    DECLARE @TagId INT;

    SELECT @TagId = TagId
	FROM Tags
	WHERE Name = @TagName;

    IF @TagId IS NULL
    BEGIN
        INSERT INTO Tags (Name) 
		VALUES (@TagName);

        SELECT @TagId = TagId 
		FROM Tags
		WHERE Name = @TagName;
    END

    IF NOT EXISTS (
        SELECT 1 
		FROM UserTags
		WHERE UserId = @UserId 
		AND
		TagId = @TagId
    )
    BEGIN
        INSERT INTO UserTags (UserId, TagId) VALUES (@UserId, @TagId);
    END
END
GO
