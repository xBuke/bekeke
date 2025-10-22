# SUPABASE DATABASE SETUP - PROMPT 3

## Korak 1: Otvori Supabase Dashboard
1. Idi na https://supabase.com
2. Prijavi se u svoj račun
3. Otvori svoj projekt

## Korak 2: SQL Editor
1. U lijevom sidebaru klikni na "SQL Editor"
2. Klikni "New query"

## Korak 3: Kopiraj i izvrši database schema
1. Otvori `database-schema.sql` file
2. Kopiraj SAV sadržaj
3. Zalijepi u Supabase SQL Editor
4. Klikni "Run" (ili Ctrl+Enter)

## Korak 4: Dodaj seed data
1. Otvori `seed-data.sql` file  
2. Kopiraj SAV sadržaj
3. Zalijepi u novi query u Supabase SQL Editor
4. Klikni "Run"

## Korak 5: Provjeri da je sve uspješno
1. Idi na "Table Editor" u sidebaru
2. Provjeri da su kreirane sljedeće tablice:
   - users
   - cities  
   - categories
   - service_providers
   - provider_categories
   - provider_cities
   - services
   - working_hours
   - gallery_images
   - bookings
   - payments
   - reviews
   - admin_actions

3. Provjeri da su u `cities` tablici gradovi (Split, Zagreb, Rijeka, Osijek, Dubrovnik)
4. Provjeri da su u `categories` tablici kategorije (Vodoinstalater, Električar, itd.)

## Ako se dogodi greška:
- Provjeri da nema syntax errora u SQL-u
- Provjeri da su svi ENUM tipovi kreirani prije tablica
- Provjeri da nema duplikata u UNIQUE constraints

## Sljedeći korak:
Nakon što je sve uspješno kreirano, možeš nastaviti s PROMPT 4 (TypeScript tipovi).
