-- Create bnb table
CREATE TABLE IF NOT EXISTS bnb (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url TEXT
);