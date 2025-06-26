SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Noa Yarin Levi>
-- Create date: <25.6.25>
-- Description:	<Delete saved article from user list>
-- =============================================
CREATE PROCEDURE SP_DeleteSavedArticle
	@UserId INT,
	@ArticleId INT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    DELETE FROM UserArticles
	WHERE UserId=@UserId AND ArticleId=@ArticleId
END
GO
