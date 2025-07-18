ALTER PROCEDURE SP_CreateReport
    @ReporterUserId INT,
    @ReportedCommentId INT = NULL,
    @ReportedArticleId INT = NULL,
    @Reason VARCHAR(50),
    @Details NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO Reports (ReporterUserId, ReportedCommentId, ReportedArticleId, Reason, Details, Status)
    VALUES (@ReporterUserId, @ReportedCommentId, @ReportedArticleId, @Reason, @Details, 'Pending');

    SELECT SCOPE_IDENTITY();
END