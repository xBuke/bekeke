-- Ekstenzije
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM tipovi
CREATE TYPE user_role AS ENUM ('klijent', 'partner', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'refunded', 'failed');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- 1. Korisnici (proširenje Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'klijent',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Gradovi
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Kategorije usluga
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- emoji ili icon name
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Partneri usluga (profili)
CREATE TABLE service_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name TEXT,
  oib TEXT NOT NULL,
  description TEXT,
  verification_status verification_status DEFAULT 'pending',
  id_card_url TEXT, -- URL osobne (Supabase Storage)
  profile_photo_url TEXT,
  emergency_available BOOLEAN DEFAULT false,
  emergency_fee DECIMAL(10,2), -- dodatna naknada za hitne intervencije
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Kategorije pružatelja (many-to-many)
CREATE TABLE provider_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(provider_id, category_id)
);

-- 6. Lokacije pružatelja (many-to-many)
CREATE TABLE provider_cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(provider_id, city_id)
);

-- 7. Usluge (pricing)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price_type TEXT CHECK (price_type IN ('hourly', 'fixed')) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER, -- ako je fixed, koliko traje
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Radno vrijeme
CREATE TABLE working_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6) NOT NULL, -- 0=Nedjelja, 6=Subota
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  UNIQUE(provider_id, day_of_week)
);

-- 9. Galerija radova
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  is_emergency BOOLEAN DEFAULT false,
  status booking_status DEFAULT 'pending',
  client_notes TEXT,
  provider_notes TEXT,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL, -- 7%
  provider_amount DECIMAL(10,2) NOT NULL, -- 93%
  payment_method TEXT CHECK (payment_method IN ('stripe', 'paypal')) NOT NULL,
  payment_intent_id TEXT, -- Stripe/PayPal ID
  status payment_status DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  payout_at TIMESTAMPTZ, -- kada je pružatelj dobio novac
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Recenzije (FAZA 2, ali kreiraj tablicu odmah)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Admin akcije log
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id) NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'provider', 'booking', 'payment'
  target_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEKSI za performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_providers_verification ON service_providers(verification_status);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(requested_date);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_provider_categories ON provider_categories(provider_id, category_id);
CREATE INDEX idx_provider_cities ON provider_cities(provider_id, city_id);

-- Row Level Security (RLS) - osnovno, detaljnije kasnije
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Osnovne RLS policies (za autentificirane korisnike)
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
