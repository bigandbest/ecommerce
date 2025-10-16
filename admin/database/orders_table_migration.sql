-- Migration to add missing payment and shipping fields to orders table
-- This fixes the "column orders.payment_id does not exist" error in cancelOrder function

-- Add payment-related columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(200);

-- Add shipping address detail columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_house_number VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_street_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_suite_unit_floor VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_locality VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_area VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_country VARCHAR(50) DEFAULT 'India';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_landmark TEXT;

-- Add GPS location columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_latitude DECIMAL(10,8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_longitude DECIMAL(11,8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_gps_address TEXT;

-- Add payment_id column for backward compatibility (alias for razorpay_payment_id)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id VARCHAR(100);
-- Create a trigger to keep payment_id in sync with razorpay_payment_id
CREATE OR REPLACE FUNCTION sync_payment_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.razorpay_payment_id IS NOT NULL THEN
        NEW.payment_id = NEW.razorpay_payment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_payment_id
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION sync_payment_id();