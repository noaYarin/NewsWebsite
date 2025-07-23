
-- Statistics Tables
CREATE TABLE DailyStatistics (
    StatDate DATE PRIMARY KEY,
    UserLoginCount INT DEFAULT 0,
    ArticlesPulledCount INT DEFAULT 0,
    ArticlesInsertedCount INT DEFAULT 0,
    CommentsPostedCount INT DEFAULT 0
);
GO

CREATE TABLE GeneralStatistics (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TotalUsers INT,
    TotalArticles INT,
    TotalComments INT
);
GO

-- Stored Procedures for Statistics

-- Procedure to increment a daily stat
CREATE PROCEDURE SP_IncrementDailyStat
    @StatName NVARCHAR(50)
AS
BEGIN
    DECLARE @Today DATE = GETDATE();
    
    IF NOT EXISTS (SELECT 1 FROM DailyStatistics WHERE StatDate = @Today)
    BEGIN
        INSERT INTO DailyStatistics (StatDate) VALUES (@Today);
    END

    IF @StatName = 'UserLogin'
    BEGIN
        UPDATE DailyStatistics
        SET UserLoginCount = UserLoginCount + 1
        WHERE StatDate = @Today;
    END
    ELSE IF @StatName = 'ArticlePulled'
    BEGIN
        UPDATE DailyStatistics
        SET ArticlesPulledCount = ArticlesPulledCount + 1
        WHERE StatDate = @Today;
    END
    ELSE IF @StatName = 'ArticleInserted'
    BEGIN
        UPDATE DailyStatistics
        SET ArticlesInsertedCount = ArticlesInsertedCount + 1
        WHERE StatDate = @Today;
    END
    ELSE IF @StatName = 'CommentPosted'
    BEGIN
        UPDATE DailyStatistics
        SET CommentsPostedCount = CommentsPostedCount + 1
        WHERE StatDate = @Today;
    END
END
GO

-- Procedure to get daily statistics for a date range
CREATE PROCEDURE SP_GetDailyStatistics
    @StartDate DATE,
    @EndDate DATE
AS
BEGIN
    SELECT StatDate, UserLoginCount, ArticlesPulledCount, ArticlesInsertedCount, CommentsPostedCount
    FROM DailyStatistics
    WHERE StatDate BETWEEN @StartDate AND @EndDate
    ORDER BY StatDate;
END
GO

-- Procedure to get general statistics
CREATE PROCEDURE SP_GetGeneralStatistics
AS
BEGIN
    DECLARE @TotalUsers INT;
    DECLARE @TotalArticles INT;
    DECLARE @TotalComments INT;

    SELECT @TotalUsers = COUNT(*) FROM Users;
    SELECT @TotalArticles = COUNT(*) FROM Articles;
    SELECT @TotalComments = COUNT(*) FROM Comments;

    SELECT @TotalUsers AS TotalUsers, @TotalArticles AS TotalArticles, @TotalComments AS TotalComments;
END
GO
