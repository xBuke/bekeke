-- Enhanced Row Level Security (RLS) Policies
-- This file contains comprehensive security policies for all tables

-- Enable RLS on all tables that don't have it yet
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Drop existing basic policies to replace with enhanced ones
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Enhanced Users table policies
CREATE POLICY "Users can read own and provider profiles"
  ON users FOR SELECT
  USING (
    auth.uid() = id OR 
    role = 'pruzatelj'
  );

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Service providers policies
CREATE POLICY "Anyone can read verified providers"
  ON service_providers FOR SELECT
  USING (verification_status = 'verified');

CREATE POLICY "Providers can read own profile"
  ON service_providers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Providers can update own profile"
  ON service_providers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Providers can insert own profile"
  ON service_providers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Bookings policies
CREATE POLICY "Clients can read own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Providers can read own bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM service_providers WHERE id = provider_id
    )
  );

CREATE POLICY "Clients can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Providers can update own bookings"
  ON bookings FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM service_providers WHERE id = provider_id
    )
  );

-- Payments policies - only for involved parties
CREATE POLICY "Payment visibility"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id AND (
        b.client_id = auth.uid() OR
        b.provider_id IN (
          SELECT id FROM service_providers WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Payment updates by involved parties"
  ON payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id AND (
        b.client_id = auth.uid() OR
        b.provider_id IN (
          SELECT id FROM service_providers WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Categories - public read access
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  USING (true);

-- Cities - public read access
CREATE POLICY "Anyone can read cities"
  ON cities FOR SELECT
  USING (true);

-- Services policies
CREATE POLICY "Anyone can read services of verified providers"
  ON services FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE verification_status = 'verified'
    )
  );

CREATE POLICY "Providers can manage own services"
  ON services FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM service_providers WHERE id = provider_id
    )
  );

-- Working hours policies
CREATE POLICY "Anyone can read working hours of verified providers"
  ON working_hours FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE verification_status = 'verified'
    )
  );

CREATE POLICY "Providers can manage own working hours"
  ON working_hours FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM service_providers WHERE id = provider_id
    )
  );

-- Gallery images policies
CREATE POLICY "Anyone can read gallery of verified providers"
  ON gallery_images FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE verification_status = 'verified'
    )
  );

CREATE POLICY "Providers can manage own gallery"
  ON gallery_images FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM service_providers WHERE id = provider_id
    )
  );

-- Provider categories policies
CREATE POLICY "Anyone can read provider categories"
  ON provider_categories FOR SELECT
  USING (true);

CREATE POLICY "Providers can manage own categories"
  ON provider_categories FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM service_providers WHERE id = provider_id
    )
  );

-- Provider cities policies
CREATE POLICY "Anyone can read provider cities"
  ON provider_cities FOR SELECT
  USING (true);

CREATE POLICY "Providers can manage own cities"
  ON provider_cities FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM service_providers WHERE id = provider_id
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Clients can create reviews for own bookings"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id AND b.client_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = client_id);

-- Admin actions policies - only admins
CREATE POLICY "Only admins can read admin actions"
  ON admin_actions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can create admin actions"
  ON admin_actions FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );
