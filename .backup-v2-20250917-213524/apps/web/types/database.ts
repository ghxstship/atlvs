export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dashboards: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          name: string
          description: string | null
          is_default: boolean
          layout: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          name: string
          description?: string | null
          is_default?: boolean
          layout?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_default?: boolean
          layout?: Json
          created_at?: string
          updated_at?: string
        }
      }
      dashboard_widgets: {
        Row: {
          id: string
          dashboard_id: string
          widget_type: string
          title: string
          config: Json
          position: number
          width: number
          height: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dashboard_id: string
          widget_type: string
          title: string
          config?: Json
          position?: number
          width?: number
          height?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dashboard_id?: string
          widget_type?: string
          title?: string
          config?: Json
          position?: number
          width?: number
          height?: number
          created_at?: string
          updated_at?: string
        }
      }
      people: {
        Row: {
          id: string
          organization_id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          role: string | null
          department: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          role?: string | null
          department?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          role?: string | null
          department?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      people_roles: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          permissions: Json
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          permissions?: Json
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          permissions?: Json
          level?: number
          created_at?: string
          updated_at?: string
        }
      }
      people_competencies: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          category: string | null
          level_framework: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          category?: string | null
          level_framework?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          category?: string | null
          level_framework?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
