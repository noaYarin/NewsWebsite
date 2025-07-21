IF OBJECT_ID('SP_CheckTagsExist', 'P') IS NOT NULL DROP PROCEDURE SP_CheckTagsExist;
GO

CREATE PROCEDURE SP_CheckTagsExist
    @TagNames dbo.NameList READONLY
AS
BEGIN
    DECLARE @InputCount INT;
    SELECT @InputCount = COUNT(*) FROM @TagNames;

    DECLARE @MatchCount INT;
    SELECT @MatchCount = COUNT(T.Id)
    FROM Tags T
    INNER JOIN @TagNames L ON T.Name = L.Name;

    IF @InputCount = @MatchCount
        SELECT 1;
    ELSE
        SELECT 0;
END
GO