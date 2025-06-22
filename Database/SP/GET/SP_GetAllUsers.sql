USE [igroup107_test2]
GO
/****** Object:  StoredProcedure [dbo].[SP_GetAllUsers]    Script Date: 6/20/2025 2:32:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE SP_GetAllUsers
	
AS
BEGIN

	--SET NOCOUNT ON;

    SELECT U.Id, U.Email, U.FirstName, U.LastName,U.HashedPassword,U.ImgUrl,U.BirthDate,U.IsAdmin,U.MobileUrl,
    BU.Id AS BlockedUserId,
    BU.FirstName AS BlockedUserFirstName,
    BU.LastName AS BlockedUserLastName,
    BU.Email AS BlockedUserEmail,
	BU.HashedPassword AS BlockedUserPassword,
    BU.ImgUrl AS BlockedUserImgUrl,
    BU.BirthDate AS BlockedUserBirthDate,
    BU.IsAdmin AS BlockedUserIsAdmin,
    BU.MobileUrl AS BlockedUserMobileUrl,

	T.TagId AS TagId,
	T.[Name] AS TagName,
    T.CreateDate AS TagCreateDate,

	A.Id AS ArticleId,
    A.Title AS ArticleTitle,
    A.PublishDate AS ArticlePublishDate
	
    FROM Users AS U
    LEFT JOIN UserTags AS UT ON U.Id = UT.UserId
    LEFT JOIN Tags AS T ON UT.TagId = T.TagId

    LEFT JOIN SavedArticles AS SA ON U.Id = SA.UserId
    LEFT JOIN Articles AS A ON SA.ArticleId = A.Id

	LEFT JOIN BlockedUsers AS B ON U.Id = B.UserId
    LEFT JOIN Users AS BU ON B.BlockedUserId =BU.Id
END
