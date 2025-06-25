SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE SP_GetUserByEmail
	@email NVARCHAR(100)
AS
BEGIN
	--SET NOCOUNT ON;
        SELECT *
        FROM Users
        WHERE Email = @email
END
GO
