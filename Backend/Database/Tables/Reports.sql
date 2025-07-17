-- Drop old objects first to ensure a clean state
IF OBJECT_ID('dbo.SP_CreateReport', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_CreateReport;
GO
IF OBJECT_ID('dbo.Reports', 'U') IS NOT NULL
    DROP TABLE dbo.Reports;
GO

-- Create the Reports table for COMMENTS ONLY
CREATE TABLE Reports (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ReporterUserId INT NOT NULL,
    ReportedCommentId INT NOT NULL, -- This is now required
    Reason NVARCHAR(50) NOT NULL,
    Details NVARCHAR(500) NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    AdminNotes NVARCHAR(MAX) NULL,

    CONSTRAINT FK_Reports_ReporterUser FOREIGN KEY (ReporterUserId) REFERENCES Users(Id),
    CONSTRAINT FK_Reports_Comment FOREIGN KEY (ReportedCommentId) REFERENCES Comments(Id) ON DELETE CASCADE
);
GO

-- Create the Stored Procedure for COMMENTS ONLY
CREATE PROCEDURE SP_CreateReport
    @ReporterUserId INT,
    @ReportedCommentId INT, -- This is now a required parameter
    @Reason NVARCHAR(50),
    @Details NVARCHAR(500)
AS
BEGIN
    INSERT INTO Reports (ReporterUserId, ReportedCommentId, Reason, Details)
    VALUES (@ReporterUserId, @ReportedCommentId, @Reason, @Details);
    SELECT SCOPE_IDENTITY();
END
GO