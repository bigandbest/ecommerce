-- Bulk Order Tables Migration
-- Creates tables for bulk order enquiries and wholesale bulk orders

-- 1. Bulk Order Enquiries Table (B2B enquiries)
CREATE TABLE IF NOT EXISTS bulk_order_enquiries (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    description TEXT,
    expected_price VARCHAR(100),
    delivery_timeline VARCHAR(100),
    gst_number VARCHAR(50),
    address TEXT NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Rejected')),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Wholesale Bulk Orders Table (integrated checkout bulk orders)
CREATE TABLE IF NOT EXISTS wholesale_bulk_orders (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    total_price DECIMAL(10,2) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    company_name VARCHAR(255),
    gst_number VARCHAR(50),
    
    -- Shipping Address
    shipping_first_name VARCHAR(100) NOT NULL,
    shipping_last_name VARCHAR(100) NOT NULL,
    shipping_full_address TEXT NOT NULL,
    shipping_apartment VARCHAR(100),
    shipping_city VARCHAR(100) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL DEFAULT 'India',
    shipping_state VARCHAR(100) NOT NULL,
    shipping_zip_code VARCHAR(20) NOT NULL,
    
    -- Billing Address
    billing_first_name VARCHAR(100),
    billing_last_name VARCHAR(100),
    billing_full_address TEXT,
    billing_apartment VARCHAR(100),
    billing_city VARCHAR(100),
    billing_country VARCHAR(100),
    billing_state VARCHAR(100),
    billing_zip_code VARCHAR(20),
    
    payment_status VARCHAR(50) DEFAULT 'PAYMENT_PENDING' CHECK (payment_status IN ('PAYMENT_PENDING', 'PAYMENT_COMPLETED')),
    order_status VARCHAR(50) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Wholesale Bulk Order Items Table
CREATE TABLE IF NOT EXISTS wholesale_bulk_order_items (
    id SERIAL PRIMARY KEY,
    wholesale_bulk_order_id INTEGER REFERENCES wholesale_bulk_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_bulk_order BOOLEAN DEFAULT TRUE,
    bulk_range VARCHAR(100),
    original_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Add bulk order fields to existing orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_bulk_order BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bulk_order_type VARCHAR(50); -- 'enquiry' or 'integrated'
ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gst_number VARCHAR(50);

-- 5. Add bulk order fields to existing order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_bulk_order BOOLEAN DEFAULT FALSE;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS bulk_range VARCHAR(100);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bulk_enquiries_status ON bulk_order_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_bulk_enquiries_created_at ON bulk_order_enquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_wholesale_bulk_orders_user_id ON wholesale_bulk_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_bulk_orders_created_at ON wholesale_bulk_orders(created_at);

-- 7. Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bulk_enquiries_updated_at
    BEFORE UPDATE ON bulk_order_enquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wholesale_bulk_orders_updated_at
    BEFORE UPDATE ON wholesale_bulk_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();