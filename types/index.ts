// Database enums
export type UserRole = 'klijent' | 'partner' | 'admin';
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
  stripe_account_id?: string;
  stripe_onboarding_complete: boolean;
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

export interface RegisterPartnerInput extends RegisterKlijentInput {
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

// Extended provider type with all relations for search results
export interface ProviderWithRelations extends Omit<ServiceProvider, 'categories' | 'cities'> {
  user: User;
  categories: Array<{
    category: Category;
  }>;
  cities: Array<{
    city: City;
  }>;
  services: Service[];
  min_price?: number; // calculated minimum price from services
}

// Extended booking type with all relations for dashboard display
export interface BookingWithRelations extends Booking {
  client: User;
  provider: ServiceProvider & {
    user: User;
  };
  service: Service;
  payment?: Payment;
}

