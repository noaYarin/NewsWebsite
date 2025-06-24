CREATE TABLE UserArticles (
    UserId INT,
    ArticleId INT,
    PRIMARY KEY (UserId, ArticleId),
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (ArticleId) REFERENCES Articles(Id)
);