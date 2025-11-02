-- Migration to add missing fields to add_banner table for centralized banner management
-- This makes add_banner table compatible with frontend banner requirements

ALTER TABLE public.add_banner
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS link TEXT,
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS is_mobile BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.add_banner.description IS 'Optional description for the banner';
COMMENT ON COLUMN public.add_banner.link IS 'Optional redirect link for the banner';
COMMENT ON COLUMN public.add_banner.active IS 'Whether the banner is active/enabled';
COMMENT ON COLUMN public.add_banner.position IS 'Banner position/placement (hero, featured, etc.)';
COMMENT ON COLUMN public.add_banner.is_mobile IS 'Whether this banner is for mobile devices';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_add_banner_active ON public.add_banner (active);
CREATE INDEX IF NOT EXISTS idx_add_banner_banner_type ON public.add_banner (banner_type);
CREATE INDEX IF NOT EXISTS idx_add_banner_position ON public.add_banner (position);

-- Enable Row Level Security if not already enabled
ALTER TABLE public.add_banner ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (banners should be publicly viewable)
DROP POLICY IF EXISTS "Public banners are viewable by everyone" ON public.add_banner;
CREATE POLICY "Public banners are viewable by everyone"
ON public.add_banner FOR SELECT
USING (true);

-- Create policies for admin access
DROP POLICY IF EXISTS "Admins can manage banners" ON public.add_banner;
CREATE POLICY "Admins can manage banners"
ON public.add_banner FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');