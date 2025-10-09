-- RETURN/REFUND ORDERS TABLE
CREATE TABLE IF NOT EXISTS return_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    return_type VARCHAR(20) NOT NULL CHECK (return_type IN ('return', 'cancellation')),
    reason VARCHAR(500) NOT NULL,
    additional_details TEXT,
    bank_account_holder_name VARCHAR(100) NOT NULL,
    bank_account_number VARCHAR(50) NOT NULL,
    bank_ifsc_code VARCHAR(20) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    refund_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed')),
    admin_notes TEXT,
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_return_orders_order_id ON return_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_return_orders_user_id ON return_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_return_orders_status ON return_orders(status);
CREATE INDEX IF NOT EXISTS idx_return_orders_created_at ON return_orders(created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_return_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_return_orders_updated_at
    BEFORE UPDATE ON return_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_return_orders_updated_at();

-- RETURN ORDER ITEMS TABLE (for partial returns)
CREATE TABLE IF NOT EXISTS return_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_order_id UUID REFERENCES return_orders(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    return_reason VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for return order items
CREATE INDEX IF NOT EXISTS idx_return_order_items_return_order_id ON return_order_items(return_order_id);
CREATE INDEX IF NOT EXISTS idx_return_order_items_order_item_id ON return_order_items(order_item_id);

-- Add constraint to ensure returned quantity doesn't exceed ordered quantity
-- This will be handled at application level for better error messages

-- Create view for easy data retrieval
CREATE OR REPLACE VIEW return_orders_detailed AS
SELECT 
    ro.*,
    o.status as order_status,
    o.total as order_total,
    o.created_at as order_date,
    o.address as delivery_address,
    u.name as user_name,
    u.email as user_email,
    u.phone as user_phone,
    admin_u.name as admin_name
FROM return_orders ro
LEFT JOIN orders o ON ro.order_id = o.id
LEFT JOIN users u ON ro.user_id = u.id
LEFT JOIN users admin_u ON ro.admin_id = admin_u.id;

-- Add some sample data for testing (optional)
-- INSERT INTO return_orders (order_id, user_id, return_type, reason, bank_account_holder_name, bank_account_number, bank_ifsc_code, bank_name, refund_amount)
-- VALUES ('sample-order-id', 'sample-user-id', 'return', 'Product not as expected', 'John Doe', '1234567890', 'SBIN0001234', 'State Bank of India', 999.00);