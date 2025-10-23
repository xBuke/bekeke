-- Migration to update user roles from 'pruzatelj' to 'partner'
-- This migration updates the user_role enum and existing data

-- First, update existing data
UPDATE users SET role = 'partner' WHERE role = 'pruzatelj';

-- Note: In production, you would need to:
-- 1. Create a new enum with 'partner' instead of 'pruzatelj'
-- 2. Update the column to use the new enum
-- 3. Drop the old enum
-- This is a complex operation that should be done carefully in production

-- For development, you can recreate the database with the new schema
