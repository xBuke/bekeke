# USLUGO - PLATFORMA ZA LOKALNE USLUŽNE DJELATNOSTI - MVP

## 🎯 PROJEKT OVERVIEW

**Cilj:** Platforma koja povezuje partnere lokalnih usluga s klijentima u Hrvatskoj.

**Lokacije:** Split, Zagreb, Rijeka, Osijek, Dubrovnik

**Tech Stack:**
- Frontend: Next.js 14+ (App Router)
- Backend: Next.js API Routes (Node.js)
- Database: Supabase (PostgreSQL)
- Auth: NextAuth.js
- Payments: Stripe + PayPal
- Storage: Supabase Storage
- Hosting: Vercel
- Styling: Tailwind CSS + shadcn/ui

---

## ⚠️ KRITIČNA PRAVILA ZA CURSOR

### 🚫 ŠTO **NE** SMIJE RADITI:

1. **NE dodavati features** koji nisu eksplicitno navedeni u ovom README-u
2. **NE implementirati** real-time chat, push notifikacije, advanced analytics
3. **NE raditi** prekomplicirana rješenja - drži se KISS principa
4. **NE skakati** unaprijed - radi **TOČNO ONO ŠTO JE TRAŽENO** u trenutnom stepu
5. **NE halucinirati** dodatne funkcionalnosti "jer bi bile korisne"
6. **NE mijenjati** database schemu bez eksplicitne dozvole
7. **NE koristiti** zewne biblioteke bez provjere (osim onih navedenih u tech stacku)

### ✅ ŠTO **MORA** RADITI:

1. **Pitati** za clarification ako nešto nije jasno
2. **Slijediti** development roadmap korak po korak
3. **Komentirati** ključne dijelove koda na hrvatskom
4. **Testirati** svaki feature prije nego prijeđe na sljedeći
5. **Držati kod** jednostavnim i čitljivim
6. **Fokusirati se** samo na trenutni prompt/task

---

## 🗺️ DEVELOPMENT ROADMAP

### FAZA 1: SETUP & FOUNDATION (Promptovi 1-5)
### FAZA 2: CORE FEATURES (Promptovi 6-15)
### FAZA 3: PAYMENTS & BOOKINGS (Promptovi 16-22)
### FAZA 4: ADMIN & POLISH (Promptovi 23-28)

---

## 📋 DETALJNI DEVELOPMENT PLAN

### FAZA 1: SETUP & FOUNDATION

#### ✅ PROMPT 1: Inicijalizacija projekta
**Zadatak:** Setup Next.js projekta s Tailwind i shadcn/ui

**Akcije:**
```bash
# Kreiraj Next.js projekt
npx create-next-app@latest marketplace-mvp --typescript --tailwind --app --no-src-dir

# Setup shadcn/ui
npx shadcn-ui@latest init
```

**Struktura foldera:**
```
marketplace-mvp/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── admin/
│   │   ├── klijent/
│   │   └── pruzatelj/
│   ├── usluge/
│   │   └── [kategorija]/
│   │       └── [grad]/
│   ├── api/
│   │   └── auth/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn komponente)
│   ├── layout/
│   ├── forms/
│   └── shared/
├── lib/
│   ├── supabase/
│   ├── stripe/
│   └── utils/
├── types/
│   └── index.ts
└── public/
```

**Provjera:** Projekt se buildeа i pokreće bez grešaka

---

#### ✅ PROMPT 2: Supabase setup
**Zadatak:** Konfiguracija Supabase projekta i .env varijabli

**Akcije:**
1. Napravi Supabase projekt na https://supabase.com
2. Kreiraj `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tvoj-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tvoj-anon-key
SUPABASE_SERVICE_ROLE_KEY=tvoj-service-role-key

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generiraj-random-secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Instaliraj pakete:
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

4. Kreiraj `lib/supabase/client.ts`:
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()
```

**Provjera:** Supabase client se uspješno konektuje

---

#### ✅ PROMPT 3: Database Schema - Tablice
**Zadatak:** Kreiranje svih potrebnih tablica u Supabase SQL Editoru

**VAŽNO:** Kopiraj TOČNO ovaj SQL u Supabase SQL Editor:

```sql
-- Ekstenzije
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM tipovi
CREATE TYPE user_role AS ENUM ('klijent', 'pruzatelj', 'admin');
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

-- 4. Pružatelji usluga (profili)
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
```

**Dodatno - Seed data za testiranje:**
```sql
-- Gradovi
INSERT INTO cities (name, slug) VALUES
('Split', 'split'),
('Zagreb', 'zagreb'),
('Rijeka', 'rijeka'),
('Osijek', 'osijek'),
('Dubrovnik', 'dubrovnik');

-- Kategorije
INSERT INTO categories (name, slug, description, icon) VALUES
('Vodoinstalater', 'vodoinstalater', 'Popravak vodovodnih instalacija, slavina, WC-a', '🚰'),
('Električar', 'elektricar', 'Električne instalacije, popravci, ugradnja', '⚡'),
('Bravar', 'bravar', 'Otvaranje vrata, brave, metalni radovi', '🔐'),
('Keramičar', 'keramicar', 'Postavljanje pločica, keramike, sanacije', '🧱'),
('Soboslikar', 'soboslikar', 'Bojanje zidova, fasada, dekorativne tehnike', '🎨'),
('Čistačica', 'cisticica', 'Čišćenje stanova, kuća, ureda', '🧹'),
('Dadilja', 'dadilja', 'Čuvanje djece, pomoć s domaćim zadacima', '👶'),
('Instruktor', 'instruktor', 'Privatne instrukcije iz različitih predmeta', '📚'),
('IT stručnjak', 'it-strucnjak', 'Računala, mreže, održavanje', '💻'),
('Frizer', 'frizer', 'Šišanje, frizure, styling', '💇');
```

**Provjera:** Sve tablice kreirane bez errora u Supabase Dashboard

---

#### ✅ PROMPT 4: TypeScript tipovi
**Zadatak:** Definicija svih TypeScript interfaceova

Kreiraj `types/index.ts`:

