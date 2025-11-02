-- Add is_active column to recommended_store table
ALTER TABLE recommended_store ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;

-- Ensure only 8 stores can be active (this is enforced in application logic)
-- You can add a trigger or check in app code