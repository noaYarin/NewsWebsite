USE [igroup107_test2]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Noa Yarin Levi>
-- Create date: <26.6.25>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[SP_GetAllUsers]
	
AS
BEGIN

	--SET NOCOUNT ON;

    SELECT 
        U.Id,
        U.Email,
        U.FirstName,
        U.LastName,
        U.HashedPassword,
        U.ImgUrl,
        U.BirthDate,
        U.IsAdmin,
        U.IsLocked,

        (
            SELECT 
                BU.Id,
                BU.FirstName,
                BU.LastName,
                BU.Email,
                BU.HashedPassword,
                BU.ImgUrl,
                BU.BirthDate,
                BU.IsAdmin,
                BU.IsLocked
            FROM BlockedUsers AS B
            INNER JOIN Users AS BU ON B.BlockedUserId = BU.Id
            WHERE B.UserId = U.Id
            FOR JSON PATH, INCLUDE_NULL_VALUES
        ) AS BlockedUsers,

        (
            SELECT 
                T.TagId,
                T.[Name],
                T.CreateDate
            FROM UserTags AS UT
            INNER JOIN Tags AS T ON UT.TagId = T.TagId
            WHERE UT.UserId = U.Id
            FOR JSON PATH, INCLUDE_NULL_VALUES
        ) AS Tags,

        (
            SELECT 
                A.Id,
                A.Title,
                A.PublishDate
            FROM SavedArticles AS SA
            INNER JOIN Articles AS A ON SA.ArticleId = A.Id
            WHERE SA.UserId = U.Id
            FOR JSON PATH, INCLUDE_NULL_VALUES
        ) AS SavedArticles

    FROM Users AS U
    FOR JSON PATH, INCLUDE_NULL_VALUES
END
