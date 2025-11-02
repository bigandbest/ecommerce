-- Create daily_deals_product table for mapping products to daily deals
CREATE TABLE IF NOT EXISTS daily_deals_product (
    id SERIAL PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    daily_deal_id INTEGER NOT NULL REFERENCES daily_deals(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, daily_deal_id)
);