```typescript
// Database enums
export type UserRole = 'klijent' | 'pruzatelj' | 'admin';
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'refunded' | 'failed';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type PriceType = 'hourly' | 'fixed';
export type PaymentMethod = 'stripe' | 'paypal';

// Database tables
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  created_at: string;
}

export interface ServiceProvider {
  id: string;
  user_id: string;
  business_name?: string;
  oib: string;
  description?: string;
  verification_status: VerificationStatus;
  id_card_url?: string;
  profile_photo_url?: string;
  emergency_available: boolean;
  emergency_fee?: number;
  created_at: string;
  updated_at: string;
  // Relations
  user?: User;
  categories?: Category[];
  cities?: City[];
  services?: Service[];
  working_hours?: WorkingHours[];
  gallery?: GalleryImage[];
}

export interface Service {
  id: string;
  provider_id: string;
  title: string;
  description?: string;
  price_type: PriceType;
  price: number;
  duration_minutes?: number;
  created_at: string;
}

export interface WorkingHours {
  id: string;
  provider_id: string;
  day_of_week: number; // 0-6
  start_time: string;
  end_time: string;
}

export interface GalleryImage {
  id: string;
  provider_id: string;
  image_url: string;
  created_at: string;
}

export interface Booking {
  id: string;
  client_id: string;
  provider_id: string;
  service_id: string;
  requested_date: string;
  requested_time: string;
  is_emergency: boolean;
  status: BookingStatus;
  client_notes?: string;
  provider_notes?: string;
  total_price: number;
  created_at: string;
  updated_at: string;
  // Relations
  client?: User;
  provider?: ServiceProvider;
  service?: Service;
  payment?: Payment;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  platform_fee: number;
  provider_amount: number;
  payment_method: PaymentMethod;
  payment_intent_id?: string;
  status: PaymentStatus;
  paid_at?: string;
  payout_at?: string;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  client_id: string;
  provider_id: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
}

// Form types
export interface RegisterKlijentInput {
  email: string;
  password: string;
  full_name: string;
  phone: string;
}

export interface RegisterPruzateljInput extends RegisterKlijentInput {
  business_name?: string;
  oib: string;
  description: string;
  categories: string[]; // category IDs
  cities: string[]; // city IDs
  emergency_available: boolean;
  emergency_fee?: number;
  id_card_file: File;
  profile_photo_file?: File;
}

export interface BookingRequestInput {
  provider_id: string;
  service_id: string;
  requested_date: string;
  requested_time: string;
  is_emergency: boolean;
  client_notes?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

// Search & Filter types
export interface SearchFilters {
  kategorija?: string;
  grad?: string;
  cijena_min?: number;
  cijena_max?: number;
  hitna_intervencija?: boolean;
}
```

**Provjera:** TypeScript kompajlira bez grešaka

---

#### ✅ PROMPT 5: NextAuth.js setup
**Zadatak:** Konfiguracija authentication sistema

1. Instaliraj pakete:
```bash
npm install next-auth @next-auth/supabase-adapter
```

2. Kreiraj `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Lozinka", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) {
          return null;
        }

        // Dohvati user podatke iz custom tablice
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        return {
          id: data.user.id,
          email: data.user.email!,
          name: userData?.full_name,
          role: userData?.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

3. Dodaj u `.env.local`:
```env
GOOGLE_CLIENT_ID=tvoj-google-client-id
GOOGLE_CLIENT_SECRET=tvoj-google-secret

FACEBOOK_CLIENT_ID=tvoj-facebook-app-id
FACEBOOK_CLIENT_SECRET=tvoj-facebook-secret
```

4. Kreiraj `lib/auth.ts` - helper funkcije:
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}
```

**Provjera:** NextAuth ruta se buildeа bez grešaka

---

### FAZA 2: CORE FEATURES

#### ✅ PROMPT 6: Homepage layout
**Zadatak:** Napraviti homepage s hero sekcijom, search barom i kategori grid

**Komponente za napraviti:**
- `app/page.tsx` - glavna stranica
- `components/layout/Header.tsx` - navigacija
- `components/layout/Footer.tsx` - footer
- `components/home/HeroSection.tsx` - hero s search
- `components/home/CategoryGrid.tsx` - grid kategorija

**Dizajn smjernice:**
- Moderna, minimalistička estetika
- Bijela/neutralne boje s accent bojom (npr. plava ili zelena)
- Čitljivi fontovi, dovoljno white space-a
- Mobile-first pristup

**HeroSection mora sadržavati:**
- Catchy naslov (npr. "Pronađite pouzdane majstore u svom gradu")
- Search bar s dropdown za kategoriju i grad
- CTA button "Pretraži"

**CategoryGrid:**
- Dohvaćanje kategorija iz Supabasea
- Grid layout (4 kolone na desktop, 2 na tablet, 1 na mobile)
- Svaka kartica: ikona (emoji), naziv, kratki opis
- Link na `/usluge/[kategorija-slug]`

**Provjera:** Homepage se prikazuje korektno, search bar funkcionira (za sada samo console.log)

---

#### ✅ PROMPT 7: Login i Register forme
**Zadatak:** Kreiranje autentifikacijskih stranica

**Stranice:**
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`

**Login forma:**
- Email input
- Password input
- "Zaboravili ste lozinku?" link (za sada disabled)
- Submit button
- Divider "ili"
- "Nastavi s Google" button
- "Nastavi s Facebookom" button
- Link na register stranicu

**Register forma - 2 koraka:**

**Korak 1 - Odabir tipa računa:**
- Radio buttons: "Tražim uslugu" (klijent) ili "Nudim uslugu" (pružatelj)
- "Nastavi" button

**Korak 2A - Registracija klijenta:**
- Puno ime
- Email
- Telefon
- Password
- Confirm password
- Checkbox "Prihvaćam uvjete korištenja"
- Submit button

**Korak 2B - Registracija partnera:**
- Sve iz 2A +
- Naziv obrta (optional)
- OIB (obavezno)
- Opis usluga (textarea)
- Multi-select kategorije (dohvati iz Supabasea)
- Multi-select gradovi (dohvati iz Supabasea)
- Checkbox "Nudim hitne intervencije"
- Broj field "Dodatna naknada za hitno" (pokazuje se samo ako je checkbox checked)
- File upload "Osobna iskaznica" (obavezno)
- File upload "Profilna fotografija" (optional)

**Form validacija:**
- Sva obavezna polja
- Email format
- Password min 8 znakova
- OIB mora biti 11 brojeva
- File size limit 5MB

**Nakon uspješne registracije:**
- Klijent → redirect na `/klijent/dashboard`
- Partner → redirect na `/partner/dashboard` s message "Vaš račun čeka verifikaciju"

**Provjera:** Forme funkcioniraju, validacija radi, korisnici se spremaju u Supabase

---

#### ✅ PROMPT 8: Search & Filter funkcionalnost
**Zadatak:** Implementacija pretrage pružatelja usluga

**Stranica:** `app/usluge/[kategorija]/[grad]/page.tsx`

**URL struktura:**
- `/usluge/vodoinstalateri/split` - specifična kategorija i grad
- `/usluge/vodoinstalateri` - sve lokacije za kategoriju
- `/usluge?grad=split` - svi pružatelji u gradu

**Filter sidebar (lijevo):**
- Kategorija (multi-select)
- Grad (multi-select)
- Raspon cijene (slider: 0-500€)
- Hitna intervencija dostupna (checkbox)

**Results grid (desno):**
- Card za svakog pružatelja:
  - Profilna slika (fallback na inicijale)
  - Naziv/Ime
  - Kategorije (badges)
  - Gradovi koji pokriva
  - Minimalna cijena od X€
  - Badge "Hitno dostupno" (ako ima)
  - Rating (ako ima - za sada hardcode 0.0)
  - "Pogledaj profil" button

**Query parametri:**
- `?kategorija=vodoinstalater,elektricar`
- `?grad=split,zagreb`
- `?cijena_min=50&cijena_max=200`
- `?hitno=true`

**Supabase query:**
```typescript
let query = supabase
  .from('service_providers')
  .select(`
    *,
    user:users(*),
    categories:provider_categories(category:categories(*)),
    cities:provider_cities(city:cities(*)),
    services(*)
  `)
  .eq('verification_status', 'verified'); // samo verificirani

