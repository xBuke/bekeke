-- Run this in Supabase SQL Editor after registering a user via app or Auth
-- Replace the email below with your admin's email address
UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';


