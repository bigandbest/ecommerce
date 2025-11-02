-- Insert sample groups for Pet Care subcategory
INSERT INTO groups (name, description, icon, image_url, subcategory_id, featured, active, sort_order) VALUES 
('Dog Food', 'Premium dog food and treats', '🐕', null, 'ada8a78d-7ea1-4219-8794-f25eafa831a7', true, true, 0),
('Cat Food', 'Nutritious cat food and snacks', '🐱', null, 'ada8a78d-7ea1-4219-8794-f25eafa831a7', true, true, 1),
('Pet Toys', 'Fun toys for your pets', '🎾', null, 'ada8a78d-7ea1-4219-8794-f25eafa831a7', false, true, 2),
('Pet Accessories', 'Collars, leashes, and more', '🦴', null, 'ada8a78d-7ea1-4219-8794-f25eafa831a7', false, true, 3);