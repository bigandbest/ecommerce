-- Store Section Mappings Migration
-- This creates tables for mapping stores to sections and products to sections

-- Create store_section_mappings table
CREATE TABLE IF NOT EXISTS store_section_mappings (
    id SERIAL PRIMARY KEY,
    store_id UUID REFERENCES recommended_store(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES product_sections(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    mapping_type VARCHAR(50) NOT NULL CHECK (mapping_type IN ('store_section', 'section_product')),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure either store_id or product_id is set based on mapping_type
    CONSTRAINT check_mapping_type_consistency CHECK (
        (mapping_type = 'store_section' AND store_id IS NOT NULL AND product_id IS NULL) OR
        (mapping_type = 'section_product' AND product_id IS NOT NULL)
    )
);

-- Add description column to recommended_store if not exists
ALTER TABLE recommended_store 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add brand_name and store_id columns to products if not exists  
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES recommended_store(id) ON DELETE SET NULL;

-- Create updated_at trigger for store_section_mappings
DROP TRIGGER IF EXISTS update_store_section_mappings_updated_at ON store_section_mappings;
CREATE TRIGGER update_store_section_mappings_updated_at
    BEFORE UPDATE ON store_section_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create unique constraints to prevent duplicate mappings
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_store_section_mapping 
    ON store_section_mappings(store_id, section_id, mapping_type) 
    WHERE mapping_type = 'store_section';

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_section_product_mapping 
    ON store_section_mappings(section_id, product_id, mapping_type) 
    WHERE mapping_type = 'section_product';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_store_section_mappings_store_id ON store_section_mappings(store_id);
CREATE INDEX IF NOT EXISTS idx_store_section_mappings_section_id ON store_section_mappings(section_id);
CREATE INDEX IF NOT EXISTS idx_store_section_mappings_product_id ON store_section_mappings(product_id);
CREATE INDEX IF NOT EXISTS idx_store_section_mappings_type ON store_section_mappings(mapping_type);
CREATE INDEX IF NOT EXISTS idx_store_section_mappings_active ON store_section_mappings(is_active);
CREATE INDEX IF NOT EXISTS idx_store_section_mappings_type_active ON store_section_mappings(mapping_type, is_active);

-- Create index for products brand and store
CREATE INDEX IF NOT EXISTS idx_products_brand_name ON products(brand_name);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);

-- Display success message
SELECT 'Store section mappings tables created successfully!' as message;