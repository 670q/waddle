-- Drop the old constraint
ALTER TABLE public.announcements DROP CONSTRAINT announcements_target_audience_check;

-- Add the new constraint with more options
ALTER TABLE public.announcements ADD CONSTRAINT announcements_target_audience_check 
CHECK (target_audience IN ('all', 'free', 'premium', 'active', 'inactive'));
