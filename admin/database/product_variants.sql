-- Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_name VARCHAR(255) NOT NULL, -- e.g., "10 kg", "2 kg", "1 kg"
    variant_price NUMERIC(10,2) NOT NULL,
    variant_old_price NUMERIC(10,2),
    variant_discount INTEGER DEFAULT 0,
    variant_stock INTEGER DEFAULT 0,
    variant_weight VARCHAR(50), -- e.g., "10 kg", "2 kg"
    variant_unit VARCHAR(20) DEFAULT 'kg', -- kg, gm, ltr, ml, piece
    is_default BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(active);