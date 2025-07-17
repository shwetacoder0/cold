/*
  # Create user_tokens table

  1. New Tables
    - `user_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users, unique)
      - `tokens` (integer, default 5)
      - `plan` (text, default 'free')
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `user_tokens` table
    - Add policy for users to view their own tokens
    - Add policy for users to update their own tokens
    - Add policy for new users to create their token entry

  3. Extensions
    - Enable uuid-ossp extension for UUID generation
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the user_tokens table
CREATE TABLE IF NOT EXISTS public.user_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  tokens INTEGER NOT NULL DEFAULT 5,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own tokens" 
  ON public.user_tokens
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" 
  ON public.user_tokens
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "New users can create their token entry" 
  ON public.user_tokens
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create an index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON public.user_tokens(user_id);