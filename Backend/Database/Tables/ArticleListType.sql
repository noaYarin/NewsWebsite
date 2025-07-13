CREATE TYPE dbo.ArticleListType AS TABLE
(
    Title       NVARCHAR(500),
    Url         NVARCHAR(MAX),
    Description NVARCHAR(MAX),
    ImageUrl    NVARCHAR(MAX),
    Author      NVARCHAR(255),
    SourceName  NVARCHAR(255),
    PublishedAt DATETIME2
);
GO