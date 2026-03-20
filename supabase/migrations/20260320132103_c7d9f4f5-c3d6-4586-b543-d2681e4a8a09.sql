
-- Add credits tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS free_credits_used integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_free_credits integer NOT NULL DEFAULT 3;
