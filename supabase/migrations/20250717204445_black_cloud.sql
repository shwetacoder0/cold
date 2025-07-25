/*
  # Create user profiles and documents tables

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `input_text` (text, raw user input)
      - `user_details` (text, processed/summarized user info)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `document_name` (text, original filename)
      - `document_type` (text, file type)
      - `file_size` (integer, size in bytes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own data
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  input_text text DEFAULT '',
  user_details text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_name text NOT NULL,
  document_type text DEFAULT '',
  file_size integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- Create unique constraint for user_profiles
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_user_id_key ON user_profiles(user_id);

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for user_documents
CREATE POLICY "Users can view their own documents"
  ON user_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON user_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON user_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add subscription fields to user_tokens table
ALTER TABLE public.user_tokens
ADD COLUMN subscription_start TIMESTAMPTZ DEFAULT now(),
ADD COLUMN subscription_end TIMESTAMPTZ DEFAULT now() + INTERVAL '1 month',
ADD COLUMN monthly_tokens INTEGER DEFAULT 5,
ADD COLUMN tokens_reset_date TIMESTAMPTZ DEFAULT now() + INTERVAL '1 month';

-- Update existing free tier users to have 5 tokens
UPDATE public.user_tokens
SET
  tokens = 5,
  monthly_tokens = 5,
  subscription_start = now(),
  subscription_end = now() + INTERVAL '1 month',
  tokens_reset_date = now() + INTERVAL '1 month'
WHERE plan = 'free';

-- Create a function to reset tokens monthly
CREATE OR REPLACE FUNCTION reset_monthly_tokens()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if subscription has ended
  IF NEW.subscription_end <= NOW() THEN
    -- Reset to free plan
    NEW.plan := 'free';
    NEW.monthly_tokens := 5;
    NEW.tokens := 5;
    NEW.subscription_start := NOW();
    NEW.subscription_end := NOW() + INTERVAL '1 month';
    NEW.tokens_reset_date := NOW() + INTERVAL '1 month';
  -- Check if it's time for monthly token reset
  ELSIF NEW.tokens_reset_date <= NOW() THEN
    -- Reset tokens to monthly allocation
    NEW.tokens := NEW.monthly_tokens;
    NEW.tokens_reset_date := NOW() + INTERVAL '1 month';
  END IF;

  -- Update the updated_at timestamp
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to reset tokens monthly
CREATE TRIGGER reset_monthly_tokens_trigger
  BEFORE UPDATE ON public.user_tokens
  FOR EACH ROW
  EXECUTE FUNCTION reset_monthly_tokens();
