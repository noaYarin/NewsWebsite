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
CREATE PROCEDURE SP_IsUserExists 
	@email NVARCHAR(100),
    @hashedPassword NVARCHAR(255) 
AS
BEGIN

	--SET NOCOUNT ON;

  IF @hashedPassword =''
    BEGIN
        SELECT Email
        FROM Users
        WHERE Email = @email
    END
    ELSE
    BEGIN
        SELECT *
        FROM Users
        WHERE Email = @email AND HashedPassword = @hashedPassword
    END
	
END
GO
