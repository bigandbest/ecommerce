-- Migration to create video_cards table for video management
-- This table will store video links and metadata for the homepage video section

CREATE TABLE IF NOT EXISTS public.video_cards (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    active BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.video_cards IS 'Stores video cards for homepage video section';
COMMENT ON COLUMN public.video_cards.title IS 'Title of the video card';
COMMENT ON COLUMN public.video_cards.description IS 'Optional description for the video';
COMMENT ON COLUMN public.video_cards.video_url IS 'URL of the video (YouTube, Vimeo, or direct video link)';
COMMENT ON COLUMN public.video_cards.thumbnail_url IS 'Optional thumbnail image URL for the video';
COMMENT ON COLUMN public.video_cards.active IS 'Whether the video card is active/enabled';
COMMENT ON COLUMN public.video_cards.position IS 'Display order of the video card';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_video_cards_active ON public.video_cards (active);
CREATE INDEX IF NOT EXISTS idx_video_cards_position ON public.video_cards (position);

-- Enable Row Level Security
ALTER TABLE public.video_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (videos should be publicly viewable)
DROP POLICY IF EXISTS "Public video cards are viewable by everyone" ON public.video_cards;
CREATE POLICY "Public video cards are viewable by everyone"
ON public.video_cards FOR SELECT
USING (true);

-- Create policies for admin access
DROP POLICY IF EXISTS "Admins can manage video cards" ON public.video_cards;
CREATE POLICY "Admins can manage video cards"
ON public.video_cards FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');