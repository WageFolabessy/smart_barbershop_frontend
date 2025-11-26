export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: 'admin' | 'barber' | 'customer';
    created_at: string;
    updated_at: string;
}

export interface Service {
    id: number;
    name: string;
    description?: string;
    base_price: number;
    duration_minutes: number;
    is_active: boolean;
    created_at: string;
}

export interface TimeSlot {
    id: number;
    time: string; // HH:mm
    is_peak_hour: boolean;
    multiplier: number;
    created_at: string;
    updated_at: string;
}

export interface Booking {
    id: number;
    customer: User;
    barber: User;
    service: Service;
    time_slot: TimeSlot;
    booking_datetime: string;
    pricing: {
        base_price: number;
        multiplier: number;
        final_price: number;
    };
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface HairRecord {
    id: number;
    customer: User;
    barber: User;
    booking_id?: number;
    hair_type?: string;
    scalp_condition?: string;
    treatment_notes?: string;
    barber_recommendations?: string;
    photos: {
        before?: string;
        after?: string;
    };
    created_at: string;
    updated_at: string;
}

export interface Review {
    id: number;
    customer: User;
    rating: number;
    comment?: string;
    created_at: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    links?: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta?: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

export interface LoginResponse {
    token: string;
    user: User;
}
