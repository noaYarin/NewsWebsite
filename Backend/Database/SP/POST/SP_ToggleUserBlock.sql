-- Replaces both SP_BlockUser and SP_UnblockUser
CREATE PROCEDURE [dbo].[SP_ToggleUserBlock]
    @UserId INT,
    @BlockedUserId INT,
    @IsBlocked BIT OUTPUT -- Output parameter to tell us the new state
AS
BEGIN
    SET NOCOUNT ON;

    -- A user cannot block themselves
    IF @UserId = @BlockedUserId
    BEGIN
        SET @IsBlocked = 0; -- A user is never considered blocked by themselves
        RETURN;
    END

    -- Check if the block already exists
    IF EXISTS (SELECT 1 FROM UserBlocks WHERE UserId = @UserId AND BlockedUserId = @BlockedUserId)
    BEGIN
        -- If it exists, remove it (Unblock)
        DELETE FROM UserBlocks WHERE UserId = @UserId AND BlockedUserId = @BlockedUserId;
        SET @IsBlocked = 0; -- The user is now unblocked
    END
    ELSE
    BEGIN
        -- If it doesn't exist, add it (Block)
        INSERT INTO UserBlocks (UserId, BlockedUserId) VALUES (@UserId, @BlockedUserId);
        SET @IsBlocked = 1; -- The user is now blocked
    END
END
GO