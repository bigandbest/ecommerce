-- Create shop_by_stores table
CREATE TABLE IF NOT EXISTS shop_by_stores (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    subtitle VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data
INSERT INTO shop_by_stores (title, image_url, subtitle) VALUES
('Office', '/office.png', 'Work Essentials'),
('Essentials', '/basket.png', 'Daily Needs'),
('Grocery', '/prod6.png', 'Fresh Items'),
('Electronics', '/prod7.png', 'Tech Gadgets'),
('Home', '/prod8.png', 'Living Space'),
('Sports', '/football.png', 'Fitness Gear'),
('Health', '/protien.png', 'Wellness'),
('Fashion', '/women1.png', 'Style & Trends'),
('Tech', '/phone.png', 'Latest Tech');