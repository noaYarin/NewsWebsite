SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Noa Yarin Levi>
-- Create date: <25.6.25>
-- Description:	<Delete user tag from user list>
-- =============================================
CREATE PROCEDURE SP_DeleteUserTag
	@UserId INT,
	@TagId INT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    DELETE FROM UserArticles
	WHERE UserId=@UserId AND ArticleId=@TagId
END
GO
