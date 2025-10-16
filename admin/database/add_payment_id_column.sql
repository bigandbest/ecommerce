-- Run this in Supabase SQL Editor to add the payment_id column
-- This column acts as an alias/backup for razorpay_payment_id for backward compatibility

-- Add payment_id column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id VARCHAR(100);

-- Create a trigger to automatically sync payment_id with razorpay_payment_id
CREATE OR REPLACE FUNCTION sync_payment_id()
RETURNS TRIGGER AS $$
BEGIN
    -- If razorpay_payment_id is set, copy it to payment_id
    IF NEW.razorpay_payment_id IS NOT NULL THEN
        NEW.payment_id = NEW.razorpay_payment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT operations
DROP TRIGGER IF EXISTS trigger_sync_payment_id_insert ON orders;
CREATE TRIGGER trigger_sync_payment_id_insert
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION sync_payment_id();

-- Create trigger for UPDATE operations
DROP TRIGGER IF EXISTS trigger_sync_payment_id_update ON orders;
CREATE TRIGGER trigger_sync_payment_id_update
    BEFORE UPDATE ON orders
    FOR EACH ROW
    WHEN (OLD.razorpay_payment_id IS DISTINCT FROM NEW.razorpay_payment_id)
    EXECUTE FUNCTION sync_payment_id();

-- Backfill existing data: copy razorpay_payment_id to payment_id for existing records
UPDATE orders 
SET payment_id = razorpay_payment_id 
WHERE razorpay_payment_id IS NOT NULL AND payment_id IS NULL;

-- Verify the update
SELECT COUNT(*) as total_orders, 
       COUNT(payment_id) as orders_with_payment_id,
       COUNT(razorpay_payment_id) as orders_with_razorpay_payment_id
FROM orders;
