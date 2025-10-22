# Environment Variables Setup

Kreiraj `.env.local` datoteku u root direktoriju projekta s sljedećim varijablama:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tvoj-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tvoj-anon-key
SUPABASE_SERVICE_ROLE_KEY=tvoj-service-role-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generiraj-random-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=tvoj-google-client-id
GOOGLE_CLIENT_SECRET=tvoj-google-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=tvoj-facebook-app-id
FACEBOOK_CLIENT_SECRET=tvoj-facebook-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@resend.dev
```

## Kako dobiti vrijednosti:

### Supabase
1. Idi na https://supabase.com
2. Kreiraj novi projekt
3. Idi na Settings → API
4. Kopiraj URL i anon key
5. Za service role key, kopiraj service_role key

### NextAuth Secret
Generiraj random string:
```bash
openssl rand -base64 32
```

### Google OAuth
1. Idi na https://console.developers.google.com
2. Kreiraj novi projekt ili odaberi postojeći
3. Omogući Google+ API
4. Kreiraj OAuth 2.0 credentials
5. Dodaj authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### Facebook OAuth
1. Idi na https://developers.facebook.com
2. Kreiraj novu aplikaciju
3. Dodaj Facebook Login produkt
4. Dodaj redirect URI: `http://localhost:3000/api/auth/callback/facebook`

### Stripe Setup
1. Idi na https://stripe.com
2. Kreiraj račun ili se prijavi
3. Idi na Developers → API keys
4. Kopiraj Secret key (sk_test_...) i Publishable key (pk_test_...)

### Stripe Webhook Setup
1. Idi na Stripe Dashboard → Developers → Webhooks
2. Klikni "Add endpoint"
3. Endpoint URL: `https://tvoj-domain.com/api/webhooks/stripe` (za production)
   - Za lokalno testiranje: `https://tvoj-ngrok-url.ngrok.io/api/webhooks/stripe`
4. Odaberi events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Klikni "Add endpoint"
6. Kopiraj "Signing secret" (počinje s whsec_...)
7. Dodaj u `.env.local` kao `STRIPE_WEBHOOK_SECRET`

#### Lokalno testiranje webhook-a
1. Instaliraj Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Kopiraj webhook secret iz terminala u `.env.local`

#### Production webhook setup
1. Deploy aplikaciju na Vercel
2. Idi na Stripe Dashboard → Webhooks
3. Update endpoint URL na production URL
4. Test webhook s test payment

### Resend Email Setup
1. Idi na https://resend.com
2. Kreiraj račun ili se prijavi
3. Idi na API Keys
4. Klikni "Create API Key"
5. Kopiraj API key (počinje s re_...)
6. Dodaj u `.env.local` kao `RESEND_API_KEY`
7. Za `EMAIL_FROM` koristi `noreply@resend.dev` (test domena)
   - Za production, dodaj vlastitu domenu u Resend dashboardu
