-- Add seen_guided_tour column to farmers table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'farmers'
        AND column_name = 'seen_guided_tour'
    ) THEN
        ALTER TABLE farmers
        ADD COLUMN seen_guided_tour BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Update existing records to have seen_guided_tour = true
-- This ensures only new users will see the tour by default
UPDATE farmers
SET seen_guided_tour = TRUE
WHERE seen_guided_tour IS NULL;

-- Add comment to the column
COMMENT ON COLUMN farmers.seen_guided_tour IS 'Indicates whether the farmer has seen the guided tour';