// Primjeni filtere
if (kategorija) {
  query = query.in('provider_categories.category_id', kategorijaIds);
}
// ... ostali filteri
```

**Provjera:** Search vraća točne rezultate, filteri rade, URL parametri se updatuju

---

#### ✅ PROMPT 9: Profil pružatelja usluge (public view)
**Zadatak:** Stranica s detaljima pružatelja

**Stranica:** `app/pruzatelj/[id]/page.tsx`

**Layout - 2 kolone:**

**Lijeva kolona (sticky):**
- Profilna slika (veća)
- Naziv/Ime
- Kategorije (badges)
- Lokacije (lista gradova)
- Badge "Verificiran" (ako je verified)
- Badge "Hitne intervencije dostupno"
- Rating i broj recenzija (za sada 0)
- "Pošalji upit" button (glavni CTA)

**Desna kolona (scrollable):**
- **O meni sekcija:**
  - Opis (multi-line text)
  
- **Usluge i cijene:**
  - Lista svih usluga
  - Svaka usluga: naziv, opis, cijena, trajanje (ako fixed)
  
- **Radno vrijeme:**
  - Tablica po danima (Pon-Ned)
  - Za svaki dan: radno vrijeme ili "Zatvoreno"
  
- **Galerija radova:**
  - Grid slika (3 kolone)
  - Lightbox za povećanje
  
- **Recenzije:** (prazan state za sada)
  - "Još nema recenzija"

**"Pošalji upit" modal:**
- Dropdown: odabir usluge (iz lista usluga pružatelja)
- Date picker: željeni datum
- Time picker: željeno vrijeme
- Checkbox: "Hitna intervencija" (dodaje emergency_fee na cijenu)
- Textarea: dodatne napomene
- **Prikaz cijene:**
  - Cijena usluge: X€
  - Hitna intervencija: +Y€ (ako je checked)
  - **Ukupno: Z€**
- "Nastavi na plaćanje" button

**Validacija:**
- Datum ne može biti u prošlosti
- Vrijeme mora biti unutar radnog vremena pružatelja
- Korisnik mora biti prijavljen (ako nije, redirect na /login)

**Provjera:** Profil se prikazuje, modal funkcionira, forma validacija radi

---

#### ✅ PROMPT 10: Klijent Dashboard
**Zadatak:** Dashboard za klijente

**Stranica:** `app/(dashboard)/klijent/page.tsx`

**Layout:**
- Sidebar navigacija:
  - Pregled (aktivno)
  - Moji zahtjevi
  - Povijest
  - Postavke

**Pregled tab:**
- **Stats kartice (3 u redu):**
  - Aktivni zahtjevi (count pending bookings)
  - Zakazano (count accepted bookings)
  - Ukupno usluga (count completed bookings)

- **Aktivni zahtjevi tablica:**
  - Kolone: Pružatelj, Usluga, Datum, Vrijeme, Status, Akcije
  - Status badge (boje: pending=žuta, accepted=zelena, rejected=crvena)
  - Akcije: "Odustani" (ako pending), "Plati" (ako accepted), "Detalji"

- **Brzi pristup:**
  - "Pretraži nove usluge" button
  - "Moji favoriti" (disabled za sada)

**Provjera:** Dashboard se prikazuje, dohvaćaju se korisnikovi bookings

---

#### ✅ PROMPT 11: Pružatelj Dashboard - Osnova
**Zadatak:** Dashboard za pružatelje usluga

**Stranica:** `app/(dashboard)/pruzatelj/page.tsx`

**VAŽNO:** Ako je verification_status = 'pending', prikaži warning banner:
- "Vaš profil čeka verifikaciju od strane administratora. Privremeno ne primate nove zahtjeve."

**Layout - Sidebar:**
- Pregled (aktivno)
- Zahtjevi
- Kalendar
- Moje usluge
- Profil
- Postavke

**Pregled tab:**
- **Stats kartice:**
  - Novi zahtjevi (count pending bookings)
  - Odobreno ovaj mjesec (count accepted this month)
  - Ukupna zarada (sum completed payments - platform fee)

- **Novi zahtjevi tablica:**
  - Kolone: Klijent, Usluga, Datum, Vrijeme, Hitno?, Cijena, Akcije
  - Hitno = badge "HITNO" (crvena boja)
  - Akcije: "Prihvati" button (zeleni), "Odbij" button (crveni)

- **Odobreni bookings (sljedećih 7 dana):**
  - Lista kartica
  - Svaka kartica: Datum/Vrijeme, Klijent ime, Usluga, Kontakt (telefon/email klijenta)

**Modal za prihvaćanje zahtjeva:**
- Prikaz svih detalja bookinga
- Textarea: "Poruka klijentu" (optional)
- Confirm button

**Modal za odbijanje:**
- Textarea: "Razlog odbijanja" (optional)
- Confirm button
- **Automatski refund** se trigerra

**Provjera:** Dashboard radi, pružatelj vidi svoje bookinge, akcije funkcioniraju

---

#### ✅ PROMPT 12: Profil pružatelja - Edit mode
**Zadatak:** Omogući pružatelju uređivanje vlastitog profila

**Stranica:** `app/(dashboard)/pruzatelj/profil/page.tsx`

**Tabovi:**
1. Osnovni podaci
2. Usluge i cijene
3. Radno vrijeme
4. Galerija

**Tab 1 - Osnovni podaci:**
- Profilna slika (upload/promijeni)
- Naziv obrta
- Opis (textarea)
- Multi-select kategorije
- Multi-select gradovi
- Checkbox "Dostupan za hitne intervencije"
- Number input "Dodatna naknada za hitno"
- "Spremi promjene" button

**Tab 2 - Usluge i cijene:**
- Lista postojećih usluga (edit/delete)
- "Dodaj novu uslugu" button
- Modal za dodavanje/edit usluge:
  - Naziv usluge
  - Opis (textarea)
  - Radio: Tip cijene (Po satu / Fiksna cijena)
  - Number: Cijena (€)
  - Number: Trajanje u minutama (ako fiksna)
  - "Spremi" button

**Tab 3 - Radno vrijeme:**
- 7 redova (Pon-Ned)
- Svaki red:
  - Checkbox "Radim ovaj dan"
  - Time picker: Od
  - Time picker: Do
- "Spremi radno vrijeme" button

**Tab 4 - Galerija:**
- Grid postojećih slika (max 10)
- Hover: "X" button za brisanje
- "Dodaj slike" button (multi-file upload)
- Validacija: max 10 slika, 5MB po slici

**Supabase Storage setup:**
```typescript
// Upload u bucket 'provider-images'
const { data, error } = await supabase.storage
  .from('provider-images')
  .upload(`${providerId}/${fileName}`, file);
