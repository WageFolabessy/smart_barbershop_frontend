export interface User {
    id: number
    name: string
    email: string
    phone?: string
    role: 'admin' | 'barber' | 'customer'
    created_at: string
    updated_at: string
}

export interface Service {
    id: number
    name: string
    description?: string
    base_price: number
    duration_minutes: number
    is_active: boolean
    created_at: string
}

// Service DTOs (requests)
export interface StoreServiceRequest {
    name: string
    description?: string
    base_price: number
    duration_minutes: number
    is_active: boolean
}

export interface UpdateServiceRequest {
    name: string
    description?: string
    base_price: number
    duration_minutes: number
    is_active: boolean
}

export type DayOfWeek =
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'

export interface TimeSlot {
    id: number
    day_of_week: DayOfWeek
    start_time: string
    end_time: string
    price_multiplier: number
    label: string | null
    is_active: boolean
    is_peak_hour?: boolean // Frontend computed field
}

export interface StoreTimeSlotRequest {
    day_of_week: DayOfWeek
    start_time: string // HH:MM
    end_time: string // HH:MM
    price_multiplier: number
    label?: string | null
    is_active: boolean
}

export interface UpdateTimeSlotRequest extends StoreTimeSlotRequest {}

export interface Booking {
    id: number
    customer: User
    barber: User
    service: Service
    time_slot: TimeSlot
    booking_datetime: string
    pricing: {
        base_price: number
        multiplier: number
        final_price: number
    }
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    notes?: string
    created_at: string
    updated_at: string
}

export interface HairRecord {
    id: number
    customer: User
    barber: User
    booking_id?: number
    hair_type?: string
    scalp_condition?: string
    treatment_notes?: string
    barber_recommendations?: string
    photos: {
        before?: string
        after?: string
    }
    created_at: string
    updated_at: string
}

export interface Review {
    id: number
    customer: User
    rating: number
    comment?: string
    created_at: string
}

export interface PaginatedResponse<T> {
    data: T[]
    links?: {
        first: string
        last: string
        prev: string | null
        next: string | null
    }
    meta?: {
        current_page: number
        from: number
        last_page: number
        path: string
        per_page: number
        to: number
        total: number
    }
}

export interface LoginResponse {
    token: string
    user: User
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    name: string
    email: string
    phone?: string
    password: string
    password_confirmation: string
}

export interface StoreUserRequest {
    name: string
    email: string
    phone?: string | null
    role: 'admin' | 'barber' | 'customer'
    password: string
    password_confirmation: string
}

export interface UpdateUserRequest {
    name: string
    email: string
    phone?: string | null
    role: 'admin' | 'barber' | 'customer'
    password?: string
    password_confirmation?: string
}

// Dashboard API Types
export interface DashboardOverviewCounts {
    all?: number
    pending?: number
    confirmed?: number
    completed?: number
    cancelled?: number
}

export interface DashboardOverview {
    total_users?: { all?: number } | number
    total_bookings?: DashboardOverviewCounts | number
    total_services?: number
    total_hair_records?: number
    today_bookings?: number
    upcoming_bookings?: number
}

export interface DashboardRevenueSummary {
    today?: number
    this_week?: number
    this_month?: number
    this_year?: number
}

export interface DashboardRevenueEnvelope {
    revenue: DashboardRevenueSummary
}

export interface DashboardPopularService {
    service_id: number
    service_name: string
    booking_count: number
    base_price?: number
}

export interface DashboardPopularServicesEnvelope {
    popular_services: DashboardPopularService[]
}

export interface DashboardBarberPerformance {
    barber_id: number
    barber_name: string
    total_bookings: number
    completed_bookings: number
}

export interface DashboardBarberPerformanceEnvelope {
    barber_performance: DashboardBarberPerformance[]
}

export interface DashboardRecentBooking {
    id: number
    customer_name: string
    barber_name?: string
    service_name: string
    booking_datetime: string
    final_price: number
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    created_at: string
}

export interface DashboardRecentBookingsEnvelope {
    recent_bookings: DashboardRecentBooking[]
}

// Booking Flow DTOs
export interface CheckAvailabilityResponse {
    available: boolean
}

export interface CreateBookingRequest {
    customer_id: number
    service_id: number
    barber_id: number
    time_slot_id: number
    booking_datetime: string // 'YYYY-MM-DD HH:mm:ss'
}

export interface AvailableBarberRaw {
    id: number | string
    name: string
}

export interface AvailableBarbersEnvelope {
    available_barbers: AvailableBarberRaw[]
}

export interface ReviewRequest {
    booking_id: number
    rating: number
    comment?: string
}

export interface UpdateBookingRequest {
    service_id: number
    barber_id: number
    booking_datetime: string // 'YYYY-MM-DD HH:mm:ss'
}
