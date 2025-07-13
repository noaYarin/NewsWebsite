-- Drop existing tables if they exist to prevent errors
IF OBJECT_ID('dbo.Comments', 'U') IS NOT NULL
    DROP TABLE dbo.Comments;
GO
IF OBJECT_ID('dbo.Bookmarks', 'U') IS NOT NULL
    DROP TABLE dbo.Bookmarks;
GO
IF OBJECT_ID('dbo.Notifications', 'U') IS NOT NULL
    DROP TABLE dbo.Notifications;
GO
IF OBJECT_ID('dbo.Articles', 'U') IS NOT NULL
    DROP TABLE dbo.Articles;
GO

-- Recreate tables with the corrected schema
CREATE TABLE dbo.Articles
(
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    Title       NVARCHAR(500) NOT NULL,
    -- CORRECTED: Changed NVARCHAR(MAX) to NVARCHAR(450) to allow for a unique key
    Url         NVARCHAR(450) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    ImageUrl    NVARCHAR(MAX) NULL,
    Author      NVARCHAR(255) NULL,
    SourceName  NVARCHAR(255) NULL,
    PublishedAt DATETIME2 NULL,
    CreatedAt   DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT UQ_Articles_Url UNIQUE (Url)
);
GO

CREATE TABLE dbo.Comments
(
    Id        INT IDENTITY(1,1) PRIMARY KEY,
    Content   NVARCHAR(MAX) NOT NULL,
    ArticleId INT NOT NULL,
    AuthorId  INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Comments_Article FOREIGN KEY (ArticleId) REFERENCES dbo.Articles(Id),
    -- This assumes you have a Users table with a primary key column named Id
    CONSTRAINT FK_Comments_User FOREIGN KEY (AuthorId) REFERENCES dbo.Users(Id)
);
GO

CREATE TABLE dbo.Bookmarks
(
    UserId    INT NOT NULL,
    ArticleId INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Bookmarks PRIMARY KEY (UserId, ArticleId),
    CONSTRAINT FK_Bookmarks_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id),
    CONSTRAINT FK_Bookmarks_Article FOREIGN KEY (ArticleId) REFERENCES dbo.Articles(Id)
);
GO

CREATE TABLE dbo.Notifications
(
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    SenderId    INT NOT NULL,
    RecipientId INT NOT NULL,
    ArticleId   INT NOT NULL,
    Message     NVARCHAR(500) NULL,
    IsRead      BIT NOT NULL DEFAULT 0,
    CreatedAt   DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Notifications_Sender FOREIGN KEY (SenderId) REFERENCES dbo.Users(Id),
    CONSTRAINT FK_Notifications_Recipient FOREIGN KEY (RecipientId) REFERENCES dbo.Users(Id),
    CONSTRAINT FK_Notifications_Article FOREIGN KEY (ArticleId) REFERENCES dbo.Articles(Id)
);
GO