```

**Provjera:** Sve promjene se spremaju, slike uploadeју, forme rade

---

#### ✅ PROMPT 13: API Routes - CRUD operacije
**Zadatak:** Kreiranje svih potrebnih API endpoints

**Struktura:**
```
app/api/
├── providers/
│   ├── route.ts (GET all, POST create)
│   └── [id]/
│       └── route.ts (GET one, PUT update, DELETE)
├── bookings/
│   ├── route.ts (GET all, POST create)
│   └── [id]/
│       ├── route.ts (GET one)
│       ├── accept/route.ts (POST)
│       └── reject/route.ts (POST)
├── services/
│   └── route.ts (GET, POST, PUT, DELETE)
├── categories/
│   └── route.ts (GET all)
└── cities/
    └── route.ts (GET all)
```

**Primjer - `/api/bookings/route.ts`:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - dohvati bookinge korisnika
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        client:users!client_id(*),
        provider:service_providers!provider_id(*),
        service:services(*),
        payment:payments(*)
      `);
    
    if (user.role === 'klijent') {
      query = query.eq('client_id', user.id);
    } else if (user.role === 'pruzatelj') {
      // Dohvati provider_id za korisnika
      const { data: provider } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      query = query.eq('provider_id', provider.id);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - kreiraj novi booking
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    const { provider_id, service_id, requested_date, requested_time, is_emergency, client_notes } = body;
    
    // Dohvati cijenu usluge
    const { data: service } = await supabase
      .from('services')
      .select('price')
      .eq('id', service_id)
      .single();
    
    let total_price = service.price;
    
    // Ako je hitna intervencija, dodaj emergency_fee
    if (is_emergency) {
      const { data: provider } = await supabase
        .from('service_providers')
        .select('emergency_fee')
        .eq('id', provider_id)
        .single();
      
      total_price += provider.emergency_fee || 0;
    }
    
    // Kreiraj booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        client_id: user.id,
        provider_id,
        service_id,
        requested_date,
        requested_time,
        is_emergency,
        client_notes,
        total_price,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // TODO: Pošalji email notifikaciju pružatelju
    
    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**Napraviti sve ostale endpoints po istom principu.**

**Provjera:** Svi API endpoints rade, vraćaju JSON, error handling je implementiran

---

### FAZA 3: PAYMENTS & BOOKINGS

#### ✅ PROMPT 14: Stripe integracija - Setup
**Zadatak:** Konfiguracija Stripe platforma

1. **Kreiranje Stripe računa:**
   - https://stripe.com
   - Koristi test mode

2. **Install pakete:**
```bash
npm install stripe @stripe/stripe-js
```

3. **Dodaj u `.env.local`:**
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

4. **Kreiraj `lib/stripe.ts`:**
```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Kalkulacija fees
export function calculateFees(amount: number) {
  const platformFee = amount * 0.07; // 7%
  const providerAmount = amount - platformFee;
  
  return {
    amount,
    platformFee: Math.round(platformFee * 100) / 100, // round to 2 decimals
    providerAmount: Math.round(providerAmount * 100) / 100
  };
}
```

5. **Kreiraj Stripe Connect Express Account za pružatelje:**
   - Svaki pružatelj mora imati connected account da primi novac

6. **Dodaj kolone u `service_providers` tablicu:**
```sql
ALTER TABLE service_providers ADD COLUMN stripe_account_id TEXT;
ALTER TABLE service_providers ADD COLUMN stripe_onboarding_complete BOOLEAN DEFAULT false;
```

**Provjera:** Stripe SDK funkcionira, test API key radi

---

#### ✅ PROMPT 15: Payment flow - Kreiranje Stripe checkout sessiona
**Zadatak:** Implementacija payment procesa

**API Endpoint:** `app/api/bookings/[id]/checkout/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe, calculateFees } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const bookingId = params.id;
    
    // Dohvati booking
    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        *,
        provider:service_providers!provider_id(stripe_account_id),
        service:services(title)
      `)
      .eq('id', bookingId)
      .single();
    
    if (booking.status !== 'accepted') {
      throw new Error('Booking must be accepted by provider first');
    }
    
    const fees = calculateFees(booking.total_price);
    
    // Kreiraj Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(fees.amount * 100), // convert to cents
      currency: 'eur',
      application_fee_amount: Math.round(fees.platformFee * 100),
      transfer_data: {
        destination: booking.provider.stripe_account_id,
      },
      metadata: {
        booking_id: bookingId,
        client_id: user.id,
      },
    });
    
    // Kreiraj payment record
    await supabase.from('payments').insert({
      booking_id: bookingId,
      amount: fees.amount,
      platform_fee: fees.platformFee,
      provider_amount: fees.providerAmount,
      payment_method: 'stripe',
      payment_intent_id: paymentIntent.id,
      status: 'pending'
    });
    
    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**Provjera:** Payment Intent se kreira, fee kalkulacija je točna

