CREATE TABLE [dbo].[UserBlocks](
    [UserId] [int] NOT NULL,
    [BlockedUserId] [int] NOT NULL,
    CONSTRAINT [PK_UserBlocks] PRIMARY KEY CLUSTERED ([UserId] ASC, [BlockedUserId] ASC)
);
GO

ALTER TABLE [dbo].[UserBlocks] WITH CHECK
ADD CONSTRAINT [FK_UserBlocks_Users_Blocking] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])
ON DELETE CASCADE;
GO

ALTER TABLE [dbo].[UserBlocks] CHECK CONSTRAINT [FK_UserBlocks_Users_Blocking];
GO

ALTER TABLE [dbo].[UserBlocks] WITH CHECK
ADD CONSTRAINT [FK_UserBlocks_Users_Blocked] FOREIGN KEY([BlockedUserId])
REFERENCES [dbo].[Users] ([Id]);
GO

ALTER TABLE [dbo].[UserBlocks] CHECK CONSTRAINT [FK_UserBlocks_Users_Blocked];
GO