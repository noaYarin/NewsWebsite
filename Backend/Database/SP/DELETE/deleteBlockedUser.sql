SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Noa Yarin>
-- Create date: <25.6.25>
-- Description:	<Delete blocked user>
-- =============================================
CREATE PROCEDURE SP_DeleteBlockedUser
	@UserId INT,
    @BlockedUserId INT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

   
    DELETE FROM BlockedUsers
    WHERE UserId = @UserId AND BlockedUserId = @BlockedUserId;
END
GO