---

#### ✅ PROMPT 16: Payment UI - Stripe Elements
**Zadatak:** Frontend za plaćanje

**Komponenta:** `components/bookings/PaymentModal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ bookingId, amount }: { bookingId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setLoading(true);
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/klijent/bookings/${bookingId}/success`,
      },
    });
    
    if (error) {
      setError(error.message || 'Payment failed');
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Ukupno za platiti</h3>
        <p className="text-3xl font-bold">{amount.toFixed(2)}€</p>
      </div>
      
      <PaymentElement />
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Procesiranje...' : 'Plati sada'}
      </button>
    </form>
  );
}

export default function PaymentModal({ bookingId, amount, clientSecret }: {
  bookingId: string;
  amount: number;
  clientSecret: string;
}) {
  const options = {
    clientSecret,
  };
  
  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm bookingId={bookingId} amount={amount} />
    </Elements>
  );
}
```

**Integracija u Klijent Dashboard:**
- Kad klijent klikne "Plati" na accepted booking
- Otvori modal s PaymentModal komponentom
- Nakon uspješnog plaćanja → redirect na success page

**Provjera:** Payment forma se prikazuje, Stripe Elements rade

---

#### ✅ PROMPT 17: Stripe Webhook handler
**Zadatak:** Procesiranje Stripe evenata

**API Endpoint:** `app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }
  
  // Handle različite event tipove
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Update payment status
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          paid_at: new Date().toISOString()
        })
        .eq('payment_intent_id', paymentIntent.id);
      
      // Update booking status
      const { data: payment } = await supabase
        .from('payments')
        .select('booking_id')
        .eq('payment_intent_id', paymentIntent.id)
        .single();
      
      await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', payment.booking_id);
      
      // Auto-payout pružatelju (transfer je već napravljen u Payment Intent)
      await supabase
        .from('payments')
        .update({ payout_at: new Date().toISOString() })
        .eq('payment_intent_id', paymentIntent.id);
      
      // TODO: Pošalji email notifikacije
      
      break;
    
    case 'payment_intent.payment_failed':
      // Handle failed payment
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  return NextResponse.json({ received: true });
}
```

**Setup Stripe Webhook:**
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://tvoj-domain.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Kopiraj webhook secret u `.env.local`

**Provjera:** Webhook prima evente, status bookinga se updatea

---

#### ✅ PROMPT 18: PayPal integracija (basic)
**Zadatak:** Dodati PayPal kao alternativni payment method

1. **Install pakete:**
```bash
npm install @paypal/react-paypal-js
```

2. **Dodaj u `.env.local`:**
```env
PAYPAL_CLIENT_ID=tvoj-client-id
PAYPAL_CLIENT_SECRET=tvoj-client-secret
```

3. **Kreiraj `components/bookings/PayPalPayment.tsx`:**
```typescript
'use client';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function PayPalPayment({ bookingId, amount }: {
  bookingId: string;
  amount: number;
}) {
  const initialOptions = {
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: "EUR",
    intent: "capture",
  };
  
  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        createOrder={async () => {
          // Call API to create PayPal order
          const res = await fetch(`/api/bookings/${bookingId}/paypal-checkout`, {
            method: 'POST',
          });
          const data = await res.json();
          return data.orderId;
        }}
        onApprove={async (data) => {
          // Call API to capture payment
          const res = await fetch(`/api/bookings/${bookingId}/paypal-capture`, {
            method: 'POST',
            body: JSON.stringify({ orderId: data.orderID }),
          });
          
          if (res.ok) {
            window.location.href = `/klijent/bookings/${bookingId}/success`;
          }
        }}
      />
    </PayPalScriptProvider>
  );
}
```

4. **API endpoints za PayPal:**
- `/api/bookings/[id]/paypal-checkout/route.ts` - kreiraj order
- `/api/bookings/[id]/paypal-capture/route.ts` - capture payment

**Provjera:** PayPal buttons se prikazuju, payment flow funkcionira

---

#### ✅ PROMPT 19: Booking lifecycle - Status transitions
**Zadatak:** Implementacija svih booking statusa i transicija

**Booking statusi flow:**
```
pending → accepted → completed (after payment)
        ↘ rejected (auto refund if paid)
        ↘ cancelled (by client, partial refund?)
```

**API Endpoints:**

**1. Accept booking:** `POST /api/bookings/[id]/accept`
```typescript
// Provjeri da je user pružatelj tog bookinga
// Update status na 'accepted'
// Pošalji email klijentu s linkom za plaćanje
```

**2. Reject booking:** `POST /api/bookings/[id]/reject`
```typescript
// Update status na 'rejected'
// Ako je booking već plaćen, pokreni refund (Stripe Refund API)
// Pošalji email klijentu
```

**3. Cancel booking:** `POST /api/bookings/[id]/cancel` (client-side)
```typescript
// Provjeri da je booking pending ili accepted
// Ako je plaćen i manje od 24h do termina → nema refund
// Ako je više od 24h → partial refund (npr. 50%)
// Update status na 'cancelled'
```

**Refund logika:**
```typescript
async function processRefund(bookingId: string, refundAmount?: number) {
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .single();
  
  if (!payment || payment.status !== 'completed') {
    return;
  }
  
  const refund = await stripe.refunds.create({
    payment_intent: payment.payment_intent_id,
    amount: refundAmount 
      ? Math.round(refundAmount * 100) 
      : undefined, // full refund if not specified
  });
  
  await supabase
    .from('payments')
    .update({ status: 'refunded' })
    .eq('id', payment.id);
}
```

**Provjera:** Svi statusi funkcioniraju, refund mehanizam radi

---

### FAZA 4: ADMIN & POLISH

#### ✅ PROMPT 20: Admin Dashboard - Verifikacija pružatelja
**Zadatak:** Admin panel za odobravanje novih pružatelja

**Stranica:** `app/(dashboard)/admin/page.tsx`

**VAŽNO:** Zaštiti rutu - samo user.role === 'admin' može pristupiti

**Middleware:** `middleware.ts`
```typescript
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      if (req.nextUrl.pathname.startsWith('/admin')) {
        return token?.role === 'admin';
      }
      return !!token;
    },
  },
});

