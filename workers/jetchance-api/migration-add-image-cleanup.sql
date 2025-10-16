-- Add image_cleanup_date column to flights table for auto-deletion
-- This tracks when images should be deleted (30 days after flight departure)

ALTER TABLE flights ADD COLUMN image_cleanup_date DATETIME;

-- Create index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_flights_cleanup ON flights(image_cleanup_date);

-- Notes:
-- image_cleanup_date will be set to departure_datetime + 30 days
-- A scheduled worker will run daily to:
--   1. Find flights where image_cleanup_date < NOW()
--   2. Delete images from R2
--   3. Set images = '[]' in database
--   4. Keep flight record for history
