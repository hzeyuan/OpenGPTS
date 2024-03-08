export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      plans: {
        Row: {
          created_at: string
          description: string | null
          featured: boolean | null
          features: Json | null
          highlighted: boolean | null
          id: number
          power: number | null
          price: number | null
          product_id: number | null
          product_name: string | null
          slug: string | null
          status: string | null
          store_id: number | null
          variant_id: number | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          featured?: boolean | null
          features?: Json | null
          highlighted?: boolean | null
          id?: number
          power?: number | null
          price?: number | null
          product_id?: number | null
          product_name?: string | null
          slug?: string | null
          status?: string | null
          store_id?: number | null
          variant_id?: number | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          featured?: boolean | null
          features?: Json | null
          highlighted?: boolean | null
          id?: number
          power?: number | null
          price?: number | null
          product_id?: number | null
          product_name?: string | null
          slug?: string | null
          status?: string | null
          store_id?: number | null
          variant_id?: number | null
          variant_name?: string | null
        }
        Relationships: []
      }
      rpa_website_activity: {
        Row: {
          action_list: Json | null
          browser_url: string | null
          created_at: string
          id: number
          observation_list: Json | null
          task: string | null
          task_id: string
          thought_list: Json | null
        }
        Insert: {
          action_list?: Json | null
          browser_url?: string | null
          created_at?: string
          id?: number
          observation_list?: Json | null
          task?: string | null
          task_id?: string
          thought_list?: Json | null
        }
        Update: {
          action_list?: Json | null
          browser_url?: string | null
          created_at?: string
          id?: number
          observation_list?: Json | null
          task?: string | null
          task_id?: string
          thought_list?: Json | null
        }
        Relationships: []
      }
      tools: {
        Row: {
          auth_credentials: Json | null
          auth_type: string | null
          author: string
          base_url: string | null
          description: string | null
          display_name: string | null
          enable: number | null
          endpoint: string | null
          http_method: string | null
          img: string | null
          is_builtin: number | null
          is_private: number | null
          name: string
          output_result: Json
          parameters: Json
          tool_id: number
          tool_type: string
        }
        Insert: {
          auth_credentials?: Json | null
          auth_type?: string | null
          author?: string
          base_url?: string | null
          description?: string | null
          display_name?: string | null
          enable?: number | null
          endpoint?: string | null
          http_method?: string | null
          img?: string | null
          is_builtin?: number | null
          is_private?: number | null
          name?: string
          output_result?: Json
          parameters?: Json
          tool_id?: number
          tool_type?: string
        }
        Update: {
          auth_credentials?: Json | null
          auth_type?: string | null
          author?: string
          base_url?: string | null
          description?: string | null
          display_name?: string | null
          enable?: number | null
          endpoint?: string | null
          http_method?: string | null
          img?: string | null
          is_builtin?: number | null
          is_private?: number | null
          name?: string
          output_result?: Json
          parameters?: Json
          tool_id?: number
          tool_type?: string
        }
        Relationships: []
      }
      user_abilities: {
        Row: {
          created_at: string
          email: string
          id: number
          level: string | null
          power: number | null
          product_id: number | null
          product_name: string | null
          subscription_id: number | null
          subscription_status: string | null
          variant_id: number | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          level?: string | null
          power?: number | null
          product_id?: number | null
          product_name?: string | null
          subscription_id?: number | null
          subscription_status?: string | null
          variant_id?: number | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          level?: string | null
          power?: number | null
          product_id?: number | null
          product_name?: string | null
          subscription_id?: number | null
          subscription_status?: string | null
          variant_id?: number | null
          variant_name?: string | null
        }
        Relationships: []
      }
      user_subscription_history: {
        Row: {
          created_at: string
          details: Json | null
          email: string
          event_name: string | null
          id: number
          payment_status: string | null
          status: string | null
          subscription_name: string | null
          subscription_type: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          email: string
          event_name?: string | null
          id?: number
          payment_status?: string | null
          status?: string | null
          subscription_name?: string | null
          subscription_type?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          email?: string
          event_name?: string | null
          id?: number
          payment_status?: string | null
          status?: string | null
          subscription_name?: string | null
          subscription_type?: string | null
        }
        Relationships: []
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