export const config = {
  matcher: ['/admin/:path*', '/klijent/:path*', '/pruzatelj/:path*'],
};
```

**Admin Dashboard Layout:**

**Sidebar navigacija:**
- Pregled (stats)
- Novi pružatelji (pending verification)
- Svi pružatelji
- Bookings
- Payments
- Statistike

**Pregled tab - Stats cards:**
- Ukupno pružatelja (verified)
- Čeka verifikaciju (pending)
- Ukupno bookinga ovaj mjesec
- Ukupna provizija ovaj mjesec

**Novi pružatelji tab:**
- Lista pending pružatelja
- Tablica kolone:
  - Ime/Naziv
  - Email
  - OIB
  - Kategorije
  - Gradovi
  - Datum registracije
  - Akcije

**Akcije:**
- "Pregledaj" button → otvara modal s detaljima

**Verification modal:**
- **Prikaz svih podataka:**
  - Puno ime
  - Email, telefon
  - OIB
  - Opis
  - Kategorije (badges)
  - Gradovi (badges)
  - Hitne intervencije (da/ne + fee)
  
- **Dokumenti:**
  - Osobna iskaznica (image viewer)
  - Profilna fotografija (ako ima)
  
- **Akcije:**
  - Textarea: "Bilješka administratora" (opciono)
  - Button: "Odobri" (zeleni)
  - Button: "Odbij" (crveni)

**Odobri akcija:**
```typescript
await supabase
  .from('service_providers')
  .update({ 
    verification_status: 'verified',
    updated_at: new Date().toISOString()
  })
  .eq('id', providerId);

// Log admin akciju
await supabase
  .from('admin_actions')
  .insert({
    admin_id: currentUser.id,
    action_type: 'verify_provider',
    target_type: 'provider',
    target_id: providerId,
    details: { note: adminNote }
  });

// Pošalji email pružatelju: "Vaš profil je verificiran!"
// TODO: Kreirati Stripe Connect account za pružatelja
```

**Odbij akcija:**
```typescript
await supabase
  .from('service_providers')
  .update({ verification_status: 'rejected' })
  .eq('id', providerId);

// Pošalji email pružatelju s razlogom odbijanja
```

**Provjera:** Admin može vidjeti pending pružatelje, odobravanje/odbijanje funkcionira

---

#### ✅ PROMPT 21: Admin - Stripe Connect onboarding za pružatelje
**Zadatak:** Setup Stripe Connect Express accounta za pružatelje

**Kada admin odobri pružatelja:**
1. Kreiraj Stripe Connect Express account
2. Generiraj onboarding link
3. Pošalji email pružatelju s linkom

**Helper funkcija:** `lib/stripe-connect.ts`
```typescript
import { stripe } from './stripe';

export async function createConnectedAccount(providerId: string, email: string) {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'HR',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    
    // Spremi account ID u bazu
    await supabase
      .from('service_providers')
      .update({ stripe_account_id: account.id })
      .eq('id', providerId);
    
    return account;
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    throw error;
  }
}

export async function createAccountLink(accountId: string, providerId: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/pruzatelj/stripe-refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/pruzatelj/stripe-success`,
    type: 'account_onboarding',
  });
  
  return accountLink.url;
}
```

**Integration u admin verify akciju:**
```typescript
// Nakon što se provider verificira
const account = await createConnectedAccount(provider.id, provider.user.email);
const onboardingLink = await createAccountLink(account.id, provider.id);

// Pošalji email s onboarding linkom
```

**Pružatelj stranice:**
- `/pruzatelj/stripe-success` - "Stripe račun uspješno povezan!"
- `/pruzatelj/stripe-refresh` - "Link je istekao, molimo kontaktirajte support"

**Provjera:** Stripe Connect account se kreira, onboarding link radi

---

#### ✅ PROMPT 22: Email notifikacije - Setup
**Zadatak:** Implementacija email sistema

**Opcije:**
- **Resend** (preporučeno za MVP - https://resend.com)
- **SendGrid**
- **Postmark**

**Setup Resend:**
1. Registracija na https://resend.com
2. Dodaj domenu ili koristi resend test email

**Install:**
```bash
npm install resend
```

**Dodaj u `.env.local`:**
```env
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@tvoj-domain.com
```

**Kreiraj `lib/email.ts`:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html,
    });
    
    if (error) {
      console.error('Email error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Template funkcije
export function emailTemplates = {
  newBooking: (providerName: string, clientName: string, service: string, date: string) => `
    <h2>Novi zahtjev za uslugu!</h2>
    <p>Poštovani ${providerName},</p>
    <p>Imate novi zahtjev:</p>
    <ul>
      <li>Klijent: ${clientName}</li>
      <li>Usluga: ${service}</li>
      <li>Datum: ${date}</li>
    </ul>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/pruzatelj">Pogledaj zahtjev</a></p>
  `,
  
  bookingAccepted: (clientName: string, providerName: string, date: string) => `
    <h2>Vaš zahtjev je prihvaćen!</h2>
    <p>Poštovani ${clientName},</p>
    <p>Pružatelj ${providerName} je prihvatio vaš zahtjev za ${date}.</p>
    <p>Molimo dovršite plaćanje kako biste potvrdili booking.</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/klijent">Plati sada</a></p>
  `,
  
  providerVerified: (providerName: string) => `
    <h2>Vaš profil je verificiran!</h2>
    <p>Poštovani ${providerName},</p>
    <p>Vaš profil je uspješno verificiran. Sada možete primati zahtjeve za usluge.</p>
    <p>Sljedeći korak: <a href="${process.env.NEXT_PUBLIC_APP_URL}/pruzatelj/stripe-onboarding">Povežite svoj Stripe račun</a> za primanje plaćanja.</p>
  `,
  
  // ... ostali templatei
};
```

**Integracija u postojeće API endpoints:**
```typescript
// Primjer: Nakon kreiranja bookinga
await sendEmail({
  to: provider.user.email,
  subject: 'Novi zahtjev za uslugu',
  html: emailTemplates.newBooking(provider.business_name, client.full_name, service.title, booking.requested_date)
});
```

**Provjera:** Emailovi se šalju, template-i rade, linkovi su točni

---

#### ✅ PROMPT 23: SEO & Metadata
**Zadatak:** Implementacija SEO best practices

**1. Root layout - `app/layout.tsx`:**
```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Marketplace - Lokalne usluge u Hrvatskoj',
    template: '%s | Marketplace'
  },
  description: 'Pronađite provjerene majstore i pružatelje usluga u vašem gradu. Vodoinstalateri, električari, čistačice i više.',
  keywords: ['usluge', 'majstori', 'hrvatska', 'split', 'zagreb', 'vodoinstalateri', 'električari'],
  authors: [{ name: 'Marketplace Team' }],
  openGraph: {
    type: 'website',
    locale: 'hr_HR',
    url: 'https://tvoj-domain.com',
    siteName: 'Marketplace',
  },
  twitter: {
    card: 'summary_large_image',
  },
};
```

**2. Dinamički metadata - `app/usluge/[kategorija]/[grad]/page.tsx`:**
```typescript
export async function generateMetadata({ params }: {
  params: { kategorija: string; grad: string }
}): Promise<Metadata> {
  const { kategorija, grad } = params;
  
  return {
    title: `${kategorija} u ${grad}u`,
    description: `Pronađite najbolje ${kategorija} u ${grad}u. Provjereni pružatelji usluga s recenzijama.`,
    openGraph: {
      title: `${kategorija} u ${grad}u - Marketplace`,
      description: `Brzo i jednostavno pronađite ${kategorija} u ${grad}u`,
    },
  };
}
```

**3. Sitemap - `app/sitemap.ts`:**
```typescript
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tvoj-domain.com';
  
  // Statičke stranice
  const staticPages = [
    '',
    '/login',
    '/register',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 1,
  }));
  
  // Dinamičke stranice - kategorije
  const categories = await supabase.from('categories').select('slug');
  const categoryPages = categories.data?.map(cat => ({
    url: `${baseUrl}/usluge/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || [];
  
  // Gradovi
  const cities = await supabase.from('cities').select('slug');
  const cityPages = cities.data?.map(city => ({
    url: `${baseUrl}/usluge?grad=${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) || [];
  
  return [...staticPages, ...categoryPages, ...cityPages];
}
```

**4. Robots.txt - `app/robots.ts`:**
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/klijent/', '/pruzatelj/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
```

**Provjera:** Metadata se generira, sitemap radi, SEO score je dobar (Lighthouse)

---

#### ✅ PROMPT 24: Error handling & Loading states
**Zadatak:** Poboljšanje UX-a s loaderima i error statovima

**1. Globalni error boundary - `app/error.tsx`:**
```typescript
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Nešto je pošlo po zlu</h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Pokušaj ponovno
        </button>
      </div>
    </div>
  );
}
```

**2. Loading states - `app/loading.tsx` i ostale loading stranice:**
```typescript
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

**3. Not found - `app/not-found.tsx`:**
```typescript
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-6">Stranica nije pronađena</p>
        <a href="/" className="text-blue-600 hover:underline">
          Povratak na početnu
        </a>
      </div>
    </div>
  );
}
```

**4. Toast notifikacije - Install `react-hot-toast`:**
```bash
npm install react-hot-toast
```

**Setup u `app/layout.tsx`:**
```typescript
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

