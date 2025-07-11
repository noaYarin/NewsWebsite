-- First, drop the old procedure
IF OBJECT_ID('SP_InsertTag', 'P') IS NOT NULL
  DROP PROCEDURE SP_InsertTag;
GO

-- Recreate the procedure with the lowercase logic
CREATE PROCEDURE SP_InsertTag
    @Name NVARCHAR(100),
    @ImageUrl NVARCHAR(500)
AS
BEGIN
    -- Convert the incoming tag name to all lowercase
    SET @Name = LOWER(@Name);

    -- The rest of the logic remains the same
    IF NOT EXISTS (SELECT 1 FROM Tags WHERE Name = @Name)
    BEGIN
        INSERT INTO Tags (Name, ImageUrl)
        VALUES (@Name, @ImageUrl);
        
        SELECT 1; -- Success
    END
    ELSE
    BEGIN
        SELECT 0; -- Tag already exists
    END
END
GO