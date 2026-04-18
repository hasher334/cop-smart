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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          pinned: boolean
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          pinned?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          pinned?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          agency: string
          agency_size: string | null
          created_at: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
          role_title: string | null
          source: string | null
          work_email: string
        }
        Insert: {
          agency: string
          agency_size?: string | null
          created_at?: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          role_title?: string | null
          source?: string | null
          work_email: string
        }
        Update: {
          agency?: string
          agency_size?: string | null
          created_at?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          role_title?: string | null
          source?: string | null
          work_email?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      patrol_shifts: {
        Row: {
          created_at: string
          created_by: string | null
          end_time: string
          id: string
          notes: string | null
          patrol_area: string | null
          patrol_type: Database["public"]["Enums"]["patrol_type"]
          reserved_at: string | null
          reserved_by: string | null
          shift_date: string
          start_time: string
          status: Database["public"]["Enums"]["patrol_status"]
          unit_id: string
          updated_at: string
          vehicle_id: string | null
          volunteer_1: string | null
          volunteer_2: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_time: string
          id?: string
          notes?: string | null
          patrol_area?: string | null
          patrol_type?: Database["public"]["Enums"]["patrol_type"]
          reserved_at?: string | null
          reserved_by?: string | null
          shift_date: string
          start_time: string
          status?: Database["public"]["Enums"]["patrol_status"]
          unit_id: string
          updated_at?: string
          vehicle_id?: string | null
          volunteer_1?: string | null
          volunteer_2?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          patrol_area?: string | null
          patrol_type?: Database["public"]["Enums"]["patrol_type"]
          reserved_at?: string | null
          reserved_by?: string | null
          shift_date?: string
          start_time?: string
          status?: Database["public"]["Enums"]["patrol_status"]
          unit_id?: string
          updated_at?: string
          vehicle_id?: string | null
          volunteer_1?: string | null
          volunteer_2?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrol_shifts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrol_shifts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          badge_no: string
          created_at: string
          email: string | null
          full_name: string
          hire_date: string | null
          home_unit_id: string | null
          id: string
          phone: string | null
          photo_url: string | null
          rank: string | null
          status: Database["public"]["Enums"]["volunteer_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          badge_no: string
          created_at?: string
          email?: string | null
          full_name: string
          hire_date?: string | null
          home_unit_id?: string | null
          id?: string
          phone?: string | null
          photo_url?: string | null
          rank?: string | null
          status?: Database["public"]["Enums"]["volunteer_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          badge_no?: string
          created_at?: string
          email?: string | null
          full_name?: string
          hire_date?: string | null
          home_unit_id?: string | null
          id?: string
          phone?: string | null
          photo_url?: string | null
          rank?: string | null
          status?: Database["public"]["Enums"]["volunteer_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_home_unit_id_fkey"
            columns: ["home_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      training_courses: {
        Row: {
          active: boolean
          category: string | null
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          required: boolean
          updated_at: string
          validity_months: number | null
        }
        Insert: {
          active?: boolean
          category?: string | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          required?: boolean
          updated_at?: string
          validity_months?: number | null
        }
        Update: {
          active?: boolean
          category?: string | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          required?: boolean
          updated_at?: string
          validity_months?: number | null
        }
        Relationships: []
      }
      training_records: {
        Row: {
          certificate_no: string | null
          completion_date: string
          course_id: string
          created_at: string
          created_by: string | null
          expiration_date: string | null
          id: string
          instructor: string | null
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          certificate_no?: string | null
          completion_date: string
          course_id: string
          created_at?: string
          created_by?: string | null
          expiration_date?: string | null
          id?: string
          instructor?: string | null
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          certificate_no?: string | null
          completion_date?: string
          course_id?: string
          created_at?: string
          created_by?: string | null
          expiration_date?: string | null
          id?: string
          instructor?: string | null
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_records_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          unit_type: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          unit_type?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          unit_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string
          id: string
          last_service_date: string | null
          license_plate: string | null
          make: string | null
          mileage: number | null
          model: string | null
          next_service_date: string | null
          notes: string | null
          status: Database["public"]["Enums"]["vehicle_status"]
          unit_id: string | null
          updated_at: string
          vehicle_no: string
          vin: string | null
          year: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_service_date?: string | null
          license_plate?: string | null
          make?: string | null
          mileage?: number | null
          model?: string | null
          next_service_date?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          unit_id?: string | null
          updated_at?: string
          vehicle_no: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          last_service_date?: string | null
          license_plate?: string | null
          make?: string | null
          mileage?: number | null
          model?: string | null
          next_service_date?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          unit_id?: string | null
          updated_at?: string
          vehicle_no?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "corporal_plus" | "officer" | "volunteer"
      patrol_status: "open" | "reserved" | "on_duty" | "completed" | "cancelled"
      patrol_type: "patrol" | "special_event" | "training" | "meeting" | "other"
      vehicle_status:
        | "in_service"
        | "out_of_service"
        | "maintenance"
        | "retired"
      volunteer_status: "active" | "inactive" | "leave" | "retired" | "pending"
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
      app_role: ["admin", "corporal_plus", "officer", "volunteer"],
      patrol_status: ["open", "reserved", "on_duty", "completed", "cancelled"],
      patrol_type: ["patrol", "special_event", "training", "meeting", "other"],
      vehicle_status: [
        "in_service",
        "out_of_service",
        "maintenance",
        "retired",
      ],
      volunteer_status: ["active", "inactive", "leave", "retired", "pending"],
    },
  },
} as const