**Korištenje:**
```typescript
import toast from 'react-hot-toast';

// Uspjeh
toast.success('Booking uspješno kreiran!');

// Error
toast.error('Nešto je pošlo po zlu');

// Loading
const toastId = toast.loading('Procesiranje...');
// later
toast.success('Gotovo!', { id: toastId });
```

**Provjera:** Error handling je implementiran, loaderi rade, toasts funkcioniraju

---

#### ✅ PROMPT 25: Mobile responsiveness - Final touches
**Zadatak:** Osigurati da sve stranice izgledaju dobro na mobilu

**Checklist:**
- [ ] Homepage - hero, search, kategorije grid
- [ ] Search results - filter sidebar (collapse na mobilu)
- [ ] Provider profil - 2 kolone postaju 1 kolona
- [ ] Bookings tablice - horizontal scroll ili collapse u kartice
- [ ] Forms - input fieldovi full-width
- [ ] Modali - full-screen na mobilu
- [ ] Navigacija - hamburger menu

**Hamburger menu za Header:**
```typescript
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="lg:hidden">
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </button>
      
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg">
          {/* Menu items */}
        </div>
      )}
    </div>
  );
}
```

**Breakpoint sistem (Tailwind defaults):**
- `sm:` 640px (mobile landscape)
- `md:` 768px (tablet)
- `lg:` 1024px (desktop)
- `xl:` 1280px (large desktop)

**Provjera:** Testiraj sve stranice na različitim veličinama ekrana (Chrome DevTools)

---

#### ✅ PROMPT 26: Performance optimizacije
**Zadatak:** Ubrzanje aplikacije

**1. Image optimization:**
```typescript
import Image from 'next/image';

// Koristi Next.js Image komponentu uvijek
<Image
  src={profilePhotoUrl}
  alt="Profile"
  width={200}
  height={200}
  className="rounded-full"
  priority={false} // lazy load by default
/>
```

**2. Supabase query optimization:**
```typescript
// ❌ Loše - N+1 query problem
const providers = await supabase.from('service_providers').select('*');
for (const provider of providers.data) {
  const categories = await supabase
    .from('provider_categories')
    .select('*')
    .eq('provider_id', provider.id);
}

// ✅ Dobro - Jedan query s join
const providers = await supabase
  .from('service_providers')
  .select(`
    *,
    categories:provider_categories(category:categories(*))
  `);
```

**3. React Server Components:**
- Koristi Server Components gdje god je moguće
- Client Components ('use client') samo za interaktivnost

**4. Caching strategije:**
```typescript
// Next.js Route Handlers - cache kontrola
export const revalidate = 3600; // revalidate svaki sat

export async function GET() {
  const categories = await supabase.from('categories').select('*');
  
  return NextResponse.json(categories, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

**5. Lazy loading komponenti:**
```typescript
import dynamic from 'next/dynamic';

const PaymentModal = dynamic(() => import('@/components/bookings/PaymentModal'), {
  loading: () => <p>Učitavanje...</p>,
  ssr: false, // ne renderaj na serveru
});
```

**Provjera:** Lighthouse score >90, First Contentful Paint <2s

---

#### ✅ PROMPT 27: Security - RLS policies i validacija
**Zadatak:** Osiguraj aplikaciju

**1. Supabase Row Level Security (RLS) policies:**

**Dodaj detaljnije policies:**
```sql
-- Users tablica
CREATE POLICY "Users can read own and provider profiles"
  ON users FOR SELECT
  USING (
    auth.uid() = id OR 
    role = 'pruzatelj'
  );

