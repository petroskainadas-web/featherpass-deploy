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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      article_content: {
        Row: {
          article_type: string
          body: string
          created_at: string
          created_by: string | null
          id: number
          like_count: number
          published_date: string
          read_time: number
          tags: string[] | null
          title: string
          tldr: string
          updated_at: string
          view_count: number
        }
        Insert: {
          article_type: string
          body: string
          created_at?: string
          created_by?: string | null
          id?: number
          like_count?: number
          published_date?: string
          read_time: number
          tags?: string[] | null
          title: string
          tldr: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          article_type?: string
          body?: string
          created_at?: string
          created_by?: string | null
          id?: number
          like_count?: number
          published_date?: string
          read_time?: number
          tags?: string[] | null
          title?: string
          tldr?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      article_likes: {
        Row: {
          article_id: number
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          article_id: number
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          article_id?: number
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "article_content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_pdfs: {
        Row: {
          archived: boolean
          created_at: string
          created_by: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          replaced_by: string | null
        }
        Insert: {
          archived?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          replaced_by?: string | null
        }
        Update: {
          archived?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          replaced_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_pdfs_replaced_by_fkey"
            columns: ["replaced_by"]
            isOneToOne: false
            referencedRelation: "content_pdfs"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_image_files: {
        Row: {
          archived: boolean | null
          created_at: string | null
          created_by: string | null
          file_size: number | null
          height: number | null
          id: string
          large_path: string | null
          medium_path: string | null
          mime_type: string | null
          replaced_by: string | null
          thumbnail_path: string | null
          webp_path: string | null
          width: number | null
        }
        Insert: {
          archived?: boolean | null
          created_at?: string | null
          created_by?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          large_path?: string | null
          medium_path?: string | null
          mime_type?: string | null
          replaced_by?: string | null
          thumbnail_path?: string | null
          webp_path?: string | null
          width?: number | null
        }
        Update: {
          archived?: boolean | null
          created_at?: string | null
          created_by?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          large_path?: string | null
          medium_path?: string | null
          mime_type?: string | null
          replaced_by?: string | null
          thumbnail_path?: string | null
          webp_path?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_image_files_replaced_by_fkey"
            columns: ["replaced_by"]
            isOneToOne: false
            referencedRelation: "gallery_image_files"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          image_creation_tool: string | null
          image_description: string | null
          image_file_id: string | null
          image_type: string
          orientation: string
          prompt_used: string | null
          published_date: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_creation_tool?: string | null
          image_description?: string | null
          image_file_id?: string | null
          image_type: string
          orientation: string
          prompt_used?: string | null
          published_date?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_creation_tool?: string | null
          image_description?: string | null
          image_file_id?: string | null
          image_type?: string
          orientation?: string
          prompt_used?: string | null
          published_date?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_image_file_id_fkey"
            columns: ["image_file_id"]
            isOneToOne: false
            referencedRelation: "gallery_image_files"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          alt_text: string
          archived: boolean | null
          caption: string | null
          created_at: string | null
          created_by: string | null
          credit: string | null
          file_size: number | null
          height: number | null
          id: string
          large_path: string | null
          medium_path: string | null
          mime_type: string | null
          replaced_by: string | null
          thumbnail_path: string | null
          webp_path: string | null
          width: number | null
        }
        Insert: {
          alt_text: string
          archived?: boolean | null
          caption?: string | null
          created_at?: string | null
          created_by?: string | null
          credit?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          large_path?: string | null
          medium_path?: string | null
          mime_type?: string | null
          replaced_by?: string | null
          thumbnail_path?: string | null
          webp_path?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string
          archived?: boolean | null
          caption?: string | null
          created_at?: string | null
          created_by?: string | null
          credit?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          large_path?: string | null
          medium_path?: string | null
          mime_type?: string | null
          replaced_by?: string | null
          thumbnail_path?: string | null
          webp_path?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "images_replaced_by_fkey"
            columns: ["replaced_by"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
        ]
      }
      library_content: {
        Row: {
          content_data: Json
          content_type: string
          created_at: string | null
          created_by: string | null
          download_count: number | null
          id: string
          image_id: string | null
          level: string | null
          pdf_id: string | null
          rarity: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content_data: Json
          content_type: string
          created_at?: string | null
          created_by?: string | null
          download_count?: number | null
          id?: string
          image_id?: string | null
          level?: string | null
          pdf_id?: string | null
          rarity?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content_data?: Json
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          download_count?: number | null
          id?: string
          image_id?: string | null
          level?: string | null
          pdf_id?: string | null
          rarity?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_content_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_content_pdf_id_fkey"
            columns: ["pdf_id"]
            isOneToOne: false
            referencedRelation: "content_pdfs"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          confirmed: boolean
          convertkit_subscriber_id: string | null
          convertkit_synced: boolean
          created_at: string
          email: string
          id: string
          resubscribed_count: number
          source: string | null
          subscribed_at: string
          unsubscribe_reason: string | null
          unsubscribe_token: string
          unsubscribed: boolean
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          confirmed?: boolean
          convertkit_subscriber_id?: string | null
          convertkit_synced?: boolean
          created_at?: string
          email: string
          id?: string
          resubscribed_count?: number
          source?: string | null
          subscribed_at?: string
          unsubscribe_reason?: string | null
          unsubscribe_token?: string
          unsubscribed?: boolean
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          confirmed?: boolean
          convertkit_subscriber_id?: string | null
          convertkit_synced?: boolean
          created_at?: string
          email?: string
          id?: string
          resubscribed_count?: number
          source?: string | null
          subscribed_at?: string
          unsubscribe_reason?: string | null
          unsubscribe_token?: string
          unsubscribed?: boolean
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          used: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          used?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_archived_images: { Args: never; Returns: undefined }
      cleanup_expired_reset_tokens: { Args: never; Returns: undefined }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      increment_article_views: {
        Args: { article_id: number }
        Returns: undefined
      }
      increment_gallery_views: {
        Args: { gallery_image_id: string }
        Returns: undefined
      }
      increment_library_download_count: {
        Args: { content_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
