USE [igroup107_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Noa Yarin Levi>
-- Create date: <26/06/2025>
-- Description:	<Insert User Tags>
-- =============================================
ALTER PROCEDURE [dbo].[SP_InsertUserTags]
	-- Add the parameters for the stored procedure here
	@UserId INT,
    @Name NVARCHAR(100)
AS
BEGIN

	SET NOCOUNT ON;

    DECLARE @TagId INT;

    SELECT @TagId = TagId
	FROM Tags
	WHERE Name = @Name;

    IF @TagId IS NULL
    BEGIN
        INSERT INTO Tags (Name) 
		VALUES (@Name);

        SELECT @TagId = TagId 
		FROM Tags
		WHERE Name = @Name;
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
