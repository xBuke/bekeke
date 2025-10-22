-- Add Stripe columns to service_providers table
-- This migration adds support for Stripe Connect integration

ALTER TABLE service_providers ADD COLUMN stripe_account_id TEXT;
ALTER TABLE service_providers ADD COLUMN stripe_onboarding_complete BOOLEAN DEFAULT false;
