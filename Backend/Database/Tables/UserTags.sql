IF OBJECT_ID('dbo.UserTags', 'U') IS NOT NULL
  DROP TABLE dbo.UserTags;
GO

CREATE TABLE UserTags (
    UserId INT NOT NULL,
    TagId INT NOT NULL,
    PRIMARY KEY (UserId, TagId),
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (TagId) REFERENCES Tags(Id)
);
GO