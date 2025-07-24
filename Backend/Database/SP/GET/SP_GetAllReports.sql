ALTER PROCEDURE SP_GetAllReports
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