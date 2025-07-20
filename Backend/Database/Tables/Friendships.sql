CREATE TABLE Friendships (
    UserOneId INT NOT NULL,
    UserTwoId INT NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    ActionUserId INT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Friendships PRIMARY KEY (UserOneId, UserTwoId),
    CONSTRAINT FK_Friendships_UserOne FOREIGN KEY (UserOneId) REFERENCES Users(Id),
    CONSTRAINT FK_Friendships_UserTwo FOREIGN KEY (UserTwoId) REFERENCES Users(Id),
    CONSTRAINT FK_Friendships_ActionUser FOREIGN KEY (ActionUserId) REFERENCES Users(Id),
    CONSTRAINT CHK_FriendshipUsers CHECK (UserOneId < UserTwoId)
);
GO