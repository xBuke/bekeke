import { z } from 'zod';

// Registration schemas
export const registerKlijentSchema = z.object({
  email: z.string().email('Nevažeći email'),
  password: z.string().min(8, 'Lozinka mora imati najmanje 8 znakova'),
  full_name: z.string().min(2, 'Unesite puno ime'),
  phone: z.string().regex(/^[0-9]{9,10}$/, 'Nevažeći broj telefona'),
});

export const registerPruzateljSchema = z.object({
  email: z.string().email('Nevažeći email'),
  password: z.string().min(8, 'Lozinka mora imati najmanje 8 znakova'),
  full_name: z.string().min(2, 'Unesite puno ime'),
  phone: z.string().regex(/^[0-9]{9,10}$/, 'Nevažeći broj telefona'),
  business_name: z.string().optional(),
  oib: z.string().length(11, 'OIB mora imati 11 znamenki'),
  description: z.string().min(50, 'Opis mora imati najmanje 50 znakova'),
  categories: z.array(z.string()).min(1, 'Odaberite barem jednu kategoriju'),
  cities: z.array(z.string()).min(1, 'Odaberite barem jedan grad'),
  emergency_available: z.boolean(),
  emergency_fee: z.number().optional(),
});

// Booking schema
export const bookingSchema = z.object({
  provider_id: z.string().uuid('Nevažeći ID pružatelja'),
  service_id: z.string().uuid('Nevažeći ID usluge'),
  requested_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Nevažeći format datuma'),
  requested_time: z.string().regex(/^\d{2}:\d{2}$/, 'Nevažeći format vremena'),
  is_emergency: z.boolean(),
  client_notes: z.string().optional(),
});

// Service schema
export const serviceSchema = z.object({
  title: z.string().min(3, 'Naziv usluge mora imati najmanje 3 znaka'),
  description: z.string().optional(),
  price_type: z.enum(['hourly', 'fixed'], {
    message: 'Tip cijene mora biti "hourly" ili "fixed"'
  }),
  price: z.number().positive('Cijena mora biti pozitivna'),
  duration_minutes: z.number().positive().optional(),
});

// Working hours schema
export const workingHoursSchema = z.object({
  day_of_week: z.number().int().min(0).max(6, 'Dan u tjednu mora biti između 0 i 6'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Nevažeći format vremena'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Nevažeći format vremena'),
});

// Provider profile update schema
export const providerProfileSchema = z.object({
  business_name: z.string().optional(),
  description: z.string().min(50, 'Opis mora imati najmanje 50 znakova'),
  categories: z.array(z.string()).min(1, 'Odaberite barem jednu kategoriju'),
  cities: z.array(z.string()).min(1, 'Odaberite barem jedan grad'),
  emergency_available: z.boolean(),
  emergency_fee: z.number().positive().optional(),
});

// Payment schema
export const paymentSchema = z.object({
  booking_id: z.string().uuid('Nevažeći ID bookinga'),
  amount: z.number().positive('Iznos mora biti pozitivan'),
  payment_method: z.enum(['stripe', 'paypal'], {
    message: 'Metoda plaćanja mora biti "stripe" ili "paypal"'
  }),
});

// Review schema
export const reviewSchema = z.object({
  booking_id: z.string().uuid('Nevažeći ID bookinga'),
  rating: z.number().int().min(1).max(5, 'Ocjena mora biti između 1 i 5'),
  comment: z.string().optional(),
});

// Admin action schema
export const adminActionSchema = z.object({
  action_type: z.string().min(1, 'Tip akcije je obavezan'),
  target_type: z.enum(['provider', 'booking', 'payment'], {
    message: 'Tip cilja mora biti "provider", "booking" ili "payment"'
  }),
  target_id: z.string().uuid('Nevažeći ID cilja'),
  details: z.record(z.string(), z.any()).optional(),
});

// Search filters schema
export const searchFiltersSchema = z.object({
  kategorija: z.string().optional(),
  grad: z.string().optional(),
  cijena_min: z.number().positive().optional(),
  cijena_max: z.number().positive().optional(),
  hitna_intervencija: z.boolean().optional(),
});

// Helper function to validate request body
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.issues.map(e => e.message).join(', ')}`);
  }
  
  return result.data;
}

// Helper function to get validation error messages
export function getValidationErrors(error: z.ZodError): string[] {
  return error.issues.map(err => err.message);
}
