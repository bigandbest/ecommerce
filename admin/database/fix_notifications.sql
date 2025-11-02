-- Fix notifications table structure
-- Run this script to ensure the table has all required columns

-- First, check if the table exists and add missing columns if needed
DO $$ 
BEGIN
    -- Add is_read column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'is_read') THEN
        ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add read_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
        ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP;
    END IF;
    
    -- Add user_id column if it doesn't exist (for user-specific notifications)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'user_id') THEN
        ALTER TABLE notifications ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add related_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'related_id') THEN
        ALTER TABLE notifications ADD COLUMN related_id UUID;
    END IF;
    
    -- Add related_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'related_type') THEN
        ALTER TABLE notifications ADD COLUMN related_type VARCHAR(50);
    END IF;
    
    -- Add notification_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'notification_type') THEN
        ALTER TABLE notifications ADD COLUMN notification_type VARCHAR(20) DEFAULT 'user' CHECK (notification_type IN ('user', 'admin'));
    END IF;
END $$;

-- Update existing notifications to have is_read = false if null
UPDATE notifications SET is_read = FALSE WHERE is_read IS NULL;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(related_type);

-- Create or replace the trigger function for read_at timestamp
CREATE OR REPLACE FUNCTION update_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
        NEW.read_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_notification_read_at ON notifications;
CREATE TRIGGER trigger_notification_read_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_read_at();