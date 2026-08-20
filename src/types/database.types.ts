export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      lodge_rooms: {
        Row: {
          id: string;
          room_number: number;
          room_name: string;
          room_type: 'triple' | 'doble';
          max_pax: number;
          base_price_clp: number;
          has_ocean_view: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_number: number;
          room_name: string;
          room_type?: 'triple' | 'doble';
          max_pax?: number;
          base_price_clp?: number;
          has_ocean_view?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_number?: number;
          room_name?: string;
          room_type?: 'triple' | 'doble';
          max_pax?: number;
          base_price_clp?: number;
          has_ocean_view?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      lodge_bookings: {
        Row: {
          id: string;
          booking_code: string;
          room_id: string | null;
          guest_name: string;
          guest_email: string;
          guest_phone: string;
          guest_rut_passport: string | null;
          check_in: string;
          check_out: string;
          pax_count: number;
          channel_source: 'web_direct' | 'airbnb' | 'booking_com' | 'phone_whatsapp' | 'maintenance';
          status: 'pending_transfer' | 'approved' | 'blocked' | 'cancelled' | 'completed';
          total_amount: number;
          discount_amount: number;
          discount_reason: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_code: string;
          room_id?: string | null;
          guest_name: string;
          guest_email: string;
          guest_phone: string;
          guest_rut_passport?: string | null;
          check_in: string;
          check_out: string;
          pax_count?: number;
          channel_source?: 'web_direct' | 'airbnb' | 'booking_com' | 'phone_whatsapp' | 'maintenance';
          status?: 'pending_transfer' | 'approved' | 'blocked' | 'cancelled' | 'completed';
          total_amount?: number;
          discount_amount?: number;
          discount_reason?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_code?: string;
          room_id?: string | null;
          guest_name?: string;
          guest_email?: string;
          guest_phone?: string;
          guest_rut_passport?: string | null;
          check_in?: string;
          check_out?: string;
          pax_count?: number;
          channel_source?: 'web_direct' | 'airbnb' | 'booking_com' | 'phone_whatsapp' | 'maintenance';
          status?: 'pending_transfer' | 'approved' | 'blocked' | 'cancelled' | 'completed';
          total_amount?: number;
          discount_amount?: number;
          discount_reason?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lodge_bookings_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'lodge_rooms';
            referencedColumns: ['id'];
          }
        ];
      };
      vessels: {
        Row: {
          id: string;
          name: string;
          type: string;
          tagline: string | null;
          description: string | null;
          capacity_pax: number;
          cabins_count: number;
          bathrooms_count: number;
          registration: string | null;
          builder: string | null;
          crew: string | null;
          badge: string | null;
          main_image: string | null;
          features: Json;
          hotspots: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          type: string;
          tagline?: string | null;
          description?: string | null;
          capacity_pax?: number;
          cabins_count?: number;
          bathrooms_count?: number;
          registration?: string | null;
          builder?: string | null;
          crew?: string | null;
          badge?: string | null;
          main_image?: string | null;
          features?: Json;
          hotspots?: Json;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          tagline?: string | null;
          description?: string | null;
          capacity_pax?: number;
          cabins_count?: number;
          bathrooms_count?: number;
          registration?: string | null;
          builder?: string | null;
          crew?: string | null;
          badge?: string | null;
          main_image?: string | null;
          features?: Json;
          hotspots?: Json;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      expedition_routes: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          duration: string;
          highlights: Json;
          description: string | null;
          map_image: string | null;
          recommended_vessel: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          subtitle?: string | null;
          duration: string;
          highlights?: Json;
          description?: string | null;
          map_image?: string | null;
          recommended_vessel?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          subtitle?: string | null;
          duration?: string;
          highlights?: Json;
          description?: string | null;
          map_image?: string | null;
          recommended_vessel?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      expedition_departures: {
        Row: {
          id: string;
          route_id: string;
          vessel_id: string;
          departure_date: string;
          return_date: string;
          total_slots: number;
          available_slots: number;
          price_per_pax_clp: number;
          price_charter_full_clp: number | null;
          status: 'scheduled' | 'guaranteed' | 'completed' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          route_id: string;
          vessel_id: string;
          departure_date: string;
          return_date: string;
          total_slots?: number;
          available_slots?: number;
          price_per_pax_clp: number;
          price_charter_full_clp?: number | null;
          status?: 'scheduled' | 'guaranteed' | 'completed' | 'cancelled';
          created_at?: string;
        };
        Update: {
          id?: string;
          route_id?: string;
          vessel_id?: string;
          departure_date?: string;
          return_date?: string;
          total_slots?: number;
          available_slots?: number;
          price_per_pax_clp?: number;
          price_charter_full_clp?: number | null;
          status?: 'scheduled' | 'guaranteed' | 'completed' | 'cancelled';
          created_at?: string;
        };
        Relationships: [];
      };
      expedition_bookings: {
        Row: {
          id: string;
          booking_code: string;
          departure_id: string | null;
          route_id: string | null;
          vessel_id: string | null;
          guest_name: string;
          guest_email: string;
          guest_phone: string;
          guest_rut_passport: string | null;
          booking_type: 'per_pax' | 'full_charter';
          pax_count: number;
          total_amount: number;
          discount_amount: number;
          discount_reason: string | null;
          status: 'pending_transfer' | 'approved' | 'cancelled' | 'completed';
          dietary_medical_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_code: string;
          departure_id?: string | null;
          route_id?: string | null;
          vessel_id?: string | null;
          guest_name: string;
          guest_email: string;
          guest_phone: string;
          guest_rut_passport?: string | null;
          booking_type?: 'per_pax' | 'full_charter';
          pax_count?: number;
          total_amount?: number;
          discount_amount?: number;
          discount_reason?: string | null;
          status?: 'pending_transfer' | 'approved' | 'cancelled' | 'completed';
          dietary_medical_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_code?: string;
          departure_id?: string | null;
          route_id?: string | null;
          vessel_id?: string | null;
          guest_name?: string;
          guest_email?: string;
          guest_phone?: string;
          guest_rut_passport?: string | null;
          booking_type?: 'per_pax' | 'full_charter';
          pax_count?: number;
          total_amount?: number;
          discount_amount?: number;
          discount_reason?: string | null;
          status?: 'pending_transfer' | 'approved' | 'cancelled' | 'completed';
          dietary_medical_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      expedition_passengers: {
        Row: {
          id: string;
          booking_id: string;
          full_name: string;
          doc_id: string;
          nationality: string | null;
          emergency_contact: string | null;
          medical_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          full_name: string;
          doc_id: string;
          nationality?: string | null;
          emergency_contact?: string | null;
          medical_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          full_name?: string;
          doc_id?: string;
          nationality?: string | null;
          emergency_contact?: string | null;
          medical_notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      catalog_services: {
        Row: {
          id: string;
          name: string;
          category: 'cabalgatas' | 'buceo' | 'trekking' | 'gastronomia' | 'nautica' | 'bienestar';
          description: string | null;
          duration_label: string | null;
          price_clp: number;
          max_pax: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: 'cabalgatas' | 'buceo' | 'trekking' | 'gastronomia' | 'nautica' | 'bienestar';
          description?: string | null;
          duration_label?: string | null;
          price_clp?: number;
          max_pax?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: 'cabalgatas' | 'buceo' | 'trekking' | 'gastronomia' | 'nautica' | 'bienestar';
          description?: string | null;
          duration_label?: string | null;
          price_clp?: number;
          max_pax?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      payment_installments: {
        Row: {
          id: string;
          booking_type: 'lodge' | 'expedition';
          booking_id: string;
          installment_number: number;
          total_installments: number;
          concept: string;
          amount_expected: number;
          amount_paid: number;
          status: 'pending_upload' | 'pending_approval' | 'approved' | 'rejected';
          receipt_url: string | null;
          bank_reference: string | null;
          due_date: string | null;
          approved_by: string | null;
          approved_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_type: 'lodge' | 'expedition';
          booking_id: string;
          installment_number?: number;
          total_installments?: number;
          concept: string;
          amount_expected: number;
          amount_paid?: number;
          status?: 'pending_upload' | 'pending_approval' | 'approved' | 'rejected';
          receipt_url?: string | null;
          bank_reference?: string | null;
          due_date?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_type?: 'lodge' | 'expedition';
          booking_id?: string;
          installment_number?: number;
          total_installments?: number;
          concept?: string;
          amount_expected?: number;
          amount_paid?: number;
          status?: 'pending_upload' | 'pending_approval' | 'approved' | 'rejected';
          receipt_url?: string | null;
          bank_reference?: string | null;
          due_date?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      site_content: {
        Row: {
          id: string;
          section_key: string;
          title: string | null;
          subtitle: string | null;
          body_text: string | null;
          media_url: string | null;
          metadata: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_key: string;
          title?: string | null;
          subtitle?: string | null;
          body_text?: string | null;
          media_url?: string | null;
          metadata?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section_key?: string;
          title?: string | null;
          subtitle?: string | null;
          body_text?: string | null;
          media_url?: string | null;
          metadata?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      analytics_page_views: {
        Row: {
          id: string;
          session_id: string;
          page_path: string;
          page_title: string | null;
          country_name: string | null;
          country_code: string | null;
          region_name: string | null;
          city: string | null;
          device_type: string | null;
          referrer: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          page_path: string;
          page_title?: string | null;
          country_name?: string | null;
          country_code?: string | null;
          region_name?: string | null;
          city?: string | null;
          device_type?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          page_path?: string;
          page_title?: string | null;
          country_name?: string | null;
          country_code?: string | null;
          region_name?: string | null;
          city?: string | null;
          device_type?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
