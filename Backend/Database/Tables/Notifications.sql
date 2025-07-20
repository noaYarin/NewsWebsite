CREATE TABLE Notifications (
    Id INT PRIMARY KEY IDENTITY(1,1),
    RecipientId INT NOT NULL,
    SenderId INT,
    NotificationType NVARCHAR(50) NOT NULL,
    RelatedEntityId INT,
    Message NVARCHAR(255),
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Notifications_Recipient FOREIGN KEY (RecipientId) REFERENCES Users(Id),
    CONSTRAINT FK_Notifications_Sender FOREIGN KEY (SenderId) REFERENCES Users(Id)
);
GO