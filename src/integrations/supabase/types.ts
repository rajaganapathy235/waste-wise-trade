export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bills: {
        Row: {
          bill_no: number
          bill_type: string
          created_at: string
          date: string
          id: string
          items: Json | null
          notes: string | null
          party_id: string | null
          subtotal: number | null
          tax_amount: number | null
          total: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bill_no: number
          bill_type: string
          created_at?: string
          date: string
          id?: string
          items?: Json | null
          notes?: string | null
          party_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bill_no?: number
          bill_type?: string
          created_at?: string
          date?: string
          id?: string
          items?: Json | null
          notes?: string | null
          party_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          sender_id: string
          text: string
          thread_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sender_id: string
          text: string
          thread_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sender_id?: string
          text?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          display_name: string | null
          id: string
          thread_id: string
          unread_count: number | null
          user_id: string
        }
        Insert: {
          display_name?: string | null
          id?: string
          thread_id: string
          unread_count?: number | null
          user_id: string
        }
        Update: {
          display_name?: string | null
          id?: string
          thread_id?: string
          unread_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          last_message_at: string | null
          lead_id: string | null
          lead_title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          lead_id?: string | null
          lead_title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          lead_id?: string | null
          lead_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          category: string
          created_at: string
          id: string
          inquiries: number | null
          lead_type: string
          location_district: string | null
          material_type: string
          poster_name: string | null
          poster_phone: string | null
          poster_role: string | null
          price_per_kg: number
          quantity: number
          specs: Json | null
          status: string
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          inquiries?: number | null
          lead_type: string
          location_district?: string | null
          material_type: string
          poster_name?: string | null
          poster_phone?: string | null
          poster_role?: string | null
          price_per_kg?: number
          quantity?: number
          specs?: Json | null
          status?: string
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          inquiries?: number | null
          lead_type?: string
          location_district?: string | null
          material_type?: string
          poster_name?: string | null
          poster_phone?: string | null
          poster_role?: string | null
          price_per_kg?: number
          quantity?: number
          specs?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          created_at: string
          credit: number | null
          date: string
          debit: number | null
          id: string
          invoice_no: number | null
          particular: string | null
          party_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credit?: number | null
          date: string
          debit?: number | null
          id?: string
          invoice_no?: number | null
          particular?: string | null
          party_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          credit?: number | null
          date?: string
          debit?: number | null
          id?: string
          invoice_no?: number | null
          particular?: string | null
          party_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      parties: {
        Row: {
          bill_count: number | null
          created_at: string
          gstin: string | null
          id: string
          initials: string | null
          location: string | null
          name: string
          phone: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bill_count?: number | null
          created_at?: string
          gstin?: string | null
          id?: string
          initials?: string | null
          location?: string | null
          name: string
          phone?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bill_count?: number | null
          created_at?: string
          gstin?: string | null
          id?: string
          initials?: string | null
          location?: string | null
          name?: string
          phone?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          gst_rate: number | null
          hsn_code: string | null
          id: string
          name: string
          purchase_price: number | null
          sale_price: number | null
          stock: number | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          gst_rate?: number | null
          hsn_code?: string | null
          id?: string
          name: string
          purchase_price?: number | null
          sale_price?: number | null
          stock?: number | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          gst_rate?: number | null
          hsn_code?: string | null
          id?: string
          name?: string
          purchase_price?: number | null
          sale_price?: number | null
          stock?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          business_name: string | null
          created_at: string
          display_name: string | null
          email: string | null
          free_credits_used: number
          gstin: string | null
          id: string
          is_subscribed: boolean | null
          location: string | null
          max_free_credits: number
          phone: string | null
          subscription_expiry: string | null
          total_reviews: number | null
          trust_score: number | null
          updated_at: string
          user_id: string
          verification_documents: Json | null
          verification_status: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          free_credits_used?: number
          gstin?: string | null
          id?: string
          is_subscribed?: boolean | null
          location?: string | null
          max_free_credits?: number
          phone?: string | null
          subscription_expiry?: string | null
          total_reviews?: number | null
          trust_score?: number | null
          updated_at?: string
          user_id: string
          verification_documents?: Json | null
          verification_status?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          free_credits_used?: number
          gstin?: string | null
          id?: string
          is_subscribed?: boolean | null
          location?: string | null
          max_free_credits?: number
          phone?: string | null
          subscription_expiry?: string | null
          total_reviews?: number | null
          trust_score?: number | null
          updated_at?: string
          user_id?: string
          verification_documents?: Json | null
          verification_status?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          lead_id: string | null
          rating: number
          reviewee_id: string
          reviewer_id: string
          reviewer_name: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          rating: number
          reviewee_id: string
          reviewer_id: string
          reviewer_name?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
          reviewer_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_requests: {
        Row: {
          created_at: string
          estimated_cost: number | null
          from_district: string | null
          id: string
          lead_id: string | null
          material_type: string | null
          provider_name: string | null
          provider_phone: string | null
          quantity: number | null
          requested_date: string | null
          status: string
          to_district: string | null
          updated_at: string
          user_id: string
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string
          estimated_cost?: number | null
          from_district?: string | null
          id?: string
          lead_id?: string | null
          material_type?: string | null
          provider_name?: string | null
          provider_phone?: string | null
          quantity?: number | null
          requested_date?: string | null
          status?: string
          to_district?: string | null
          updated_at?: string
          user_id: string
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string
          estimated_cost?: number | null
          from_district?: string | null
          id?: string
          lead_id?: string | null
          material_type?: string | null
          provider_name?: string | null
          provider_phone?: string | null
          quantity?: number | null
          requested_date?: string | null
          status?: string
          to_district?: string | null
          updated_at?: string
          user_id?: string
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_requests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "trader" | "transporter" | "manufacturer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "trader", "transporter", "manufacturer"],
    },
  },
} as const
