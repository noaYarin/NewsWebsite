-- Procedure to create a new report
CREATE PROCEDURE SP_CreateReport
    @ReporterUserId INT,
    @ReportedArticleId INT = NULL,
    @ReportedCommentId INT = NULL,
    @Reason NVARCHAR(50)
AS
BEGIN
    INSERT INTO Reports (ReporterUserId, ReportedArticleId, ReportedCommentId, Reason)
    VALUES (@ReporterUserId, @ReportedArticleId, @ReportedCommentId, @Reason);
    SELECT SCOPE_IDENTITY();
END
GO

-- Procedure to get all reports (for an admin view)
CREATE PROCEDURE SP_GetAllReports
AS
BEGIN
    SELECT
        r.Id,
        r.Reason,
        r.Status,
        r.CreatedAt,
        r.Details,
        r.AdminNotes,
        reporter.Id AS ReporterUserId,
        reporter.FirstName + ' ' + reporter.LastName AS ReporterName,
        r.ReportedArticleId,
        a.Title AS ArticleTitle,
        r.ReportedCommentId,
        c.Content AS CommentContent
    FROM Reports r
    JOIN Users reporter ON r.ReporterUserId = reporter.Id
    LEFT JOIN Articles a ON r.ReportedArticleId = a.Id
    LEFT JOIN Comments c ON r.ReportedCommentId = c.Id
    ORDER BY r.CreatedAt DESC;
END
GO

-- Procedure to update a report's status
CREATE PROCEDURE SP_UpdateReportStatus
    @ReportId INT,
    @NewStatus NVARCHAR(50),
    @AdminNotes NVARCHAR(MAX)
AS
BEGIN
    UPDATE Reports
    SET Status = @NewStatus, AdminNotes = @AdminNotes
    WHERE Id = @ReportId;
    SELECT @@ROWCOUNT;
END
GO