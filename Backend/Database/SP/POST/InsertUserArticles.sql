-- ================================================
-- Template generated from Template Explorer using:
-- Create Procedure (New Menu).SQL
--
-- Use the Specify Values for Template Parameters 
-- command (Ctrl-Shift-M) to fill in the parameter 
-- values below.
--
-- This block of comments will not be included in
-- the definition of the procedure.
-- ================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE SP_InsertUserArticles
	@UserId INT,
    @Title NVARCHAR(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	
    DECLARE @ArticleId INT;

    SELECT @ArticleId = Id
	FROM Articles
	WHERE Title = @Title AND UserId = @UserId;

    IF @ArticleId IS NULL
    BEGIN
        INSERT INTO Articles(Title,UserId) 
		VALUES (@Title,@UserId);

		
       SET @ArticleId = SCOPE_IDENTITY(); -- To get the new Id of the article
    END

    IF NOT EXISTS (
        SELECT 1 
		FROM UserArticles
		WHERE UserId = @UserId 
		AND
		ArticleId = @ArticleId
    )
    BEGIN
        INSERT INTO UserArticles (UserId, ArticleId) VALUES (@UserId, @ArticleId);
    END
   
END
GO