-- Service providers
CREATE POLICY "Anyone can read verified providers"
  ON service_providers FOR SELECT
  USING (verification_status = 'verified');

CREATE POLICY "Providers can update own profile"
  ON service_providers FOR UPDATE
  USING (
    auth.uid() = user_id
  );

-- Bookings
CREATE POLICY "Clients can read own bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid() = client_id OR
    auth.uid() IN (
      SELECT user_id FROM service_providers WHERE id = provider_id
    )
  );

CREATE POLICY "Clients can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- Payments - samo za uključene strane
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
```

**2. Input validation - Zod schame:**
```bash
npm install zod
```

```typescript
import { z } from 'zod';

export const registerPruzateljSchema = z.object({
  email: z.string().email('Nevažeći email'),
  password: z.string().min(8, 'Lozinka mora imati najmanje 8 znakova'),
  full_name: z.string().min(2, 'Unesite puno ime'),
  phone: z.string().regex(/^[0-9]{9,10}$/, 'Nevažeći broj telefona'),
  oib: z.string().length(11, 'OIB mora imati 11 znamenki'),
  business_name: z.string().optional(),
  description: z.string().min(50, 'Opis mora imati najmanje 50 znakova'),
  categories: z.array(z.string()).min(1, 'Odaberite barem jednu kategoriju'),
  cities: z.array(z.string()).min(1, 'Odaberite barem jedan grad'),
  emergency_available: z.boolean(),
  emergency_fee: z.number().optional(),
});

// Korištenje u API route
const body = await request.json();
const validation = registerPruzateljSchema.safeParse(body);

if (!validation.success) {
  return NextResponse.json(
    { error: validation.error.errors },
    { status: 400 }
  );
}
```

**3. Rate limiting - Basic middleware:**
```typescript
// lib/rate-limit.ts
const rateLimit = new Map();

export function checkRateLimit(ip: string, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimit.get(ip) || [];
  
  // Ukloni zahtjeve izvan prozora
  const recentRequests = userRequests.filter((time: number) => now - time < windowMs);
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  
  return true;
}
```

**4. CSRF protection - NextAuth ga već ima**

**5. XSS protection - React escapa automatski**

**Provjera:** RLS policies rade, validacija blokira nevažeće inpute

---

#### ✅ PROMPT 28: Deployment - Vercel setup
**Zadatak:** Deploy aplikacije na production

**1. Priprema za deploy:**
```bash
# Build lokalno za provjeru
npm run build

# Provjeri da nema TypeScript errora
npm run type-check
```

**2. Environment varijable na Vercelu:**
- Idi na Vercel Dashboard → tvoj projekt → Settings → Environment Variables
- Dodaj SVE varijable iz `.env.local`
- Za production, promijeni:
  - `NEXT_PUBLIC_APP_URL` → tvoja domena
  - `NEXTAUTH_URL` → tvoja domena
  - Stripe API keys → production keys
  - PayPal keys → production keys

**3. Custom domena (optional):**
- Vercel Dashboard → Domains → Add
- Dodaj DNS recordse kod registrara domene

**4. Supabase production setup:**
- Opciono kreiraj novi production projekt (ili koristi isti)
- Updataj environment varijable na Vercelu

**5. Stripe production mode:**
- Promijeni Stripe Dashboard u production mode
- Update webhook endpoint na production URL
- Test payment flow na productionu

**6. Post-deployment checklist:**
- [ ] Homepage se učitava
- [ ] Login/Register radi
- [ ] Search funkcionira
- [ ] Payment flow radi (test transakcija)
- [ ] Admin panel pristupačan
- [ ] Emailovi se šalju
- [ ] Slike se uploadeaju
- [ ] Mobile verzija radi

**7. Monitoring:**
- Vercel Analytics (uključeno automatski)
- Supabase Dashboard → API logs
- Stripe Dashboard → Payments

**Provjera:** Aplikacija radi na production URL-u

---

## 🎉 MVP GOTOV!

### Što je implementirano:

✅ Autentifikacija (email + Google + Facebook)  
✅ Pružatelji usluga - profili, usluge, galerija, radno vrijeme  
✅ Search & Filter po kategoriji, gradu, cijeni  
✅ Booking sistem s request/accept flow  
✅ Stripe + PayPal plaćanja  
✅ Auto-payout pružateljima (7% provizija)  
✅ Admin panel za verifikaciju pružatelja  
✅ Email notifikacije  
✅ Mobile responsive  
✅ SEO optimizacija  
✅ Security (RLS, validation, rate limiting)  

---

## 🚀 Sljedeće faze (Post-MVP):

### FAZA 2 Features:
- [ ] Recenzijski sistem
- [ ] Dispute handling
- [ ] Advanced kalendar (dostupnost po satima)
- [ ] Favorite pružatelji
- [ ] Real-time chat
- [ ] Push notifikacije
- [ ] Apple Pay / Google Pay
- [ ] Multi-jezik (EN)
- [ ] Blog/Content marketing
- [ ] Affiliate/Referral program

### FAZA 3:
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] CRM za pružatelje
- [ ] Invoice generator
- [ ] Automated reports
- [ ] API za treće strane

---

## 📚 Dodatni resursi:

- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## ⚠️ ВАЖНЕ NAPOMENE ZA CURSOR:

1. **NE preskakati prompte** - slijedi ih redom
2. **NE improvizirati** - radi TOČNO ono što je napisano
3. **PITAJ** ako nešto nije jasno umjesto da pretpostavljaš
4. **TESTIRAJ** svaki feature nakon implementacije
5. **COMMITA j** nakon svakog prompta (git commit -m "Prompt X: opis")
6. **NE dodavati** dodatne biblioteke bez pitanja
7. **FOKUS na MVP** - fancy features KASNIJE

---

## 🐛 Debugging tips:

**Česti problemi:**

1. **Supabase RLS blokira query:**
   - Provjeri RLS policies
   - Koristi service_role_key za admin operacije

2. **NextAuth session ne radi:**
   - Provjeri NEXTAUTH_SECRET
   - Provjeri NEXTAUTH_URL

3. **Stripe webhook ne prima evente:**
   - Provjeri webhook secret
   - Test s Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

4. **Image upload ne radi:**
   - Provjeri Supabase Storage policies
   - Provjeri file size limit

5. **Build error na Vercelu:**
   - Provjeri TypeScript errors: `npm run type-check`
   - Provjeri environment varijable

---

**SRETNO! 🚀**

Kreni s PROMPT 1 i slijedi roadmap korak po korak.
