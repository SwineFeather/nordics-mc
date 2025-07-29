export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_merges: {
        Row: {
          id: string
          merged_at: string | null
          merged_by: string | null
          minecraft_username: string
          player_uuid: string
          source_profile_id: string | null
          target_profile_id: string | null
        }
        Insert: {
          id?: string
          merged_at?: string | null
          merged_by?: string | null
          minecraft_username: string
          player_uuid: string
          source_profile_id?: string | null
          target_profile_id?: string | null
        }
        Update: {
          id?: string
          merged_at?: string | null
          merged_by?: string | null
          minecraft_username?: string
          player_uuid?: string
          source_profile_id?: string | null
          target_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_merges_merged_by_fkey"
            columns: ["merged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_merges_source_profile_id_fkey"
            columns: ["source_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_merges_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      achievement_definitions: {
        Row: {
          achievement_id: string
          achievement_type: string
          color: string | null
          description: string | null
          id: number
          name: string
          stat: string
        }
        Insert: {
          achievement_id: string
          achievement_type: string
          color?: string | null
          description?: string | null
          id?: number
          name: string
          stat: string
        }
        Update: {
          achievement_id?: string
          achievement_type?: string
          color?: string | null
          description?: string | null
          id?: number
          name?: string
          stat?: string
        }
        Relationships: []
      }
      achievement_tiers: {
        Row: {
          achievement_id: string
          description: string | null
          icon: string | null
          id: number
          name: string
          points: number
          threshold: number
          tier: number
        }
        Insert: {
          achievement_id: string
          description?: string | null
          icon?: string | null
          id?: number
          name: string
          points: number
          threshold: number
          tier: number
        }
        Update: {
          achievement_id?: string
          description?: string | null
          icon?: string | null
          id?: number
          name?: string
          points?: number
          threshold?: number
          tier?: number
        }
        Relationships: [
          {
            foreignKeyName: "achievement_tiers_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["achievement_id"]
          },
          {
            foreignKeyName: "achievement_tiers_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_progress"
            referencedColumns: ["achievement_id"]
          },
        ]
      }
      admin_actions: {
        Row: {
          action_type: string
          admin_name: string
          admin_uuid: string
          details: Json | null
          error_message: string | null
          id: number
          ip_address: unknown | null
          success: boolean | null
          target_id: string | null
          target_name: string | null
          target_type: string | null
          timestamp: string | null
        }
        Insert: {
          action_type: string
          admin_name: string
          admin_uuid: string
          details?: Json | null
          error_message?: string | null
          id?: number
          ip_address?: unknown | null
          success?: boolean | null
          target_id?: string | null
          target_name?: string | null
          target_type?: string | null
          timestamp?: string | null
        }
        Update: {
          action_type?: string
          admin_name?: string
          admin_uuid?: string
          details?: Json | null
          error_message?: string | null
          id?: number
          ip_address?: unknown | null
          success?: boolean | null
          target_id?: string | null
          target_name?: string | null
          target_type?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      admin_intelligence: {
        Row: {
          active_nations: number | null
          active_residents: number | null
          active_towns: number | null
          avg_nation_balance: number | null
          avg_nation_size: number | null
          avg_town_balance: number | null
          avg_town_size: number | null
          daily_transactions: number | null
          id: number
          inactive_town_threshold: number | null
          low_balance_threshold: number | null
          recorded_at: string | null
          total_balance: number | null
          total_nations: number | null
          total_plots: number | null
          total_residents: number | null
          total_towns: number | null
        }
        Insert: {
          active_nations?: number | null
          active_residents?: number | null
          active_towns?: number | null
          avg_nation_balance?: number | null
          avg_nation_size?: number | null
          avg_town_balance?: number | null
          avg_town_size?: number | null
          daily_transactions?: number | null
          id?: number
          inactive_town_threshold?: number | null
          low_balance_threshold?: number | null
          recorded_at?: string | null
          total_balance?: number | null
          total_nations?: number | null
          total_plots?: number | null
          total_residents?: number | null
          total_towns?: number | null
        }
        Update: {
          active_nations?: number | null
          active_residents?: number | null
          active_towns?: number | null
          avg_nation_balance?: number | null
          avg_nation_size?: number | null
          avg_town_balance?: number | null
          avg_town_size?: number | null
          daily_transactions?: number | null
          id?: number
          inactive_town_threshold?: number | null
          low_balance_threshold?: number | null
          recorded_at?: string | null
          total_balance?: number | null
          total_nations?: number | null
          total_plots?: number | null
          total_residents?: number | null
          total_towns?: number | null
        }
        Relationships: []
      }
      ai_answer_cache: {
        Row: {
          answer: string | null
          created_at: string | null
          entity: string | null
          hits: number | null
          id: number
          question_hash: string | null
          updated_at: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string | null
          entity?: string | null
          hits?: number | null
          id?: number
          question_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string | null
          entity?: string | null
          hits?: number | null
          id?: number
          question_hash?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_knowledgebase: {
        Row: {
          content: string
          created_at: string
          id: string
          section: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          section: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          section?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          endpoint: string
          id: number
          ip_address: unknown | null
          method: string
          response_code: number | null
          response_size: number | null
          response_time: number | null
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          endpoint: string
          id?: number
          ip_address?: unknown | null
          method: string
          response_code?: number | null
          response_size?: number | null
          response_time?: number | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          endpoint?: string
          id?: number
          ip_address?: unknown | null
          method?: string
          response_code?: number | null
          response_size?: number | null
          response_time?: number | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      atm_logs: {
        Row: {
          action_type: string
          created_at: string | null
          details: string | null
          id: number
          ip_address: string | null
          log_level: string
          player_name: string | null
          player_uuid: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          details?: string | null
          id?: number
          ip_address?: string | null
          log_level: string
          player_name?: string | null
          player_uuid?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          details?: string | null
          id?: number
          ip_address?: string | null
          log_level?: string
          player_name?: string | null
          player_uuid?: string | null
        }
        Relationships: []
      }
      atm_npcs: {
        Row: {
          company_name: string
          created_at: string | null
          id: number
          is_active: boolean | null
          last_used: string | null
          npc_name: string
          npc_uuid: string
          owner_name: string
          owner_uuid: string
          pitch: number
          spawn_cost: number | null
          total_fees_earned: number | null
          transaction_fee_rate: number | null
          world_name: string
          x: number
          y: number
          yaw: number
          z: number
        }
        Insert: {
          company_name: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          last_used?: string | null
          npc_name: string
          npc_uuid: string
          owner_name: string
          owner_uuid: string
          pitch: number
          spawn_cost?: number | null
          total_fees_earned?: number | null
          transaction_fee_rate?: number | null
          world_name: string
          x: number
          y: number
          yaw: number
          z: number
        }
        Update: {
          company_name?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          last_used?: string | null
          npc_name?: string
          npc_uuid?: string
          owner_name?: string
          owner_uuid?: string
          pitch?: number
          spawn_cost?: number | null
          total_fees_earned?: number | null
          transaction_fee_rate?: number | null
          world_name?: string
          x?: number
          y?: number
          yaw?: number
          z?: number
        }
        Relationships: []
      }
      atm_transactions: {
        Row: {
          amount: number
          failure_reason: string | null
          finance_company_id: string | null
          id: number
          item_type: string | null
          player_name: string
          player_uuid: string
          plot_id: string | null
          quantity: number | null
          status: string | null
          transaction_date: string | null
          transaction_fee: number | null
          transaction_type: string
        }
        Insert: {
          amount: number
          failure_reason?: string | null
          finance_company_id?: string | null
          id?: number
          item_type?: string | null
          player_name: string
          player_uuid: string
          plot_id?: string | null
          quantity?: number | null
          status?: string | null
          transaction_date?: string | null
          transaction_fee?: number | null
          transaction_type: string
        }
        Update: {
          amount?: number
          failure_reason?: string | null
          finance_company_id?: string | null
          id?: number
          item_type?: string | null
          player_name?: string
          player_uuid?: string
          plot_id?: string | null
          quantity?: number | null
          status?: string | null
          transaction_date?: string | null
          transaction_fee?: number | null
          transaction_type?: string
        }
        Relationships: []
      }
      backup_log: {
        Row: {
          backup_duration: number | null
          backup_name: string
          backup_path: string | null
          backup_size: number | null
          backup_type: string
          compression_ratio: number | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          id: number
          success: boolean | null
        }
        Insert: {
          backup_duration?: number | null
          backup_name: string
          backup_path?: string | null
          backup_size?: number | null
          backup_type: string
          compression_ratio?: number | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: number
          success?: boolean | null
        }
        Update: {
          backup_duration?: number | null
          backup_name?: string
          backup_path?: string | null
          backup_size?: number | null
          backup_type?: string
          compression_ratio?: number | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: number
          success?: boolean | null
        }
        Relationships: []
      }
      bonds: {
        Row: {
          amount: number
          bond_type: string
          created_at: string | null
          finance_company_id: string
          id: number
          is_redeemed: boolean | null
          maturity_date: string
          player_name: string
          player_uuid: string
          plot_id: string | null
          purchase_date: string | null
          redemption_date: string | null
          return_amount: number
          return_rate: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bond_type: string
          created_at?: string | null
          finance_company_id: string
          id?: number
          is_redeemed?: boolean | null
          maturity_date: string
          player_name: string
          player_uuid: string
          plot_id?: string | null
          purchase_date?: string | null
          redemption_date?: string | null
          return_amount: number
          return_rate: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bond_type?: string
          created_at?: string | null
          finance_company_id?: string
          id?: number
          is_redeemed?: boolean | null
          maturity_date?: string
          player_name?: string
          player_uuid?: string
          plot_id?: string | null
          purchase_date?: string | null
          redemption_date?: string | null
          return_amount?: number
          return_rate?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bonds_transactions: {
        Row: {
          amount: number
          collateral_quantity: number | null
          collateral_type: string | null
          created_at: string | null
          failure_reason: string | null
          finance_company_id: string
          id: number
          interest_rate: number | null
          investment_type: string
          ip_address: string | null
          item_type: string | null
          player_name: string
          player_uuid: string
          plot_id: string | null
          status: string | null
          term_days: number | null
          timestamp: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          collateral_quantity?: number | null
          collateral_type?: string | null
          created_at?: string | null
          failure_reason?: string | null
          finance_company_id: string
          id?: number
          interest_rate?: number | null
          investment_type: string
          ip_address?: string | null
          item_type?: string | null
          player_name: string
          player_uuid: string
          plot_id?: string | null
          status?: string | null
          term_days?: number | null
          timestamp?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          collateral_quantity?: number | null
          collateral_type?: string | null
          created_at?: string | null
          failure_reason?: string | null
          finance_company_id?: string
          id?: number
          interest_rate?: number | null
          investment_type?: string
          ip_address?: string | null
          item_type?: string | null
          player_name?: string
          player_uuid?: string
          plot_id?: string | null
          status?: string | null
          term_days?: number | null
          timestamp?: string | null
          transaction_type?: string
        }
        Relationships: []
      }
      central_fund_investments: {
        Row: {
          amount: number
          created_at: string | null
          fee_paid: number | null
          finance_company_id: string
          id: number
          investment_date: string | null
          investment_type: string
          status: string | null
          trigger_type: string
          trigger_value: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          fee_paid?: number | null
          finance_company_id: string
          id?: number
          investment_date?: string | null
          investment_type: string
          status?: string | null
          trigger_type: string
          trigger_value?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          fee_paid?: number | null
          finance_company_id?: string
          id?: number
          investment_date?: string | null
          investment_type?: string
          status?: string | null
          trigger_type?: string
          trigger_value?: string | null
        }
        Relationships: []
      }
      central_fund_stocks: {
        Row: {
          average_buy_price: number | null
          company_id: number
          created_at: string | null
          id: number
          last_trade_date: string | null
          shares_owned: number | null
          total_invested: number | null
          updated_at: string | null
        }
        Insert: {
          average_buy_price?: number | null
          company_id: number
          created_at?: string | null
          id?: number
          last_trade_date?: string | null
          shares_owned?: number | null
          total_invested?: number | null
          updated_at?: string | null
        }
        Update: {
          average_buy_price?: number | null
          company_id?: number
          created_at?: string | null
          id?: number
          last_trade_date?: string | null
          shares_owned?: number | null
          total_invested?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "central_fund_stocks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "stock_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_channels: {
        Row: {
          created_at: string
          decay_days: number
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          decay_days?: number
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          decay_days?: number
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          id: string
          is_edited: boolean
          is_saved: boolean
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          id?: string
          is_edited?: boolean
          is_saved?: boolean
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          id?: string
          is_edited?: boolean
          is_saved?: boolean
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_user_bans: {
        Row: {
          banned_by: string | null
          channel_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          reason: string | null
          user_id: string | null
        }
        Insert: {
          banned_by?: string | null
          channel_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          banned_by?: string | null
          channel_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_user_bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_user_bans_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_user_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          achievements: Json | null
          average_rating: number | null
          banner_url: string | null
          business_type: string | null
          ceo_uuid: string | null
          company_type: string | null
          created_at: string | null
          description: string | null
          discord_invite: string | null
          discord_server_id: string | null
          email: string | null
          executives: Json | null
          featured_products: Json | null
          founded_date: string | null
          gallery_images: Json | null
          headquarters_coords: string | null
          headquarters_world: string | null
          id: string
          industry: string | null
          inventory: Json | null
          is_featured: boolean | null
          is_open: boolean | null
          is_public: boolean | null
          keywords: string[] | null
          last_activity: string | null
          logo_url: string | null
          max_members: number | null
          member_count: number | null
          members: Json | null
          name: string
          owner_uuid: string
          parent_company_id: string | null
          primary_color: string | null
          review_count: number | null
          secondary_color: string | null
          slug: string
          social_links: Json | null
          status: string | null
          tagline: string | null
          tags: string[] | null
          total_revenue: number | null
          total_transactions: number | null
          town_id: number | null
          updated_at: string | null
          verification_date: string | null
          verification_status: string | null
          verified_by: string | null
          website_url: string | null
        }
        Insert: {
          achievements?: Json | null
          average_rating?: number | null
          banner_url?: string | null
          business_type?: string | null
          ceo_uuid?: string | null
          company_type?: string | null
          created_at?: string | null
          description?: string | null
          discord_invite?: string | null
          discord_server_id?: string | null
          email?: string | null
          executives?: Json | null
          featured_products?: Json | null
          founded_date?: string | null
          gallery_images?: Json | null
          headquarters_coords?: string | null
          headquarters_world?: string | null
          id?: string
          industry?: string | null
          inventory?: Json | null
          is_featured?: boolean | null
          is_open?: boolean | null
          is_public?: boolean | null
          keywords?: string[] | null
          last_activity?: string | null
          logo_url?: string | null
          max_members?: number | null
          member_count?: number | null
          members?: Json | null
          name: string
          owner_uuid: string
          parent_company_id?: string | null
          primary_color?: string | null
          review_count?: number | null
          secondary_color?: string | null
          slug: string
          social_links?: Json | null
          status?: string | null
          tagline?: string | null
          tags?: string[] | null
          total_revenue?: number | null
          total_transactions?: number | null
          town_id?: number | null
          updated_at?: string | null
          verification_date?: string | null
          verification_status?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Update: {
          achievements?: Json | null
          average_rating?: number | null
          banner_url?: string | null
          business_type?: string | null
          ceo_uuid?: string | null
          company_type?: string | null
          created_at?: string | null
          description?: string | null
          discord_invite?: string | null
          discord_server_id?: string | null
          email?: string | null
          executives?: Json | null
          featured_products?: Json | null
          founded_date?: string | null
          gallery_images?: Json | null
          headquarters_coords?: string | null
          headquarters_world?: string | null
          id?: string
          industry?: string | null
          inventory?: Json | null
          is_featured?: boolean | null
          is_open?: boolean | null
          is_public?: boolean | null
          keywords?: string[] | null
          last_activity?: string | null
          logo_url?: string | null
          max_members?: number | null
          member_count?: number | null
          members?: Json | null
          name?: string
          owner_uuid?: string
          parent_company_id?: string | null
          primary_color?: string | null
          review_count?: number | null
          secondary_color?: string | null
          slug?: string
          social_links?: Json | null
          status?: string | null
          tagline?: string | null
          tags?: string[] | null
          total_revenue?: number | null
          total_transactions?: number | null
          town_id?: number | null
          updated_at?: string | null
          verification_date?: string | null
          verification_status?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_parent_company_id_fkey"
            columns: ["parent_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_town_id_fkey"
            columns: ["town_id"]
            isOneToOne: false
            referencedRelation: "towns"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string
          id: number
          joined_at: number
          player_uuid: string
          role: string | null
        }
        Insert: {
          company_id: string
          id?: number
          joined_at?: number
          player_uuid: string
          role?: string | null
        }
        Update: {
          company_id?: string
          id?: number
          joined_at?: number
          player_uuid?: string
          role?: string | null
        }
        Relationships: []
      }
      company_staff: {
        Row: {
          company_id: string
          id: string
          joined_at: string | null
          player_uuid: string | null
          role: string
          user_uuid: string
        }
        Insert: {
          company_id: string
          id?: string
          joined_at?: string | null
          player_uuid?: string | null
          role: string
          user_uuid: string
        }
        Update: {
          company_id?: string
          id?: string
          joined_at?: string | null
          player_uuid?: string | null
          role?: string
          user_uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_staff_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_staff_user_uuid_fkey"
            columns: ["user_uuid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          created_at: string | null
          evidence: string | null
          id: string
          moderator_notes: string | null
          reason: string
          report_status: Database["public"]["Enums"]["report_status"] | null
          report_type: Database["public"]["Enums"]["report_type"]
          reporter_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          target_post_id: string | null
          target_reply_id: string | null
          target_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          evidence?: string | null
          id?: string
          moderator_notes?: string | null
          reason: string
          report_status?: Database["public"]["Enums"]["report_status"] | null
          report_type: Database["public"]["Enums"]["report_type"]
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          target_post_id?: string | null
          target_reply_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          evidence?: string | null
          id?: string
          moderator_notes?: string | null
          reason?: string
          report_status?: Database["public"]["Enums"]["report_status"] | null
          report_type?: Database["public"]["Enums"]["report_type"]
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          target_post_id?: string | null
          target_reply_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_target_post_id_fkey"
            columns: ["target_post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_target_reply_id_fkey"
            columns: ["target_reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_interest_payments: {
        Row: {
          balance_after: number
          balance_before: number
          created_at: string | null
          finance_company_id: string
          id: number
          interest_amount: number
          payment_date: string
          player_name: string
          player_uuid: string
          savings_account_id: number
          status: string | null
        }
        Insert: {
          balance_after: number
          balance_before: number
          created_at?: string | null
          finance_company_id: string
          id?: number
          interest_amount: number
          payment_date: string
          player_name: string
          player_uuid: string
          savings_account_id: number
          status?: string | null
        }
        Update: {
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          finance_company_id?: string
          id?: number
          interest_amount?: number
          payment_date?: string
          player_name?: string
          player_uuid?: string
          savings_account_id?: number
          status?: string | null
        }
        Relationships: []
      }
      daily_trade_limits: {
        Row: {
          created_at: string | null
          id: number
          player_uuid: string
          shares_traded: number | null
          trade_date: string
          trades_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          player_uuid: string
          shares_traded?: number | null
          trade_date: string
          trades_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          player_uuid?: string
          shares_traded?: number | null
          trade_date?: string
          trades_count?: number | null
        }
        Relationships: []
      }
      economic_analytics: {
        Row: {
          avg_plot_price: number | null
          avg_transaction_amount: number | null
          created_at: string | null
          date: string
          gdp_growth_rate: number | null
          id: number
          inflation_rate: number | null
          largest_transaction: number | null
          median_plot_price: number | null
          median_transaction_amount: number | null
          total_economy_volume: number | null
          total_plot_sales: number | null
          total_plot_sales_count: number | null
          total_taxes_collected: number | null
          wealth_distribution_gini: number | null
        }
        Insert: {
          avg_plot_price?: number | null
          avg_transaction_amount?: number | null
          created_at?: string | null
          date: string
          gdp_growth_rate?: number | null
          id?: number
          inflation_rate?: number | null
          largest_transaction?: number | null
          median_plot_price?: number | null
          median_transaction_amount?: number | null
          total_economy_volume?: number | null
          total_plot_sales?: number | null
          total_plot_sales_count?: number | null
          total_taxes_collected?: number | null
          wealth_distribution_gini?: number | null
        }
        Update: {
          avg_plot_price?: number | null
          avg_transaction_amount?: number | null
          created_at?: string | null
          date?: string
          gdp_growth_rate?: number | null
          id?: number
          inflation_rate?: number | null
          largest_transaction?: number | null
          median_plot_price?: number | null
          median_transaction_amount?: number | null
          total_economy_volume?: number | null
          total_plot_sales?: number | null
          total_plot_sales_count?: number | null
          total_taxes_collected?: number | null
          wealth_distribution_gini?: number | null
        }
        Relationships: []
      }
      economic_transactions: {
        Row: {
          amount: number
          category: string
          created_by: string | null
          description: string | null
          id: string
          nation_id: string | null
          reference_id: string | null
          town_id: string | null
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          amount: number
          category: string
          created_by?: string | null
          description?: string | null
          id?: string
          nation_id?: string | null
          reference_id?: string | null
          town_id?: string | null
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          amount?: number
          category?: string
          created_by?: string | null
          description?: string | null
          id?: string
          nation_id?: string | null
          reference_id?: string | null
          town_id?: string | null
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "economic_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          created_at: string
          event_id: string
          id: string
          responded_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          responded_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          responded_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          event_type: string
          id: string
          is_public: boolean | null
          is_recurring: boolean | null
          location: string | null
          max_attendees: number | null
          nation_id: string | null
          organizer_id: string
          recurrence_pattern: string | null
          start_time: string
          title: string
          town_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          event_type?: string
          id?: string
          is_public?: boolean | null
          is_recurring?: boolean | null
          location?: string | null
          max_attendees?: number | null
          nation_id?: string | null
          organizer_id: string
          recurrence_pattern?: string | null
          start_time: string
          title: string
          town_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          event_type?: string
          id?: string
          is_public?: boolean | null
          is_recurring?: boolean | null
          location?: string | null
          max_attendees?: number | null
          nation_id?: string | null
          organizer_id?: string
          recurrence_pattern?: string | null
          start_time?: string
          title?: string
          town_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_company_fees: {
        Row: {
          company_name: string
          fee_amount: number
          fee_rate: number
          id: number
          transaction_date: string | null
          transaction_id: number
        }
        Insert: {
          company_name: string
          fee_amount: number
          fee_rate: number
          id?: number
          transaction_date?: string | null
          transaction_id: number
        }
        Update: {
          company_name?: string
          fee_amount?: number
          fee_rate?: number
          id?: number
          transaction_date?: string | null
          transaction_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "finance_company_fees_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "stock_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      forex_balances: {
        Row: {
          balance: number | null
          created_at: string | null
          currency_type: string
          id: number
          last_update: string | null
          owner_name: string
          owner_uuid: string
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          currency_type: string
          id?: number
          last_update?: string | null
          owner_name: string
          owner_uuid: string
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          currency_type?: string
          id?: number
          last_update?: string | null
          owner_name?: string
          owner_uuid?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      forex_central_fund_trades: {
        Row: {
          amount: number
          created_at: string | null
          currency_pair: string
          fee_paid: number | null
          finance_company_id: string
          id: number
          rate: number
          status: string | null
          trade_date: string | null
          trade_type: string
          trigger_type: string
          trigger_value: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency_pair: string
          fee_paid?: number | null
          finance_company_id: string
          id?: number
          rate: number
          status?: string | null
          trade_date?: string | null
          trade_type: string
          trigger_type: string
          trigger_value?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency_pair?: string
          fee_paid?: number | null
          finance_company_id?: string
          id?: number
          rate?: number
          status?: string | null
          trade_date?: string | null
          trade_type?: string
          trigger_type?: string
          trigger_value?: string | null
        }
        Relationships: []
      }
      forex_daily_limits: {
        Row: {
          created_at: string | null
          id: number
          last_trade_date: string | null
          player_name: string
          player_uuid: string
          trades_today: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          last_trade_date?: string | null
          player_name: string
          player_uuid: string
          trades_today?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          last_trade_date?: string | null
          player_name?: string
          player_uuid?: string
          trades_today?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      forex_logs: {
        Row: {
          action_type: string
          company_name: string | null
          created_at: string | null
          id: number
          ip_address: string | null
          log_level: string
          message: string
          player_name: string | null
          player_uuid: string | null
          timestamp: string | null
        }
        Insert: {
          action_type: string
          company_name?: string | null
          created_at?: string | null
          id?: number
          ip_address?: string | null
          log_level: string
          message: string
          player_name?: string | null
          player_uuid?: string | null
          timestamp?: string | null
        }
        Update: {
          action_type?: string
          company_name?: string | null
          created_at?: string | null
          id?: number
          ip_address?: string | null
          log_level?: string
          message?: string
          player_name?: string | null
          player_uuid?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      forex_market_events: {
        Row: {
          created_at: string | null
          currency_affected: string
          duration_hours: number | null
          event_date: string
          event_type: string
          id: number
          is_active: boolean | null
          modifier_percentage: number
        }
        Insert: {
          created_at?: string | null
          currency_affected: string
          duration_hours?: number | null
          event_date: string
          event_type: string
          id?: number
          is_active?: boolean | null
          modifier_percentage: number
        }
        Update: {
          created_at?: string | null
          currency_affected?: string
          duration_hours?: number | null
          event_date?: string
          event_type?: string
          id?: number
          is_active?: boolean | null
          modifier_percentage?: number
        }
        Relationships: []
      }
      forex_npcs: {
        Row: {
          company_name: string
          created_at: string | null
          id: number
          is_active: boolean | null
          last_used: string | null
          npc_name: string
          npc_uuid: string
          owner_name: string
          owner_uuid: string
          pitch: number
          total_fees_earned: number | null
          total_trades_processed: number | null
          transaction_fee_rate: number | null
          updated_at: string | null
          world_name: string
          x: number
          y: number
          yaw: number
          z: number
        }
        Insert: {
          company_name: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          last_used?: string | null
          npc_name: string
          npc_uuid: string
          owner_name: string
          owner_uuid: string
          pitch: number
          total_fees_earned?: number | null
          total_trades_processed?: number | null
          transaction_fee_rate?: number | null
          updated_at?: string | null
          world_name: string
          x: number
          y: number
          yaw: number
          z: number
        }
        Update: {
          company_name?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          last_used?: string | null
          npc_name?: string
          npc_uuid?: string
          owner_name?: string
          owner_uuid?: string
          pitch?: number
          total_fees_earned?: number | null
          total_trades_processed?: number | null
          transaction_fee_rate?: number | null
          updated_at?: string | null
          world_name?: string
          x?: number
          y?: number
          yaw?: number
          z?: number
        }
        Relationships: []
      }
      forex_rates: {
        Row: {
          activity_modifier: number | null
          base_rate: number
          created_at: string | null
          currency_pair: string
          current_rate: number
          id: number
          last_update: string | null
          random_event_modifier: number | null
          supply_demand_modifier: number | null
          updated_at: string | null
        }
        Insert: {
          activity_modifier?: number | null
          base_rate: number
          created_at?: string | null
          currency_pair: string
          current_rate: number
          id?: number
          last_update?: string | null
          random_event_modifier?: number | null
          supply_demand_modifier?: number | null
          updated_at?: string | null
        }
        Update: {
          activity_modifier?: number | null
          base_rate?: number
          created_at?: string | null
          currency_pair?: string
          current_rate?: number
          id?: number
          last_update?: string | null
          random_event_modifier?: number | null
          supply_demand_modifier?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      forex_trade_activity: {
        Row: {
          created_at: string | null
          currency_pair: string
          daily_trades: number | null
          id: number
          last_daily_reset: string | null
          last_trade_time: string | null
          trade_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency_pair: string
          daily_trades?: number | null
          id?: number
          last_daily_reset?: string | null
          last_trade_time?: string | null
          trade_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency_pair?: string
          daily_trades?: number | null
          id?: number
          last_daily_reset?: string | null
          last_trade_time?: string | null
          trade_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      forex_transactions: {
        Row: {
          amount_bought: number
          amount_sold: number
          created_at: string | null
          currency_pair: string
          failure_reason: string | null
          fee: number | null
          finance_company_id: string
          id: number
          ip_address: string | null
          player_name: string
          player_uuid: string
          plot_id: string | null
          rate: number
          status: string | null
          timestamp: string | null
          transaction_type: string
        }
        Insert: {
          amount_bought: number
          amount_sold: number
          created_at?: string | null
          currency_pair: string
          failure_reason?: string | null
          fee?: number | null
          finance_company_id: string
          id?: number
          ip_address?: string | null
          player_name: string
          player_uuid: string
          plot_id?: string | null
          rate: number
          status?: string | null
          timestamp?: string | null
          transaction_type: string
        }
        Update: {
          amount_bought?: number
          amount_sold?: number
          created_at?: string | null
          currency_pair?: string
          failure_reason?: string | null
          fee?: number | null
          finance_company_id?: string
          id?: number
          ip_address?: string | null
          player_name?: string
          player_uuid?: string
          plot_id?: string | null
          rate?: number
          status?: string | null
          timestamp?: string | null
          transaction_type?: string
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_archived: boolean | null
          is_moderator_only: boolean | null
          name: string
          nation_name: string | null
          order_index: number | null
          slug: string
          town_name: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_archived?: boolean | null
          is_moderator_only?: boolean | null
          name: string
          nation_name?: string | null
          order_index?: number | null
          slug: string
          town_name?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_archived?: boolean | null
          is_moderator_only?: boolean | null
          name?: string
          nation_name?: string | null
          order_index?: number | null
          slug?: string
          town_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      forum_moderation_actions: {
        Row: {
          action_type: Database["public"]["Enums"]["moderation_action_type"]
          created_at: string | null
          details: string | null
          duration_hours: number | null
          id: string
          moderator_id: string | null
          reason: string | null
          target_post_id: string | null
          target_reply_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["moderation_action_type"]
          created_at?: string | null
          details?: string | null
          duration_hours?: number | null
          id?: string
          moderator_id?: string | null
          reason?: string | null
          target_post_id?: string | null
          target_reply_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["moderation_action_type"]
          created_at?: string | null
          details?: string | null
          duration_hours?: number | null
          id?: string
          moderator_id?: string | null
          reason?: string | null
          target_post_id?: string | null
          target_reply_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_moderation_actions_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_moderation_actions_target_post_id_fkey"
            columns: ["target_post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_moderation_actions_target_reply_id_fkey"
            columns: ["target_reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_moderation_actions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_notification_settings: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          mention_notifications: boolean | null
          post_id: string
          push_notifications: boolean | null
          reply_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          mention_notifications?: boolean | null
          post_id: string
          push_notifications?: boolean | null
          reply_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          mention_notifications?: boolean | null
          post_id?: string
          push_notifications?: boolean | null
          reply_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_notification_settings_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          notification_type: string
          post_id: string | null
          read_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          notification_type: string
          post_id?: string | null
          read_at?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          notification_type?: string
          post_id?: string | null
          read_at?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_post_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_post_tags: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "forum_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string | null
          id: string
          is_featured: boolean | null
          is_locked: boolean | null
          is_pinned: boolean | null
          post_type: Database["public"]["Enums"]["post_type"] | null
          reply_count: number | null
          search_vector: unknown | null
          tags: Json | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          post_type?: Database["public"]["Enums"]["post_type"] | null
          reply_count?: number | null
          search_vector?: unknown | null
          tags?: Json | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          post_type?: Database["public"]["Enums"]["post_type"] | null
          reply_count?: number | null
          search_vector?: unknown | null
          tags?: Json | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories_with_post_count"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          reply_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          reply_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type?: Database["public"]["Enums"]["reaction_type"]
          reply_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_reactions_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          post_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_subscriptions: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_subscriptions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_subscriptions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories_with_post_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_tags: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      investment_escrow: {
        Row: {
          allocated_amount: number
          allocation_percentage: number
          amount: number
          created_at: string | null
          finance_company_id: string
          id: number
          investment_id: string
          investment_type: string
          is_released: boolean | null
          release_date: string | null
          reserve_type: string
          updated_at: string | null
        }
        Insert: {
          allocated_amount: number
          allocation_percentage: number
          amount: number
          created_at?: string | null
          finance_company_id: string
          id?: number
          investment_id: string
          investment_type: string
          is_released?: boolean | null
          release_date?: string | null
          reserve_type: string
          updated_at?: string | null
        }
        Update: {
          allocated_amount?: number
          allocation_percentage?: number
          amount?: number
          created_at?: string | null
          finance_company_id?: string
          id?: number
          investment_id?: string
          investment_type?: string
          is_released?: boolean | null
          release_date?: string | null
          reserve_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      level_definitions: {
        Row: {
          color: string | null
          description: string | null
          id: number
          level: number
          level_type: string
          title: string
          xp_required: number
        }
        Insert: {
          color?: string | null
          description?: string | null
          id?: number
          level: number
          level_type: string
          title: string
          xp_required: number
        }
        Update: {
          color?: string | null
          description?: string | null
          id?: number
          level?: number
          level_type?: string
          title?: string
          xp_required?: number
        }
        Relationships: []
      }
      loans: {
        Row: {
          amount: number
          collateral_quantity: number | null
          collateral_type: string | null
          collateral_value: number | null
          created_at: string | null
          due_date: string
          finance_company_id: string
          id: number
          interest_rate: number
          is_repaid: boolean | null
          issue_date: string | null
          player_name: string
          player_uuid: string
          plot_id: string | null
          repayment_date: string | null
          status: string | null
          term_days: number
          total_interest: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          collateral_quantity?: number | null
          collateral_type?: string | null
          collateral_value?: number | null
          created_at?: string | null
          due_date: string
          finance_company_id: string
          id?: number
          interest_rate: number
          is_repaid?: boolean | null
          issue_date?: string | null
          player_name: string
          player_uuid: string
          plot_id?: string | null
          repayment_date?: string | null
          status?: string | null
          term_days: number
          total_interest: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          collateral_quantity?: number | null
          collateral_type?: string | null
          collateral_value?: number | null
          created_at?: string | null
          due_date?: string
          finance_company_id?: string
          id?: number
          interest_rate?: number
          is_repaid?: boolean | null
          issue_date?: string | null
          player_name?: string
          player_uuid?: string
          plot_id?: string | null
          repayment_date?: string | null
          status?: string | null
          term_days?: number
          total_interest?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      login_tokens: {
        Row: {
          created_at: string | null
          expires_at: number
          id: string
          player_name: string
          player_uuid: string
          token: string
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          expires_at: number
          id?: string
          player_name: string
          player_uuid: string
          token: string
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          expires_at?: number
          id?: string
          player_name?: string
          player_uuid?: string
          token?: string
          used?: boolean | null
        }
        Relationships: []
      }
      logs: {
        Row: {
          details: Json | null
          event_subtype: string | null
          event_type: string
          id: number
          impact_score: number | null
          is_admin_action: boolean | null
          is_major: boolean | null
          nation_id: number | null
          nation_name: string | null
          player_name: string | null
          player_uuid: string | null
          plot_id: number | null
          timestamp: string | null
          town_id: number | null
          town_name: string | null
        }
        Insert: {
          details?: Json | null
          event_subtype?: string | null
          event_type: string
          id?: number
          impact_score?: number | null
          is_admin_action?: boolean | null
          is_major?: boolean | null
          nation_id?: number | null
          nation_name?: string | null
          player_name?: string | null
          player_uuid?: string | null
          plot_id?: number | null
          timestamp?: string | null
          town_id?: number | null
          town_name?: string | null
        }
        Update: {
          details?: Json | null
          event_subtype?: string | null
          event_type?: string
          id?: number
          impact_score?: number | null
          is_admin_action?: boolean | null
          is_major?: boolean | null
          nation_id?: number | null
          nation_name?: string | null
          player_name?: string | null
          player_uuid?: string | null
          plot_id?: number | null
          timestamp?: string | null
          town_id?: number | null
          town_name?: string | null
        }
        Relationships: []
      }
      map_discussions: {
        Row: {
          author_id: string
          content: string
          created_at: string
          edited_at: string | null
          id: string
          is_moderated: boolean
          is_pinned: boolean
          map_date: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_moderated?: boolean
          is_pinned?: boolean
          map_date: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_moderated?: boolean
          is_pinned?: boolean
          map_date?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "map_discussions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_discussions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "map_discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      map_pins: {
        Row: {
          author_id: string
          category: string
          color: string
          created_at: string
          description: string | null
          icon: string
          id: string
          is_hidden: boolean
          map_date: string
          size: string
          title: string | null
          town_id: string | null
          updated_at: string
          x_position: number
          y_position: number
        }
        Insert: {
          author_id: string
          category?: string
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_hidden?: boolean
          map_date: string
          size?: string
          title?: string | null
          town_id?: string | null
          updated_at?: string
          x_position: number
          y_position: number
        }
        Update: {
          author_id?: string
          category?: string
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_hidden?: boolean
          map_date?: string
          size?: string
          title?: string | null
          town_id?: string | null
          updated_at?: string
          x_position?: number
          y_position?: number
        }
        Relationships: [
          {
            foreignKeyName: "map_pins_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      market_analytics: {
        Row: {
          avg_plot_price: number | null
          commercial_avg_price: number | null
          commercial_demand: number | null
          demand_trend: string | null
          embassy_avg_price: number | null
          embassy_demand: number | null
          fastest_growing_area: string | null
          highest_plot_price: number | null
          id: number
          inflation_rate: number | null
          investment_opportunities: Json | null
          lowest_plot_price: number | null
          market_alerts: Json | null
          market_bubble_score: number | null
          market_confidence: number | null
          median_plot_price: number | null
          most_active_area: string | null
          most_expensive_area: string | null
          plots_for_sale: number | null
          plots_sold_month: number | null
          plots_sold_today: number | null
          plots_sold_week: number | null
          price_predictions: Json | null
          price_trend: string | null
          price_volatility: number | null
          recorded_at: string | null
          residential_avg_price: number | null
          residential_demand: number | null
          total_plots: number | null
          volume_trend: string | null
        }
        Insert: {
          avg_plot_price?: number | null
          commercial_avg_price?: number | null
          commercial_demand?: number | null
          demand_trend?: string | null
          embassy_avg_price?: number | null
          embassy_demand?: number | null
          fastest_growing_area?: string | null
          highest_plot_price?: number | null
          id?: number
          inflation_rate?: number | null
          investment_opportunities?: Json | null
          lowest_plot_price?: number | null
          market_alerts?: Json | null
          market_bubble_score?: number | null
          market_confidence?: number | null
          median_plot_price?: number | null
          most_active_area?: string | null
          most_expensive_area?: string | null
          plots_for_sale?: number | null
          plots_sold_month?: number | null
          plots_sold_today?: number | null
          plots_sold_week?: number | null
          price_predictions?: Json | null
          price_trend?: string | null
          price_volatility?: number | null
          recorded_at?: string | null
          residential_avg_price?: number | null
          residential_demand?: number | null
          total_plots?: number | null
          volume_trend?: string | null
        }
        Update: {
          avg_plot_price?: number | null
          commercial_avg_price?: number | null
          commercial_demand?: number | null
          demand_trend?: string | null
          embassy_avg_price?: number | null
          embassy_demand?: number | null
          fastest_growing_area?: string | null
          highest_plot_price?: number | null
          id?: number
          inflation_rate?: number | null
          investment_opportunities?: Json | null
          lowest_plot_price?: number | null
          market_alerts?: Json | null
          market_bubble_score?: number | null
          market_confidence?: number | null
          median_plot_price?: number | null
          most_active_area?: string | null
          most_expensive_area?: string | null
          plots_for_sale?: number | null
          plots_sold_month?: number | null
          plots_sold_today?: number | null
          plots_sold_week?: number | null
          price_predictions?: Json | null
          price_trend?: string | null
          price_volatility?: number | null
          recorded_at?: string | null
          residential_avg_price?: number | null
          residential_demand?: number | null
          total_plots?: number | null
          volume_trend?: string | null
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          message_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          message_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          message_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          context: string | null
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          content: string
          context?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          content?: string
          context?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      military_campaigns: {
        Row: {
          campaign_type: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          objectives: Json | null
          organizer_id: string
          participants: Json | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          campaign_type: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          objectives?: Json | null
          organizer_id: string
          participants?: Json | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          campaign_type?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          objectives?: Json | null
          organizer_id?: string
          participants?: Json | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "military_campaigns_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      military_units: {
        Row: {
          commander_id: string | null
          created_at: string
          equipment: Json | null
          id: string
          name: string
          nation_id: string | null
          size: number | null
          status: string | null
          town_id: string | null
          unit_type: string
          updated_at: string
        }
        Insert: {
          commander_id?: string | null
          created_at?: string
          equipment?: Json | null
          id?: string
          name: string
          nation_id?: string | null
          size?: number | null
          status?: string | null
          town_id?: string | null
          unit_type: string
          updated_at?: string
        }
        Update: {
          commander_id?: string | null
          created_at?: string
          equipment?: Json | null
          id?: string
          name?: string
          nation_id?: string | null
          size?: number | null
          status?: string | null
          town_id?: string | null
          unit_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "military_units_commander_id_fkey"
            columns: ["commander_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_queue: {
        Row: {
          assigned_moderator_id: string | null
          content_id: string
          content_type: string
          created_at: string | null
          first_reported_at: string | null
          id: string
          last_reported_at: string | null
          notes: string | null
          priority: number | null
          report_count: number | null
          status: Database["public"]["Enums"]["report_status"] | null
          updated_at: string | null
        }
        Insert: {
          assigned_moderator_id?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          first_reported_at?: string | null
          id?: string
          last_reported_at?: string | null
          notes?: string | null
          priority?: number | null
          report_count?: number | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
        }
        Update: {
          assigned_moderator_id?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          first_reported_at?: string | null
          id?: string
          last_reported_at?: string | null
          notes?: string | null
          priority?: number | null
          report_count?: number | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_assigned_moderator_id_fkey"
            columns: ["assigned_moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mutual_funds: {
        Row: {
          amount: number
          created_at: string | null
          current_value: number
          finance_company_id: string
          fund_type: string
          id: number
          is_redeemed: boolean | null
          last_update: string | null
          player_name: string
          player_uuid: string
          plot_id: string | null
          purchase_date: string | null
          redemption_date: string | null
          return_percentage: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          current_value: number
          finance_company_id: string
          fund_type: string
          id?: number
          is_redeemed?: boolean | null
          last_update?: string | null
          player_name: string
          player_uuid: string
          plot_id?: string | null
          purchase_date?: string | null
          redemption_date?: string | null
          return_percentage?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          current_value?: number
          finance_company_id?: string
          fund_type?: string
          id?: number
          is_redeemed?: boolean | null
          last_update?: string | null
          player_name?: string
          player_uuid?: string
          plot_id?: string | null
          purchase_date?: string | null
          redemption_date?: string | null
          return_percentage?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      nations: {
        Row: {
          activity_score: number | null
          ally_count: number | null
          balance: number | null
          board: string | null
          capital_name: string | null
          capital_town_id: number | null
          capital_town_name: string | null
          capital_uuid: string | null
          created_at: string | null
          enemy_count: number | null
          growth_rate: number | null
          id: number
          image_url: string | null
          is_open: boolean | null
          is_public: boolean | null
          king_name: string | null
          king_uuid: string
          last_activity: string | null
          last_updated: string | null
          leader_name: string | null
          leader_uuid: string
          max_towns: number | null
          name: string
          residents_count: number | null
          tag: string | null
          taxes: number | null
          town_tax: number | null
          towns_count: number | null
        }
        Insert: {
          activity_score?: number | null
          ally_count?: number | null
          balance?: number | null
          board?: string | null
          capital_name?: string | null
          capital_town_id?: number | null
          capital_town_name?: string | null
          capital_uuid?: string | null
          created_at?: string | null
          enemy_count?: number | null
          growth_rate?: number | null
          id?: number
          image_url?: string | null
          is_open?: boolean | null
          is_public?: boolean | null
          king_name?: string | null
          king_uuid: string
          last_activity?: string | null
          last_updated?: string | null
          leader_name?: string | null
          leader_uuid: string
          max_towns?: number | null
          name: string
          residents_count?: number | null
          tag?: string | null
          taxes?: number | null
          town_tax?: number | null
          towns_count?: number | null
        }
        Update: {
          activity_score?: number | null
          ally_count?: number | null
          balance?: number | null
          board?: string | null
          capital_name?: string | null
          capital_town_id?: number | null
          capital_town_name?: string | null
          capital_uuid?: string | null
          created_at?: string | null
          enemy_count?: number | null
          growth_rate?: number | null
          id?: number
          image_url?: string | null
          is_open?: boolean | null
          is_public?: boolean | null
          king_name?: string | null
          king_uuid?: string
          last_activity?: string | null
          last_updated?: string | null
          leader_name?: string | null
          leader_uuid?: string
          max_towns?: number | null
          name?: string
          residents_count?: number | null
          tag?: string | null
          taxes?: number | null
          town_tax?: number | null
          towns_count?: number | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string | null
          daily_digest: boolean | null
          email_notifications: boolean | null
          id: string
          in_app_notifications: boolean | null
          like_notifications: boolean | null
          mention_notifications: boolean | null
          moderation_notifications: boolean | null
          push_notifications: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          reply_notifications: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
          weekly_digest: boolean | null
        }
        Insert: {
          created_at?: string | null
          daily_digest?: boolean | null
          email_notifications?: boolean | null
          id?: string
          in_app_notifications?: boolean | null
          like_notifications?: boolean | null
          mention_notifications?: boolean | null
          moderation_notifications?: boolean | null
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reply_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          weekly_digest?: boolean | null
        }
        Update: {
          created_at?: string | null
          daily_digest?: boolean | null
          email_notifications?: boolean | null
          id?: string
          in_app_notifications?: boolean | null
          like_notifications?: boolean | null
          mention_notifications?: boolean | null
          moderation_notifications?: boolean | null
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reply_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          weekly_digest?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          created_at: string | null
          email_body_template: string | null
          email_subject_template: string | null
          id: string
          is_active: boolean | null
          message_template: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          template_key: string
          title_template: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_body_template?: string | null
          email_subject_template?: string | null
          id?: string
          is_active?: boolean | null
          message_template: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          template_key: string
          title_template: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_body_template?: string | null
          email_subject_template?: string | null
          id?: string
          is_active?: boolean | null
          message_template?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          template_key?: string
          title_template?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      online_players: {
        Row: {
          id: string
          is_online: boolean | null
          last_seen: string | null
          player_name: string
          player_uuid: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          player_name: string
          player_uuid: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          player_name?: string
          player_uuid?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      page_revisions: {
        Row: {
          author_id: string | null
          comment: string | null
          content: string
          created_at: string
          id: string
          is_current: boolean | null
          page_id: string | null
          revision_number: number
          status: string
          title: string
        }
        Insert: {
          author_id?: string | null
          comment?: string | null
          content: string
          created_at?: string
          id?: string
          is_current?: boolean | null
          page_id?: string | null
          revision_number: number
          status?: string
          title: string
        }
        Update: {
          author_id?: string | null
          comment?: string | null
          content?: string
          created_at?: string
          id?: string
          is_current?: boolean | null
          page_id?: string | null
          revision_number?: number
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_revisions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_revisions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          id: number
          metric_name: string
          metric_type: string
          metric_value: number
          tags: Json | null
          timestamp: string | null
          unit: string | null
        }
        Insert: {
          id?: number
          metric_name: string
          metric_type: string
          metric_value: number
          tags?: Json | null
          timestamp?: string | null
          unit?: string | null
        }
        Update: {
          id?: number
          metric_name?: string
          metric_type?: string
          metric_value?: number
          tags?: Json | null
          timestamp?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      player_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          created_at: string | null
          id: string
          player_uuid: string
          value: number
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          created_at?: string | null
          id?: string
          player_uuid: string
          value?: number
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          created_at?: string | null
          id?: string
          player_uuid?: string
          value?: number
        }
        Relationships: []
      }
      player_awards: {
        Row: {
          achieved_at: string | null
          award_description: string | null
          award_id: string
          award_name: string
          id: number
          medal: string
          player_uuid: string | null
          points: number
          stat_path: string | null
          stat_value: number | null
          tier: string
        }
        Insert: {
          achieved_at?: string | null
          award_description?: string | null
          award_id: string
          award_name: string
          id?: number
          medal: string
          player_uuid?: string | null
          points: number
          stat_path?: string | null
          stat_value?: number | null
          tier: string
        }
        Update: {
          achieved_at?: string | null
          award_description?: string | null
          award_id?: string
          award_name?: string
          id?: number
          medal?: string
          player_uuid?: string | null
          points?: number
          stat_path?: string | null
          stat_value?: number | null
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_awards_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "level_leaderboard"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "player_awards_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "player_leaderboard"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "player_awards_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "player_profiles_view"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "player_awards_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["uuid"]
          },
        ]
      }
      player_badges: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          badge_color: string | null
          badge_type: string
          icon: string | null
          icon_only: boolean | null
          id: string
          is_verified: boolean | null
          player_uuid: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          badge_color?: string | null
          badge_type?: string
          icon?: string | null
          icon_only?: boolean | null
          id?: string
          is_verified?: boolean | null
          player_uuid: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          badge_color?: string | null
          badge_type?: string
          icon?: string | null
          icon_only?: boolean | null
          id?: string
          is_verified?: boolean | null
          player_uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_badges_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_data: {
        Row: {
          id: number
          name: string
          placeholder_name: string
          updated_at: number | null
          uuid: string
          value: string | null
        }
        Insert: {
          id?: number
          name: string
          placeholder_name: string
          updated_at?: number | null
          uuid: string
          value?: string | null
        }
        Update: {
          id?: number
          name?: string
          placeholder_name?: string
          updated_at?: number | null
          uuid?: string
          value?: string | null
        }
        Relationships: []
      }
      player_dividends: {
        Row: {
          created_at: string | null
          dividend_amount: number
          dividend_id: number
          id: number
          is_paid: boolean | null
          paid_at: string | null
          player_name: string
          player_uuid: string
          shares_owned: number
        }
        Insert: {
          created_at?: string | null
          dividend_amount: number
          dividend_id: number
          id?: number
          is_paid?: boolean | null
          paid_at?: string | null
          player_name: string
          player_uuid: string
          shares_owned: number
        }
        Update: {
          created_at?: string | null
          dividend_amount?: number
          dividend_id?: number
          id?: number
          is_paid?: boolean | null
          paid_at?: string | null
          player_name?: string
          player_uuid?: string
          shares_owned?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_dividends_dividend_id_fkey"
            columns: ["dividend_id"]
            isOneToOne: false
            referencedRelation: "stock_dividends"
            referencedColumns: ["id"]
          },
        ]
      }
      player_medals: {
        Row: {
          bronze_count: number
          gold_count: number
          player_uuid: string
          silver_count: number
          total_medals: number
          updated_at: string | null
        }
        Insert: {
          bronze_count?: number
          gold_count?: number
          player_uuid: string
          silver_count?: number
          total_medals?: number
          updated_at?: string | null
        }
        Update: {
          bronze_count?: number
          gold_count?: number
          player_uuid?: string
          silver_count?: number
          total_medals?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_medals_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: true
            referencedRelation: "level_leaderboard"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "player_medals_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: true
            referencedRelation: "player_leaderboard"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "player_medals_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: true
            referencedRelation: "player_profiles_view"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "player_medals_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["uuid"]
          },
        ]
      }
      player_points: {
        Row: {
          player_uuid: string
          total_points: number
          updated_at: string | null
        }
        Insert: {
          player_uuid: string
          total_points?: number
          updated_at?: string | null
        }
        Update: {
          player_uuid?: string
          total_points?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_points_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: true
            referencedRelation: "level_leaderboard"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "player_points_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: true
            referencedRelation: "player_leaderboard"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "player_points_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: true
            referencedRelation: "player_profiles_view"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "player_points_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["uuid"]
          },
        ]
      }
      player_sessions: {
        Row: {
          actions_performed: number | null
          client_version: string | null
          duration_seconds: number | null
          id: number
          ip_address: unknown | null
          join_location: Json | null
          leave_location: Json | null
          player_name: string
          player_uuid: string
          plots_visited: number | null
          session_end: string | null
          session_start: string
          towns_visited: number | null
          transactions_made: number | null
        }
        Insert: {
          actions_performed?: number | null
          client_version?: string | null
          duration_seconds?: number | null
          id?: number
          ip_address?: unknown | null
          join_location?: Json | null
          leave_location?: Json | null
          player_name: string
          player_uuid: string
          plots_visited?: number | null
          session_end?: string | null
          session_start: string
          towns_visited?: number | null
          transactions_made?: number | null
        }
        Update: {
          actions_performed?: number | null
          client_version?: string | null
          duration_seconds?: number | null
          id?: number
          ip_address?: unknown | null
          join_location?: Json | null
          leave_location?: Json | null
          player_name?: string
          player_uuid?: string
          plots_visited?: number | null
          session_end?: string | null
          session_start?: string
          towns_visited?: number | null
          transactions_made?: number | null
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          id: number
          last_updated: number | null
          player_uuid: string | null
          stats: Json
        }
        Insert: {
          id?: number
          last_updated?: number | null
          player_uuid?: string | null
          stats?: Json
        }
        Update: {
          id?: number
          last_updated?: number | null
          player_uuid?: string | null
          stats?: Json
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: true
            referencedRelation: "level_leaderboard"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "player_stats_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: true
            referencedRelation: "player_leaderboard"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "player_stats_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: true
            referencedRelation: "player_profiles_view"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "player_stats_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["uuid"]
          },
        ]
      }
      player_stocks: {
        Row: {
          average_buy_price: number | null
          company_id: number
          created_at: string | null
          id: number
          last_dividend_amount: number | null
          last_dividend_date: string | null
          player_name: string
          player_uuid: string
          shares_owned: number | null
          total_invested: number | null
          updated_at: string | null
        }
        Insert: {
          average_buy_price?: number | null
          company_id: number
          created_at?: string | null
          id?: number
          last_dividend_amount?: number | null
          last_dividend_date?: string | null
          player_name: string
          player_uuid: string
          shares_owned?: number | null
          total_invested?: number | null
          updated_at?: string | null
        }
        Update: {
          average_buy_price?: number | null
          company_id?: number
          created_at?: string | null
          id?: number
          last_dividend_amount?: number | null
          last_dividend_date?: string | null
          player_name?: string
          player_uuid?: string
          shares_owned?: number | null
          total_invested?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_stocks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "stock_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      player_trade_cooldowns: {
        Row: {
          company_id: number
          id: number
          last_trade_time: string | null
          player_uuid: string
        }
        Insert: {
          company_id: number
          id?: number
          last_trade_time?: string | null
          player_uuid: string
        }
        Update: {
          company_id?: number
          id?: number
          last_trade_time?: string | null
          player_uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_trade_cooldowns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "stock_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          last_level_up: number | null
          last_seen: number | null
          level: number | null
          name: string
          player_uuid: string
          total_xp: number | null
          uuid: string
        }
        Insert: {
          last_level_up?: number | null
          last_seen?: number | null
          level?: number | null
          name: string
          player_uuid: string
          total_xp?: number | null
          uuid: string
        }
        Update: {
          last_level_up?: number | null
          last_seen?: number | null
          level?: number | null
          name?: string
          player_uuid?: string
          total_xp?: number | null
          uuid?: string
        }
        Relationships: []
      }
      plot_offers: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: number
          market_comparison: number | null
          offer_amount: number | null
          offer_message: string | null
          offer_trend: string | null
          offerer_name: string | null
          offerer_uuid: string | null
          plot_coordinates: string | null
          plot_id: number | null
          responded_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: number
          market_comparison?: number | null
          offer_amount?: number | null
          offer_message?: string | null
          offer_trend?: string | null
          offerer_name?: string | null
          offerer_uuid?: string | null
          plot_coordinates?: string | null
          plot_id?: number | null
          responded_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: number
          market_comparison?: number | null
          offer_amount?: number | null
          offer_message?: string | null
          offer_trend?: string | null
          offerer_name?: string | null
          offerer_uuid?: string | null
          plot_coordinates?: string | null
          plot_id?: number | null
          responded_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      plots: {
        Row: {
          comparable_plots: Json | null
          created_at: string | null
          current_offers: Json | null
          days_listed: number | null
          demand_score: number | null
          for_sale: boolean | null
          highest_offer: number | null
          id: number
          last_offer_received: string | null
          last_sold_date: string | null
          last_sold_price: number | null
          last_updated: string | null
          last_viewed: string | null
          listed_at: string | null
          listing_description: string | null
          market_trend: string | null
          market_value: number | null
          offer_count: number | null
          owner_name: string | null
          owner_uuid: string | null
          permissions: Json | null
          plot_features: Json | null
          plot_type: string | null
          price: number | null
          price_history: Json | null
          sale_count: number | null
          tax_rate: number | null
          town_id: number | null
          town_name: string | null
          view_count: number | null
          world_name: string
          x: number
          z: number
        }
        Insert: {
          comparable_plots?: Json | null
          created_at?: string | null
          current_offers?: Json | null
          days_listed?: number | null
          demand_score?: number | null
          for_sale?: boolean | null
          highest_offer?: number | null
          id?: number
          last_offer_received?: string | null
          last_sold_date?: string | null
          last_sold_price?: number | null
          last_updated?: string | null
          last_viewed?: string | null
          listed_at?: string | null
          listing_description?: string | null
          market_trend?: string | null
          market_value?: number | null
          offer_count?: number | null
          owner_name?: string | null
          owner_uuid?: string | null
          permissions?: Json | null
          plot_features?: Json | null
          plot_type?: string | null
          price?: number | null
          price_history?: Json | null
          sale_count?: number | null
          tax_rate?: number | null
          town_id?: number | null
          town_name?: string | null
          view_count?: number | null
          world_name: string
          x: number
          z: number
        }
        Update: {
          comparable_plots?: Json | null
          created_at?: string | null
          current_offers?: Json | null
          days_listed?: number | null
          demand_score?: number | null
          for_sale?: boolean | null
          highest_offer?: number | null
          id?: number
          last_offer_received?: string | null
          last_sold_date?: string | null
          last_sold_price?: number | null
          last_updated?: string | null
          last_viewed?: string | null
          listed_at?: string | null
          listing_description?: string | null
          market_trend?: string | null
          market_value?: number | null
          offer_count?: number | null
          owner_name?: string | null
          owner_uuid?: string | null
          permissions?: Json | null
          plot_features?: Json | null
          plot_type?: string | null
          price?: number | null
          price_history?: Json | null
          sale_count?: number | null
          tax_rate?: number | null
          town_id?: number | null
          town_name?: string | null
          view_count?: number | null
          world_name?: string
          x?: number
          z?: number
        }
        Relationships: []
      }
      post_drafts: {
        Row: {
          category_id: string | null
          content: string
          created_at: string | null
          id: string
          post_type: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          post_type?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          post_type?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_drafts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_drafts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories_with_post_count"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          anonymous_mode: boolean
          avatar_url: string | null
          banned_until: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          is_moderator: boolean | null
          minecraft_username: string | null
          muted_until: string | null
          role: Database["public"]["Enums"]["app_role"]
          silent_join_leave: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          anonymous_mode?: boolean
          avatar_url?: string | null
          banned_until?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          is_moderator?: boolean | null
          minecraft_username?: string | null
          muted_until?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          silent_join_leave?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          anonymous_mode?: boolean
          avatar_url?: string | null
          banned_until?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_moderator?: boolean | null
          minecraft_username?: string | null
          muted_until?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          silent_join_leave?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      realtime_notifications: {
        Row: {
          data: Json | null
          delivered_to: Json | null
          expires_at: string | null
          id: number
          message: string | null
          notification_type: string
          priority: number | null
          sent_at: string | null
          target_audience: string | null
          title: string | null
        }
        Insert: {
          data?: Json | null
          delivered_to?: Json | null
          expires_at?: string | null
          id?: number
          message?: string | null
          notification_type: string
          priority?: number | null
          sent_at?: string | null
          target_audience?: string | null
          title?: string | null
        }
        Update: {
          data?: Json | null
          delivered_to?: Json | null
          expires_at?: string | null
          id?: number
          message?: string | null
          notification_type?: string
          priority?: number | null
          sent_at?: string | null
          target_audience?: string | null
          title?: string | null
        }
        Relationships: []
      }
      reputation_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_type: string
          id: string
          points_change: number
          related_post_id: string | null
          related_reaction_id: string | null
          related_reply_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_type: string
          id?: string
          points_change: number
          related_post_id?: string | null
          related_reaction_id?: string | null
          related_reply_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_type?: string
          id?: string
          points_change?: number
          related_post_id?: string | null
          related_reaction_id?: string | null
          related_reply_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reputation_events_related_post_id_fkey"
            columns: ["related_post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reputation_events_related_reaction_id_fkey"
            columns: ["related_reaction_id"]
            isOneToOne: false
            referencedRelation: "forum_reactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reputation_events_related_reply_id_fkey"
            columns: ["related_reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reputation_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      residents: {
        Row: {
          activity_score: number | null
          balance: number | null
          is_assistant: boolean | null
          is_king: boolean | null
          is_mayor: boolean | null
          is_treasurer: boolean | null
          last_activity: string | null
          last_login: string | null
          last_nation_change: string | null
          last_town_change: string | null
          login_count: number | null
          name: string | null
          nation_id: number | null
          nation_name: string | null
          owned_nations: number | null
          owned_plots: number | null
          owned_towns: number | null
          permissions: Json | null
          registered: string | null
          total_deposits: number | null
          total_playtime: number | null
          total_taxes_paid: number | null
          total_withdrawals: number | null
          town_id: number | null
          town_name: string | null
          uuid: string
        }
        Insert: {
          activity_score?: number | null
          balance?: number | null
          is_assistant?: boolean | null
          is_king?: boolean | null
          is_mayor?: boolean | null
          is_treasurer?: boolean | null
          last_activity?: string | null
          last_login?: string | null
          last_nation_change?: string | null
          last_town_change?: string | null
          login_count?: number | null
          name?: string | null
          nation_id?: number | null
          nation_name?: string | null
          owned_nations?: number | null
          owned_plots?: number | null
          owned_towns?: number | null
          permissions?: Json | null
          registered?: string | null
          total_deposits?: number | null
          total_playtime?: number | null
          total_taxes_paid?: number | null
          total_withdrawals?: number | null
          town_id?: number | null
          town_name?: string | null
          uuid: string
        }
        Update: {
          activity_score?: number | null
          balance?: number | null
          is_assistant?: boolean | null
          is_king?: boolean | null
          is_mayor?: boolean | null
          is_treasurer?: boolean | null
          last_activity?: string | null
          last_login?: string | null
          last_nation_change?: string | null
          last_town_change?: string | null
          login_count?: number | null
          name?: string | null
          nation_id?: number | null
          nation_name?: string | null
          owned_nations?: number | null
          owned_plots?: number | null
          owned_towns?: number | null
          permissions?: Json | null
          registered?: string | null
          total_deposits?: number | null
          total_playtime?: number | null
          total_taxes_paid?: number | null
          total_withdrawals?: number | null
          town_id?: number | null
          town_name?: string | null
          uuid?: string
        }
        Relationships: []
      }
      resource_contributions: {
        Row: {
          amount: number
          contribution_date: string
          contributor_id: string
          id: string
          project_id: string
          resource_name: string
        }
        Insert: {
          amount: number
          contribution_date?: string
          contributor_id: string
          id?: string
          project_id: string
          resource_name: string
        }
        Update: {
          amount?: number
          contribution_date?: string
          contributor_id?: string
          id?: string
          project_id?: string
          resource_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_contributions_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_contributions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "resource_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          priority: string | null
          progress: number | null
          project_type: string
          status: string | null
          target_completion: string | null
          town_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          priority?: string | null
          progress?: number | null
          project_type?: string
          status?: string | null
          target_completion?: string | null
          town_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          priority?: string | null
          progress?: number | null
          project_type?: string
          status?: string | null
          target_completion?: string | null
          town_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_requirements: {
        Row: {
          created_at: string
          current_amount: number | null
          id: string
          project_id: string
          required_amount: number
          resource_name: string
          unit: string | null
        }
        Insert: {
          created_at?: string
          current_amount?: number | null
          id?: string
          project_id: string
          required_amount: number
          resource_name: string
          unit?: string | null
        }
        Update: {
          created_at?: string
          current_amount?: number | null
          id?: string
          project_id?: string
          required_amount?: number
          resource_name?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_requirements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "resource_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_chat_messages: {
        Row: {
          created_at: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_chat_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_forum_posts: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_forum_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_accounts: {
        Row: {
          account_opened: string | null
          balance: number | null
          created_at: string | null
          daily_interest_rate: number | null
          finance_company_id: string
          id: number
          last_interest_date: string | null
          last_transaction: string | null
          player_name: string
          player_uuid: string
          plot_id: string | null
          status: string | null
          total_interest_earned: number | null
          updated_at: string | null
        }
        Insert: {
          account_opened?: string | null
          balance?: number | null
          created_at?: string | null
          daily_interest_rate?: number | null
          finance_company_id: string
          id?: number
          last_interest_date?: string | null
          last_transaction?: string | null
          player_name: string
          player_uuid: string
          plot_id?: string | null
          status?: string | null
          total_interest_earned?: number | null
          updated_at?: string | null
        }
        Update: {
          account_opened?: string | null
          balance?: number | null
          created_at?: string | null
          daily_interest_rate?: number | null
          finance_company_id?: string
          id?: number
          last_interest_date?: string | null
          last_transaction?: string | null
          player_name?: string
          player_uuid?: string
          plot_id?: string | null
          status?: string | null
          total_interest_earned?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          details: string | null
          event_type: string
          id: number
          ip_address: unknown | null
          timestamp: string | null
          username: string | null
        }
        Insert: {
          details?: string | null
          event_type: string
          id?: number
          ip_address?: unknown | null
          timestamp?: string | null
          username?: string | null
        }
        Update: {
          details?: string | null
          event_type?: string
          id?: number
          ip_address?: unknown | null
          timestamp?: string | null
          username?: string | null
        }
        Relationships: []
      }
      server_analytics: {
        Row: {
          active_players: number | null
          avg_session_duration: number | null
          created_at: string | null
          date: string
          id: number
          low_players: number | null
          low_time: string | null
          new_players: number | null
          peak_players: number | null
          peak_time: string | null
          total_nations: number | null
          total_players: number | null
          total_plots: number | null
          total_towns: number | null
          total_transaction_volume: number | null
          total_transactions: number | null
          updated_at: string | null
        }
        Insert: {
          active_players?: number | null
          avg_session_duration?: number | null
          created_at?: string | null
          date: string
          id?: number
          low_players?: number | null
          low_time?: string | null
          new_players?: number | null
          peak_players?: number | null
          peak_time?: string | null
          total_nations?: number | null
          total_players?: number | null
          total_plots?: number | null
          total_towns?: number | null
          total_transaction_volume?: number | null
          total_transactions?: number | null
          updated_at?: string | null
        }
        Update: {
          active_players?: number | null
          avg_session_duration?: number | null
          created_at?: string | null
          date?: string
          id?: number
          low_players?: number | null
          low_time?: string | null
          new_players?: number | null
          peak_players?: number | null
          peak_time?: string | null
          total_nations?: number | null
          total_players?: number | null
          total_plots?: number | null
          total_towns?: number | null
          total_transaction_volume?: number | null
          total_transactions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shop_transactions: {
        Row: {
          amount: number
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          proof_image_url: string
          shop_id: string
          user_id: string
        }
        Insert: {
          amount: number
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          proof_image_url: string
          shop_id: string
          user_id: string
        }
        Update: {
          amount?: number
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          proof_image_url?: string
          shop_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_transactions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shop_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_transactions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          company_id: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          item_amount: number
          item_custom_model_data: number | null
          item_display_name: string | null
          item_durability: number
          item_enchants: Json | null
          item_lore: string[] | null
          item_type: string
          item_unbreakable: boolean | null
          last_updated: number
          owner_uuid: string
          price: number
          stock: number
          type: string
          unlimited: boolean
          world: string
          x: number
          y: number
          z: number
        }
        Insert: {
          company_id?: string | null
          description?: string | null
          id: string
          is_featured?: boolean | null
          item_amount: number
          item_custom_model_data?: number | null
          item_display_name?: string | null
          item_durability?: number
          item_enchants?: Json | null
          item_lore?: string[] | null
          item_type: string
          item_unbreakable?: boolean | null
          last_updated: number
          owner_uuid: string
          price: number
          stock: number
          type: string
          unlimited?: boolean
          world: string
          x: number
          y: number
          z: number
        }
        Update: {
          company_id?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          item_amount?: number
          item_custom_model_data?: number | null
          item_display_name?: string | null
          item_durability?: number
          item_enchants?: Json | null
          item_lore?: string[] | null
          item_type?: string
          item_unbreakable?: boolean | null
          last_updated?: number
          owner_uuid?: string
          price?: number
          stock?: number
          type?: string
          unlimited?: boolean
          world?: string
          x?: number
          y?: number
          z?: number
        }
        Relationships: [
          {
            foreignKeyName: "shops_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_companies: {
        Row: {
          available_shares: number | null
          base_price: number | null
          business_type: string
          company_name: string
          created_at: string | null
          current_price: number | null
          id: number
          is_suspended: boolean | null
          issued_shares: number | null
          last_price_update: string | null
          max_shares: number | null
          suspension_reason: string | null
          suspension_until: string | null
          tier: number | null
          total_value: number | null
          updated_at: string | null
        }
        Insert: {
          available_shares?: number | null
          base_price?: number | null
          business_type: string
          company_name: string
          created_at?: string | null
          current_price?: number | null
          id?: number
          is_suspended?: boolean | null
          issued_shares?: number | null
          last_price_update?: string | null
          max_shares?: number | null
          suspension_reason?: string | null
          suspension_until?: string | null
          tier?: number | null
          total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          available_shares?: number | null
          base_price?: number | null
          business_type?: string
          company_name?: string
          created_at?: string | null
          current_price?: number | null
          id?: number
          is_suspended?: boolean | null
          issued_shares?: number | null
          last_price_update?: string | null
          max_shares?: number | null
          suspension_reason?: string | null
          suspension_until?: string | null
          tier?: number | null
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_dividends: {
        Row: {
          company_id: number
          created_at: string | null
          dividend_date: string
          dividend_rate: number
          id: number
          is_paid: boolean | null
          shares_eligible: number
          total_payout: number
        }
        Insert: {
          company_id: number
          created_at?: string | null
          dividend_date: string
          dividend_rate: number
          id?: number
          is_paid?: boolean | null
          shares_eligible: number
          total_payout: number
        }
        Update: {
          company_id?: number
          created_at?: string | null
          dividend_date?: string
          dividend_rate?: number
          id?: number
          is_paid?: boolean | null
          shares_eligible?: number
          total_payout?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_dividends_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "stock_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_market_events: {
        Row: {
          company_id: number | null
          created_at: string | null
          duration_hours: number | null
          event_description: string | null
          event_name: string
          event_type: string
          expires_at: string | null
          id: number
          is_active: boolean | null
          price_impact: number
        }
        Insert: {
          company_id?: number | null
          created_at?: string | null
          duration_hours?: number | null
          event_description?: string | null
          event_name: string
          event_type: string
          expires_at?: string | null
          id?: number
          is_active?: boolean | null
          price_impact: number
        }
        Update: {
          company_id?: number | null
          created_at?: string | null
          duration_hours?: number | null
          event_description?: string | null
          event_name?: string
          event_type?: string
          expires_at?: string | null
          id?: number
          is_active?: boolean | null
          price_impact?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_market_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "stock_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_market_logs: {
        Row: {
          action_type: string
          company_id: number | null
          created_at: string | null
          details: string | null
          id: number
          ip_address: string | null
          log_level: string
          player_name: string | null
          player_uuid: string | null
        }
        Insert: {
          action_type: string
          company_id?: number | null
          created_at?: string | null
          details?: string | null
          id?: number
          ip_address?: string | null
          log_level: string
          player_name?: string | null
          player_uuid?: string | null
        }
        Update: {
          action_type?: string
          company_id?: number | null
          created_at?: string | null
          details?: string | null
          id?: number
          ip_address?: string | null
          log_level?: string
          player_name?: string | null
          player_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_market_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "stock_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_npcs: {
        Row: {
          company_name: string
          created_at: string | null
          id: number
          is_active: boolean | null
          last_used: string | null
          npc_name: string
          npc_uuid: string
          owner_name: string
          owner_uuid: string
          pitch: number
          spawn_cost: number | null
          total_fees_earned: number | null
          transaction_fee_rate: number | null
          world_name: string
          x: number
          y: number
          yaw: number
          z: number
        }
        Insert: {
          company_name: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          last_used?: string | null
          npc_name: string
          npc_uuid: string
          owner_name: string
          owner_uuid: string
          pitch: number
          spawn_cost?: number | null
          total_fees_earned?: number | null
          transaction_fee_rate?: number | null
          world_name: string
          x: number
          y: number
          yaw: number
          z: number
        }
        Update: {
          company_name?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          last_used?: string | null
          npc_name?: string
          npc_uuid?: string
          owner_name?: string
          owner_uuid?: string
          pitch?: number
          spawn_cost?: number | null
          total_fees_earned?: number | null
          transaction_fee_rate?: number | null
          world_name?: string
          x?: number
          y?: number
          yaw?: number
          z?: number
        }
        Relationships: []
      }
      stock_price_history: {
        Row: {
          close_price: number
          company_id: number
          created_at: string | null
          high_price: number
          id: number
          low_price: number
          open_price: number
          period_date: string
          period_type: string
          volume: number | null
        }
        Insert: {
          close_price: number
          company_id: number
          created_at?: string | null
          high_price: number
          id?: number
          low_price: number
          open_price: number
          period_date: string
          period_type: string
          volume?: number | null
        }
        Update: {
          close_price?: number
          company_id?: number
          created_at?: string | null
          high_price?: number
          id?: number
          low_price?: number
          open_price?: number
          period_date?: string
          period_type?: string
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_price_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "stock_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transactions: {
        Row: {
          company_id: number
          finance_company_id: string | null
          id: number
          is_central_fund_trade: boolean | null
          player_name: string
          player_uuid: string
          price_per_share: number
          shares_amount: number
          total_amount: number
          transaction_date: string | null
          transaction_fee: number | null
          transaction_type: string
        }
        Insert: {
          company_id: number
          finance_company_id?: string | null
          id?: number
          is_central_fund_trade?: boolean | null
          player_name: string
          player_uuid: string
          price_per_share: number
          shares_amount: number
          total_amount: number
          transaction_date?: string | null
          transaction_fee?: number | null
          transaction_type: string
        }
        Update: {
          company_id?: number
          finance_company_id?: string | null
          id?: number
          is_central_fund_trade?: boolean | null
          player_name?: string
          player_uuid?: string
          price_per_share?: number
          shares_amount?: number
          total_amount?: number
          transaction_date?: string | null
          transaction_fee?: number | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "stock_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_progress: {
        Row: {
          last_processed_batch: number | null
          last_updated: string | null
          sync_type: string
          total_batches: number | null
        }
        Insert: {
          last_processed_batch?: number | null
          last_updated?: string | null
          sync_type: string
          total_batches?: number | null
        }
        Update: {
          last_processed_batch?: number | null
          last_updated?: string | null
          sync_type?: string
          total_batches?: number | null
        }
        Relationships: []
      }
      system_health: {
        Row: {
          active_threads: number | null
          check_time: string | null
          database_connection: boolean | null
          database_response_time: number | null
          error_count: number | null
          id: number
          plugin_cpu_usage: number | null
          plugin_memory_usage: number | null
          server_cpu_usage: number | null
          server_memory_usage: number | null
          server_tps: number | null
          status: string | null
          warning_count: number | null
          websocket_connections: number | null
          websocket_health: boolean | null
        }
        Insert: {
          active_threads?: number | null
          check_time?: string | null
          database_connection?: boolean | null
          database_response_time?: number | null
          error_count?: number | null
          id?: number
          plugin_cpu_usage?: number | null
          plugin_memory_usage?: number | null
          server_cpu_usage?: number | null
          server_memory_usage?: number | null
          server_tps?: number | null
          status?: string | null
          warning_count?: number | null
          websocket_connections?: number | null
          websocket_health?: boolean | null
        }
        Update: {
          active_threads?: number | null
          check_time?: string | null
          database_connection?: boolean | null
          database_response_time?: number | null
          error_count?: number | null
          id?: number
          plugin_cpu_usage?: number | null
          plugin_memory_usage?: number | null
          server_cpu_usage?: number | null
          server_memory_usage?: number | null
          server_tps?: number | null
          status?: string | null
          warning_count?: number | null
          websocket_connections?: number | null
          websocket_health?: boolean | null
        }
        Relationships: []
      }
      town_achievement_definitions: {
        Row: {
          created_at: string | null
          description: string
          id: string
          name: string
          stat: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id: string
          name: string
          stat: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          stat?: string
        }
        Relationships: []
      }
      town_achievement_tiers: {
        Row: {
          achievement_id: string | null
          color: string | null
          created_at: string | null
          description: string
          icon: string | null
          id: string
          name: string
          points: number
          threshold: number
          tier: number
        }
        Insert: {
          achievement_id?: string | null
          color?: string | null
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          name: string
          points?: number
          threshold: number
          tier: number
        }
        Update: {
          achievement_id?: string | null
          color?: string | null
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          name?: string
          points?: number
          threshold?: number
          tier?: number
        }
        Relationships: [
          {
            foreignKeyName: "town_achievement_tiers_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "town_achievement_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      town_achievements: {
        Row: {
          achieved_at: string | null
          achievement_id: string
          id: number
          tier: number
          town_name: string
        }
        Insert: {
          achieved_at?: string | null
          achievement_id: string
          id?: number
          tier: number
          town_name: string
        }
        Update: {
          achieved_at?: string | null
          achievement_id?: string
          id?: number
          tier?: number
          town_name?: string
        }
        Relationships: []
      }
      town_gallery: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          file_url: string
          height: number | null
          id: string
          is_approved: boolean | null
          tags: string[] | null
          title: string
          town_name: string
          updated_at: string
          uploaded_at: string
          uploaded_by: string | null
          uploaded_by_username: string
          view_count: number | null
          width: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          height?: number | null
          id?: string
          is_approved?: boolean | null
          tags?: string[] | null
          title: string
          town_name: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
          uploaded_by_username: string
          view_count?: number | null
          width?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          height?: number | null
          id?: string
          is_approved?: boolean | null
          tags?: string[] | null
          title?: string
          town_name?: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
          uploaded_by_username?: string
          view_count?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "town_gallery_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      town_growth_analytics: {
        Row: {
          activity_score: number | null
          balance: number | null
          balance_change: number | null
          created_at: string | null
          date: string
          growth_rate: number | null
          id: number
          plots_change: number | null
          plots_count: number | null
          population: number | null
          population_change: number | null
          tax_rate: number | null
          tax_rate_change: number | null
          town_id: string
          town_name: string
        }
        Insert: {
          activity_score?: number | null
          balance?: number | null
          balance_change?: number | null
          created_at?: string | null
          date: string
          growth_rate?: number | null
          id?: number
          plots_change?: number | null
          plots_count?: number | null
          population?: number | null
          population_change?: number | null
          tax_rate?: number | null
          tax_rate_change?: number | null
          town_id: string
          town_name: string
        }
        Update: {
          activity_score?: number | null
          balance?: number | null
          balance_change?: number | null
          created_at?: string | null
          date?: string
          growth_rate?: number | null
          id?: number
          plots_change?: number | null
          plots_count?: number | null
          population?: number | null
          population_change?: number | null
          tax_rate?: number | null
          tax_rate_change?: number | null
          town_id?: string
          town_name?: string
        }
        Relationships: []
      }
      town_level_definitions: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          level: number
          title: string
          updated_at: string | null
          xp_required: number
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          level: number
          title?: string
          updated_at?: string | null
          xp_required: number
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          level?: number
          title?: string
          updated_at?: string | null
          xp_required?: number
        }
        Relationships: []
      }
      town_levels: {
        Row: {
          id: number
          last_updated: number | null
          level: number | null
          total_xp: number | null
          town_name: string
        }
        Insert: {
          id?: number
          last_updated?: number | null
          level?: number | null
          total_xp?: number | null
          town_name: string
        }
        Update: {
          id?: number
          last_updated?: number | null
          level?: number | null
          total_xp?: number | null
          town_name?: string
        }
        Relationships: []
      }
      town_stats: {
        Row: {
          age: number | null
          balance: number | null
          id: number
          is_capital: boolean | null
          is_independent: boolean | null
          last_updated: string | null
          mayor: string | null
          nation: string | null
          plot_count: number | null
          population: number | null
          size: number | null
          town_name: string
        }
        Insert: {
          age?: number | null
          balance?: number | null
          id?: number
          is_capital?: boolean | null
          is_independent?: boolean | null
          last_updated?: string | null
          mayor?: string | null
          nation?: string | null
          plot_count?: number | null
          population?: number | null
          size?: number | null
          town_name: string
        }
        Update: {
          age?: number | null
          balance?: number | null
          id?: number
          is_capital?: boolean | null
          is_independent?: boolean | null
          last_updated?: string | null
          mayor?: string | null
          nation?: string | null
          plot_count?: number | null
          population?: number | null
          size?: number | null
          town_name?: string
        }
        Relationships: []
      }
      town_unlocked_achievements: {
        Row: {
          claimed_at: string | null
          id: string
          is_claimed: boolean | null
          tier_id: string
          town_id: string
          unlocked_at: string | null
        }
        Insert: {
          claimed_at?: string | null
          id?: string
          is_claimed?: boolean | null
          tier_id: string
          town_id: string
          unlocked_at?: string | null
        }
        Update: {
          claimed_at?: string | null
          id?: string
          is_claimed?: boolean | null
          tier_id?: string
          town_id?: string
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_town_unlocked_achievements_tier_id"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "town_achievement_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      towns: {
        Row: {
          activity_score: number | null
          balance: number | null
          board: string | null
          created_at: string | null
          embassy_plot_count: number | null
          embassy_tax: number | null
          growth_rate: number | null
          home_block_count: number | null
          id: number
          image_url: string | null
          is_capital: boolean | null
          is_open: boolean | null
          is_public: boolean | null
          last_activity: string | null
          last_updated: string | null
          level: number
          location_x: number | null
          location_z: number | null
          market_value: number | null
          max_plots: number | null
          max_residents: number | null
          mayor_name: string | null
          mayor_uuid: string
          min_plots: number | null
          min_residents: number | null
          name: string
          nation_id: number | null
          nation_name: string | null
          nation_uuid: string | null
          plot_price: number | null
          plot_tax: number | null
          plots_count: number | null
          residents: Json | null
          residents_count: number | null
          shop_plot_count: number | null
          shop_tax: number | null
          spawn_pitch: number | null
          spawn_x: number | null
          spawn_y: number | null
          spawn_yaw: number | null
          spawn_z: number | null
          tag: string | null
          taxes: number | null
          total_xp: number
          wild_plot_count: number | null
          world_name: string | null
        }
        Insert: {
          activity_score?: number | null
          balance?: number | null
          board?: string | null
          created_at?: string | null
          embassy_plot_count?: number | null
          embassy_tax?: number | null
          growth_rate?: number | null
          home_block_count?: number | null
          id?: number
          image_url?: string | null
          is_capital?: boolean | null
          is_open?: boolean | null
          is_public?: boolean | null
          last_activity?: string | null
          last_updated?: string | null
          level?: number
          location_x?: number | null
          location_z?: number | null
          market_value?: number | null
          max_plots?: number | null
          max_residents?: number | null
          mayor_name?: string | null
          mayor_uuid: string
          min_plots?: number | null
          min_residents?: number | null
          name: string
          nation_id?: number | null
          nation_name?: string | null
          nation_uuid?: string | null
          plot_price?: number | null
          plot_tax?: number | null
          plots_count?: number | null
          residents?: Json | null
          residents_count?: number | null
          shop_plot_count?: number | null
          shop_tax?: number | null
          spawn_pitch?: number | null
          spawn_x?: number | null
          spawn_y?: number | null
          spawn_yaw?: number | null
          spawn_z?: number | null
          tag?: string | null
          taxes?: number | null
          total_xp?: number
          wild_plot_count?: number | null
          world_name?: string | null
        }
        Update: {
          activity_score?: number | null
          balance?: number | null
          board?: string | null
          created_at?: string | null
          embassy_plot_count?: number | null
          embassy_tax?: number | null
          growth_rate?: number | null
          home_block_count?: number | null
          id?: number
          image_url?: string | null
          is_capital?: boolean | null
          is_open?: boolean | null
          is_public?: boolean | null
          last_activity?: string | null
          last_updated?: string | null
          level?: number
          location_x?: number | null
          location_z?: number | null
          market_value?: number | null
          max_plots?: number | null
          max_residents?: number | null
          mayor_name?: string | null
          mayor_uuid?: string
          min_plots?: number | null
          min_residents?: number | null
          name?: string
          nation_id?: number | null
          nation_name?: string | null
          nation_uuid?: string | null
          plot_price?: number | null
          plot_tax?: number | null
          plots_count?: number | null
          residents?: Json | null
          residents_count?: number | null
          shop_plot_count?: number | null
          shop_tax?: number | null
          spawn_pitch?: number | null
          spawn_x?: number | null
          spawn_y?: number | null
          spawn_yaw?: number | null
          spawn_z?: number | null
          tag?: string | null
          taxes?: number | null
          total_xp?: number
          wild_plot_count?: number | null
          world_name?: string | null
        }
        Relationships: []
      }
      trail_paths: {
        Row: {
          blocks: string | null
          created_by: string | null
          creation_date: string | null
          description: string | null
          display_particle: string | null
          geojson: string | null
          id: number
          max_points: number | null
          name: string
          radius: number | null
          tracked_path: Json | null
          version: number | null
          width: number | null
        }
        Insert: {
          blocks?: string | null
          created_by?: string | null
          creation_date?: string | null
          description?: string | null
          display_particle?: string | null
          geojson?: string | null
          id?: number
          max_points?: number | null
          name: string
          radius?: number | null
          tracked_path?: Json | null
          version?: number | null
          width?: number | null
        }
        Update: {
          blocks?: string | null
          created_by?: string | null
          creation_date?: string | null
          description?: string | null
          display_particle?: string | null
          geojson?: string | null
          id?: number
          max_points?: number | null
          name?: string
          radius?: number | null
          tracked_path?: Json | null
          version?: number | null
          width?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          balance_without_tax: number
          buyer_uuid: string
          id: string
          item_amount: number
          item_custom_model_data: number | null
          item_display_name: string | null
          item_durability: number
          item_enchants: Json | null
          item_lore: string[] | null
          item_type: string
          item_unbreakable: boolean | null
          price_per_unit: number
          quantity: number
          seller_uuid: string
          shop_id: string
          tax: number
          total: number
          transaction_timestamp: number
        }
        Insert: {
          balance_without_tax: number
          buyer_uuid: string
          id: string
          item_amount: number
          item_custom_model_data?: number | null
          item_display_name?: string | null
          item_durability?: number
          item_enchants?: Json | null
          item_lore?: string[] | null
          item_type: string
          item_unbreakable?: boolean | null
          price_per_unit: number
          quantity: number
          seller_uuid: string
          shop_id: string
          tax: number
          total: number
          transaction_timestamp: number
        }
        Update: {
          balance_without_tax?: number
          buyer_uuid?: string
          id?: string
          item_amount?: number
          item_custom_model_data?: number | null
          item_display_name?: string | null
          item_durability?: number
          item_enchants?: Json | null
          item_lore?: string[] | null
          item_type?: string
          item_unbreakable?: boolean | null
          price_per_unit?: number
          quantity?: number
          seller_uuid?: string
          shop_id?: string
          tax?: number
          total?: number
          transaction_timestamp?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shop_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      unlocked_achievements: {
        Row: {
          achievement_id: string
          id: number
          player_uuid: string | null
          tier: number
          town_name: string | null
          unlocked_at: string | null
          xp_awarded: number
        }
        Insert: {
          achievement_id: string
          id?: number
          player_uuid?: string | null
          tier: number
          town_name?: string | null
          unlocked_at?: string | null
          xp_awarded?: number
        }
        Update: {
          achievement_id?: string
          id?: number
          player_uuid?: string | null
          tier?: number
          town_name?: string | null
          unlocked_at?: string | null
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "unlocked_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["achievement_id"]
          },
          {
            foreignKeyName: "unlocked_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_progress"
            referencedColumns: ["achievement_id"]
          },
          {
            foreignKeyName: "unlocked_achievements_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "level_leaderboard"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "unlocked_achievements_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "player_leaderboard"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "unlocked_achievements_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "player_profiles_view"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "unlocked_achievements_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["uuid"]
          },
        ]
      }
      user_channel_read_status: {
        Row: {
          channel_id: string | null
          created_at: string | null
          id: string
          last_read_at: string | null
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string | null
          id?: string
          last_read_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string | null
          id?: string
          last_read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_channel_read_status_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_channel_read_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          notification_type: string
          priority: string | null
          read_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          notification_type: string
          priority?: string | null
          read_at?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_reputation: {
        Row: {
          badges_earned: string[] | null
          created_at: string | null
          level: number
          reputation_points: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badges_earned?: string[] | null
          created_at?: string | null
          level?: number
          reputation_points?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badges_earned?: string[] | null
          created_at?: string | null
          level?: number
          reputation_points?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reputation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          frequency: string | null
          id: string
          subscription_type: string
          target_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          frequency?: string | null
          id?: string
          subscription_type: string
          target_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          frequency?: string | null
          id?: string
          subscription_type?: string
          target_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_warnings: {
        Row: {
          acknowledged_at: string | null
          created_at: string | null
          details: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          moderator_id: string | null
          reason: string
          user_id: string | null
          warning_type: string
        }
        Insert: {
          acknowledged_at?: string | null
          created_at?: string | null
          details?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          moderator_id?: string | null
          reason: string
          user_id?: string | null
          warning_type: string
        }
        Update: {
          acknowledged_at?: string | null
          created_at?: string | null
          details?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          moderator_id?: string | null
          reason?: string
          user_id?: string | null
          warning_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_warnings_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_warnings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      username_reservations: {
        Row: {
          id: string
          minecraft_username: string
          player_uuid: string | null
          reserved_at: string
          reserved_by: string | null
          verified: boolean
          verified_at: string | null
        }
        Insert: {
          id?: string
          minecraft_username: string
          player_uuid?: string | null
          reserved_at?: string
          reserved_by?: string | null
          verified?: boolean
          verified_at?: string | null
        }
        Update: {
          id?: string
          minecraft_username?: string
          player_uuid?: string | null
          reserved_at?: string
          reserved_by?: string | null
          verified?: boolean
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "username_reservations_reserved_by_fkey"
            columns: ["reserved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          data: Json | null
          error_message: string | null
          id: number
          message: string
          player_name: string | null
          player_uuid: string | null
          sent_at: string | null
          success: boolean | null
          webhook_type: string
        }
        Insert: {
          data?: Json | null
          error_message?: string | null
          id?: number
          message: string
          player_name?: string | null
          player_uuid?: string | null
          sent_at?: string | null
          success?: boolean | null
          webhook_type: string
        }
        Update: {
          data?: Json | null
          error_message?: string | null
          id?: number
          message?: string
          player_name?: string | null
          player_uuid?: string | null
          sent_at?: string | null
          success?: boolean | null
          webhook_type?: string
        }
        Relationships: []
      }
      wiki_categories: {
        Row: {
          color: string | null
          created_at: string
          depth: number | null
          description: string | null
          icon: string | null
          id: string
          is_expanded: boolean | null
          is_visible: boolean | null
          last_edited_at: string | null
          last_edited_by: string | null
          order_index: number
          page_count: number | null
          parent_category_id: string | null
          parent_id: string | null
          slug: string
          subcategory_count: number | null
          title: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          depth?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_expanded?: boolean | null
          is_visible?: boolean | null
          last_edited_at?: string | null
          last_edited_by?: string | null
          order_index?: number
          page_count?: number | null
          parent_category_id?: string | null
          parent_id?: string | null
          slug: string
          subcategory_count?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          depth?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_expanded?: boolean | null
          is_visible?: boolean | null
          last_edited_at?: string | null
          last_edited_by?: string | null
          order_index?: number
          page_count?: number | null
          parent_category_id?: string | null
          parent_id?: string | null
          slug?: string
          subcategory_count?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "wiki_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "wiki_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_collaboration_notifications: {
        Row: {
          actor_id: string | null
          comment_id: string | null
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          page_id: string | null
          suggested_edit_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          actor_id?: string | null
          comment_id?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          page_id?: string | null
          suggested_edit_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          actor_id?: string | null
          comment_id?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          page_id?: string | null
          suggested_edit_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_collaboration_notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_collaboration_notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "wiki_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_collaboration_notifications_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_collaboration_notifications_suggested_edit_id_fkey"
            columns: ["suggested_edit_id"]
            isOneToOne: false
            referencedRelation: "wiki_suggested_edits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_collaboration_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_comments: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          is_moderated: boolean | null
          is_pinned: boolean | null
          is_resolved: boolean | null
          page_id: string | null
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_moderated?: boolean | null
          is_pinned?: boolean | null
          is_resolved?: boolean | null
          page_id?: string | null
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_moderated?: boolean | null
          is_pinned?: boolean | null
          is_resolved?: boolean | null
          page_id?: string | null
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_comments_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "wiki_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_edit_sessions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          last_activity: string
          page_id: string | null
          session_token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_activity?: string
          page_id?: string | null
          session_token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_activity?: string
          page_id?: string | null
          session_token?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_edit_sessions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_edit_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_page_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_resolved: boolean
          page_id: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          page_id: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          page_id?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_page_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_page_comments_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_page_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "wiki_page_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_page_drafts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          page_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          page_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          page_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_page_drafts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_page_drafts_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_page_metadata: {
        Row: {
          created_at: string
          id: string
          last_viewed_at: string | null
          page_id: string
          updated_at: string
          view_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_viewed_at?: string | null
          page_id: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_viewed_at?: string | null
          page_id?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "wiki_page_metadata_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: true
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_page_permissions: {
        Row: {
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          page_id: string
          permission_type: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          page_id: string
          permission_type: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          page_id?: string
          permission_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_page_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_page_permissions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_page_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_page_subscriptions: {
        Row: {
          created_at: string
          id: string
          notification_types: string[] | null
          page_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notification_types?: string[] | null
          page_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notification_types?: string[] | null
          page_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_page_subscriptions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_page_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_page_suggestions: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          merged_at: string | null
          page_id: string
          review_comment: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          merged_at?: string | null
          page_id: string
          review_comment?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          merged_at?: string | null
          page_id?: string
          review_comment?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_page_suggestions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_page_suggestions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_page_suggestions_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_pages: {
        Row: {
          allow_comments: boolean | null
          allow_editing: boolean | null
          author_id: string | null
          category_id: string | null
          color: string | null
          content: string
          created_at: string
          custom_css: string | null
          depth: number | null
          description: string | null
          github_path: string | null
          icon: string | null
          id: string
          is_expanded: boolean | null
          is_public: boolean | null
          is_visible: boolean | null
          keywords: string[] | null
          last_edited_at: string | null
          last_edited_by: string | null
          meta_description: string | null
          order_index: number
          parent_page_id: string | null
          require_approval: boolean | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          allow_comments?: boolean | null
          allow_editing?: boolean | null
          author_id?: string | null
          category_id?: string | null
          color?: string | null
          content?: string
          created_at?: string
          custom_css?: string | null
          depth?: number | null
          description?: string | null
          github_path?: string | null
          icon?: string | null
          id?: string
          is_expanded?: boolean | null
          is_public?: boolean | null
          is_visible?: boolean | null
          keywords?: string[] | null
          last_edited_at?: string | null
          last_edited_by?: string | null
          meta_description?: string | null
          order_index?: number
          parent_page_id?: string | null
          require_approval?: boolean | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          allow_comments?: boolean | null
          allow_editing?: boolean | null
          author_id?: string | null
          category_id?: string | null
          color?: string | null
          content?: string
          created_at?: string
          custom_css?: string | null
          depth?: number | null
          description?: string | null
          github_path?: string | null
          icon?: string | null
          id?: string
          is_expanded?: boolean | null
          is_public?: boolean | null
          is_visible?: boolean | null
          keywords?: string[] | null
          last_edited_at?: string | null
          last_edited_by?: string | null
          meta_description?: string | null
          order_index?: number
          parent_page_id?: string | null
          require_approval?: boolean | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_pages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_pages_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "wiki_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_pages_parent_page_id_fkey"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_pages_index: {
        Row: {
          bucket: string
          created_at: string | null
          id: number
          path: string
          slug: string
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          bucket: string
          created_at?: string | null
          id?: number
          path: string
          slug: string
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          bucket?: string
          created_at?: string | null
          id?: number
          path?: string
          slug?: string
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wiki_suggested_edits: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          description: string | null
          id: string
          page_id: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          description?: string | null
          id?: string
          page_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          page_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_suggested_edits_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_suggested_edits_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_suggested_edits_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      achievement_progress: {
        Row: {
          achievement_id: string | null
          achievement_name: string | null
          player_name: string | null
          player_uuid: string | null
          threshold: number | null
          tier: number | null
          tier_name: string | null
          town_name: string | null
          unlocked_at: string | null
          xp_awarded: number | null
        }
        Relationships: [
          {
            foreignKeyName: "unlocked_achievements_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "level_leaderboard"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "unlocked_achievements_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "player_leaderboard"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "unlocked_achievements_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "player_profiles_view"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "unlocked_achievements_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["uuid"]
          },
        ]
      }
      award_leaderboard: {
        Row: {
          achieved_at: string | null
          award_id: string | null
          award_name: string | null
          medal: string | null
          player_name: string | null
          player_uuid: string | null
          points: number | null
          rank: number | null
          tier: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_awards_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "level_leaderboard"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "player_awards_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "player_leaderboard"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "player_awards_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "player_profiles_view"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "player_awards_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["uuid"]
          },
        ]
      }
      forum_categories_with_post_count: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string | null
          is_moderator_only: boolean | null
          name: string | null
          order_index: number | null
          post_count: number | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string | null
          is_moderator_only?: boolean | null
          name?: string | null
          order_index?: number | null
          post_count?: never
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string | null
          is_moderator_only?: boolean | null
          name?: string | null
          order_index?: number | null
          post_count?: never
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      level_leaderboard: {
        Row: {
          last_level_up: number | null
          level: number | null
          name: string | null
          total_xp: number | null
          uuid: string | null
        }
        Insert: {
          last_level_up?: number | null
          level?: number | null
          name?: string | null
          total_xp?: number | null
          uuid?: string | null
        }
        Update: {
          last_level_up?: number | null
          level?: number | null
          name?: string | null
          total_xp?: number | null
          uuid?: string | null
        }
        Relationships: []
      }
      player_leaderboard: {
        Row: {
          bronze_medals: number | null
          gold_medals: number | null
          last_seen: number | null
          name: string | null
          silver_medals: number | null
          total_medals: number | null
          total_points: number | null
          uuid: string | null
        }
        Relationships: []
      }
      player_profiles_view: {
        Row: {
          created_at: string | null
          first_joined: string | null
          is_online: boolean | null
          last_seen: string | null
          level: number | null
          medals: Json | null
          ranks: Json | null
          stats: Json | null
          stats_updated_at: string | null
          total_xp: number | null
          username: string | null
          uuid: string | null
        }
        Relationships: []
      }
      shop_stats: {
        Row: {
          id: string | null
          item_type: string | null
          last_updated: number | null
          owner_uuid: string | null
          price: number | null
          stock: number | null
          total_items_sold: number | null
          total_revenue: number | null
          total_transactions: number | null
          type: string | null
          unlimited: boolean | null
          world: string | null
        }
        Relationships: []
      }
      v_atm_summary: {
        Row: {
          company_name: string | null
          deposits: number | null
          last_used: string | null
          npc_name: string | null
          owner_name: string | null
          total_fees_earned: number | null
          total_transactions: number | null
          total_volume: number | null
          transaction_fee_rate: number | null
          withdrawals: number | null
        }
        Relationships: []
      }
      v_finance_company_summary: {
        Row: {
          active_bonds: number | null
          active_funds: number | null
          active_loans: number | null
          central_fund_balance: number | null
          finance_company_id: string | null
          reserve_balance: number | null
          savings_accounts: number | null
          vault_balance: number | null
        }
        Relationships: []
      }
      v_forex_company_summary: {
        Row: {
          average_rate: number | null
          finance_company_id: string | null
          last_transaction: string | null
          total_fees_earned: number | null
          total_transactions: number | null
        }
        Relationships: []
      }
      v_forex_rates: {
        Row: {
          activity_modifier: number | null
          base_rate: number | null
          calculated_rate: number | null
          currency_pair: string | null
          current_rate: number | null
          last_update: string | null
          random_event_modifier: number | null
          supply_demand_modifier: number | null
        }
        Insert: {
          activity_modifier?: number | null
          base_rate?: number | null
          calculated_rate?: never
          currency_pair?: string | null
          current_rate?: number | null
          last_update?: string | null
          random_event_modifier?: number | null
          supply_demand_modifier?: number | null
        }
        Update: {
          activity_modifier?: number | null
          base_rate?: number | null
          calculated_rate?: never
          currency_pair?: string | null
          current_rate?: number | null
          last_update?: string | null
          random_event_modifier?: number | null
          supply_demand_modifier?: number | null
        }
        Relationships: []
      }
      v_matured_bonds: {
        Row: {
          amount: number | null
          bond_type: string | null
          finance_company_id: string | null
          id: number | null
          maturity_date: string | null
          player_name: string | null
          player_uuid: string | null
          return_amount: number | null
        }
        Insert: {
          amount?: number | null
          bond_type?: string | null
          finance_company_id?: string | null
          id?: number | null
          maturity_date?: string | null
          player_name?: string | null
          player_uuid?: string | null
          return_amount?: number | null
        }
        Update: {
          amount?: number | null
          bond_type?: string | null
          finance_company_id?: string | null
          id?: number | null
          maturity_date?: string | null
          player_name?: string | null
          player_uuid?: string | null
          return_amount?: number | null
        }
        Relationships: []
      }
      v_overdue_loans: {
        Row: {
          amount: number | null
          due_date: string | null
          finance_company_id: string | null
          id: number | null
          player_name: string | null
          player_uuid: string | null
          total_interest: number | null
        }
        Insert: {
          amount?: number | null
          due_date?: string | null
          finance_company_id?: string | null
          id?: number | null
          player_name?: string | null
          player_uuid?: string | null
          total_interest?: number | null
        }
        Update: {
          amount?: number | null
          due_date?: string | null
          finance_company_id?: string | null
          id?: number | null
          player_name?: string | null
          player_uuid?: string | null
          total_interest?: number | null
        }
        Relationships: []
      }
      v_player_forex_portfolio: {
        Row: {
          euro_balance: number | null
          gem_balance: number | null
          gold_balance: number | null
          owner_name: string | null
          owner_uuid: string | null
          total_balance: number | null
        }
        Relationships: []
      }
      v_player_portfolio: {
        Row: {
          bonds_value: number | null
          funds_value: number | null
          loan_debt: number | null
          net_worth: number | null
          player_name: string | null
          player_uuid: string | null
          savings_balance: number | null
        }
        Relationships: []
      }
      v_recent_atm_transactions: {
        Row: {
          amount: number | null
          finance_company_id: string | null
          item_type: string | null
          player_name: string | null
          quantity: number | null
          status: string | null
          transaction_date: string | null
          transaction_fee: number | null
          transaction_type: string | null
        }
        Relationships: []
      }
      v_recent_forex_trades: {
        Row: {
          amount_bought: number | null
          amount_sold: number | null
          currency_pair: string | null
          fee: number | null
          player_name: string | null
          rate: number | null
          timestamp: string | null
          transaction_type: string | null
        }
        Relationships: []
      }
      v_recent_transactions: {
        Row: {
          company_name: string | null
          is_central_fund_trade: boolean | null
          player_name: string | null
          price_per_share: number | null
          shares_amount: number | null
          total_amount: number | null
          transaction_date: string | null
          transaction_fee: number | null
          transaction_type: string | null
        }
        Relationships: []
      }
      v_stock_summary: {
        Row: {
          available_shares: number | null
          business_type: string | null
          company_name: string | null
          current_price: number | null
          issued_shares: number | null
          last_price_update: string | null
          shareholders_count: number | null
          tier: number | null
          total_shares_owned: number | null
          total_value: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_to_moderation_queue: {
        Args: {
          content_type_param: string
          content_id_param: string
          report_type_param: Database["public"]["Enums"]["report_type"]
          reporter_id_param?: string
        }
        Returns: undefined
      }
      admin_claim_achievement: {
        Args: {
          p_admin_user_id: string
          p_player_uuid: string
          p_tier_id: string
        }
        Returns: Json
      }
      auto_save_draft: {
        Args: {
          page_id_param: string
          title_param: string
          content_param: string
        }
        Returns: undefined
      }
      calculate_category_depth: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_level_from_xp: {
        Args: { player_xp: number }
        Returns: {
          level: number
          xp_in_current_level: number
          xp_for_next_level: number
          progress: number
        }[]
      }
      calculate_page_depth: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_player_achievements: {
        Args: { p_player_uuid: string; p_player_stats: Json }
        Returns: Json
      }
      calculate_player_rankings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_recent_playtime: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_town_level_from_xp: {
        Args: { town_xp: number }
        Returns: {
          level: number
          xp_in_current_level: number
          xp_for_next_level: number
          progress: number
        }[]
      }
      calculate_user_level: {
        Args: { reputation_points: number }
        Returns: number
      }
      can_access_nation_forum: {
        Args: { user_id: string; nation_name: string }
        Returns: boolean
      }
      can_admin_wiki_page: {
        Args: { page_id_param: string }
        Returns: boolean
      }
      can_claim_town_achievement: {
        Args: { p_town_id: string }
        Returns: boolean
      }
      can_edit_wiki_page: {
        Args: { page_id_param: string }
        Returns: boolean
      }
      check_edit_conflicts: {
        Args: { page_id_param: string; user_id_param: string }
        Returns: {
          conflict_user_id: string
          conflict_user_name: string
          last_activity: string
        }[]
      }
      check_wiki_pages_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          entity_type: string
          total_count: number
          pages_exist: number
          missing_pages: number
        }[]
      }
      claim_achievement: {
        Args: { p_player_uuid: string; p_tier_id: string }
        Returns: Json
      }
      claim_town_achievement: {
        Args: { p_town_id: string; p_tier_id: string }
        Returns: Json
      }
      cleanup_expired_edit_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_chat_messages: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      count_child_companies: {
        Args: { parent_uuid: string }
        Returns: number
      }
      create_notification: {
        Args: {
          user_id_param: string
          notification_type_param: Database["public"]["Enums"]["notification_type"]
          title_param: string
          message_param: string
          data_param?: Json
          priority_param?: Database["public"]["Enums"]["notification_priority"]
        }
        Returns: string
      }
      create_page_revision: {
        Args: {
          p_page_id: string
          p_title: string
          p_content: string
          p_status?: string
          p_comment?: string
        }
        Returns: string
      }
      create_tokenlink_user: {
        Args: { p_player_uuid: string; p_player_name: string; p_email?: string }
        Returns: string
      }
      create_town_nation_triggers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_wiki_collaboration_notification: {
        Args: {
          user_id_param: string
          notification_type_param: string
          page_id_param: string
          actor_id_param: string
          title_param: string
          message_param: string
          data_param?: Json
        }
        Returns: string
      }
      debug_create_player_achievements: {
        Args: { p_player_uuid: string }
        Returns: Json
      }
      debug_get_player_info: {
        Args: { p_player_uuid: string }
        Returns: {
          player_uuid: string
          player_name: string
          level: number
          total_xp: number
          last_seen: number
        }[]
      }
      debug_test_achievement_calculations: {
        Args: { p_player_uuid: string }
        Returns: {
          achievement_id: string
          achievement_name: string
          tier_name: string
          stat_name: string
          current_value: number
          threshold: number
          qualifies: boolean
          points: number
        }[]
      }
      delete_wiki_page: {
        Args: { page_slug: string }
        Returns: boolean
      }
      get_admin_actions: {
        Args: {
          admin_uuid_filter?: string
          action_type_filter?: string
          days_back?: number
          limit_count?: number
        }
        Returns: {
          id: number
          admin_uuid: string
          admin_name: string
          action_type: string
          target_type: string
          target_id: string
          target_name: string
          details: Json
          ip_address: string
          created_at: string
        }[]
      }
      get_award_leaderboard: {
        Args: { award_id_param: string; limit_count?: number }
        Returns: {
          player_name: string
          medal: string
          points: number
          achieved_at: string
        }[]
      }
      get_category_depth: {
        Args: { category_id: string }
        Returns: number
      }
      get_category_hierarchy: {
        Args: { category_id: string }
        Returns: {
          id: string
          title: string
          slug: string
          level: number
          path: string
        }[]
      }
      get_child_categories: {
        Args: { parent_category_id: string }
        Returns: {
          id: string
          title: string
          slug: string
          depth: number
        }[]
      }
      get_claimable_achievements: {
        Args: { p_player_uuid: string }
        Returns: {
          tier_id: string
          achievement_id: string
          achievement_name: string
          tier_name: string
          tier_description: string
          points: number
          tier_number: number
          current_value: number
          threshold: number
          is_claimable: boolean
        }[]
      }
      get_combat_stat_leaderboard: {
        Args: { stat_name_param: string; limit_count?: number }
        Returns: {
          player_uuid: string
          player_name: string
          stat_value: number
        }[]
      }
      get_company_hierarchy: {
        Args: { company_uuid: string }
        Returns: {
          id: string
          name: string
          slug: string
          level: number
          path: string
        }[]
      }
      get_crafting_stat_leaderboard: {
        Args: { stat_name_param: string; limit_count?: number }
        Returns: {
          player_uuid: string
          player_name: string
          stat_value: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_custom_stat_leaderboard: {
        Args: { stat_name_param: string; limit_count?: number }
        Returns: {
          player_uuid: string
          player_name: string
          stat_value: number
        }[]
      }
      get_dashboard_overview: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_towns: number
          total_nations: number
          total_players: number
          online_players: number
          total_plots: number
          plots_for_sale: number
          total_market_value: number
          total_transactions_today: number
          total_volume_today: number
          system_status: string
          last_updated: string
        }[]
      }
      get_medal_leaderboard: {
        Args: { medal_type: string; limit_count?: number }
        Returns: {
          player_name: string
          medal_count: number
          total_points: number
        }[]
      }
      get_mining_stat_leaderboard: {
        Args: { stat_name_param: string; limit_count?: number }
        Returns: {
          player_uuid: string
          player_name: string
          stat_value: number
        }[]
      }
      get_nation_data_for_wiki: {
        Args: { nation_name_param: string }
        Returns: {
          name: string
          leader_name: string
          capital_name: string
          residents_count: number
          balance: number
          towns_count: number
          ally_count: number
          enemy_count: number
          tag: string
          board: string
          taxes: number
          town_tax: number
          max_towns: number
          created_at: string
        }[]
      }
      get_parent_hierarchy: {
        Args: { company_uuid: string }
        Returns: {
          id: string
          name: string
          slug: string
          level: number
        }[]
      }
      get_player_profile: {
        Args: { player_uuid_param: string }
        Returns: {
          uuid: string
          username: string
          level: number
          total_xp: number
          first_joined: string
          last_seen: string
          is_online: boolean
          created_at: string
          stats: Json
          ranks: Json
          medals: Json
          stats_updated_at: string
        }[]
      }
      get_player_stats_by_category: {
        Args: { player_uuid_param: string; category_param: string }
        Returns: {
          stat_name: string
          stat_value: number
        }[]
      }
      get_player_stats_for_achievements: {
        Args: { p_player_uuid: string }
        Returns: Json
      }
      get_player_verification_status: {
        Args: { p_player_uuid: string }
        Returns: Json
      }
      get_points_leaderboard: {
        Args: { limit_count?: number }
        Returns: {
          player_name: string
          total_points: number
          bronze_count: number
          silver_count: number
          gold_count: number
        }[]
      }
      get_recent_transactions: {
        Args: { hours_back?: number }
        Returns: {
          id: string
          shop_id: string
          buyer_uuid: string
          seller_uuid: string
          item_type: string
          item_amount: number
          quantity: number
          price_per_unit: number
          total: number
          tax: number
          transaction_timestamp: number
        }[]
      }
      get_shops_by_item_type: {
        Args: { p_item_type: string }
        Returns: {
          id: string
          shop_name: string
          owner_name: string
          location: string
          description: string
          shop_type: string
          is_active: boolean
          item_type: string
          item_display_name: string
          item_amount: number
          price: number
          unlimited: boolean
          last_update_quickshop: string
        }[]
      }
      get_shops_by_owner: {
        Args: { p_owner_name: string }
        Returns: {
          id: string
          shop_name: string
          owner_name: string
          location: string
          description: string
          shop_type: string
          is_active: boolean
          item_type: string
          item_display_name: string
          item_amount: number
          price: number
          unlimited: boolean
          last_update_quickshop: string
        }[]
      }
      get_shops_by_price_range: {
        Args: { p_min_price: number; p_max_price: number }
        Returns: {
          id: string
          shop_name: string
          owner_name: string
          location: string
          description: string
          shop_type: string
          is_active: boolean
          item_type: string
          item_display_name: string
          item_amount: number
          price: number
          unlimited: boolean
          last_update_quickshop: string
        }[]
      }
      get_stat_by_category: {
        Args: {
          category_param: string
          stat_name_param: string
          limit_count?: number
        }
        Returns: {
          player_uuid: string
          player_name: string
          stat_value: number
        }[]
      }
      get_top_players_by_stat: {
        Args: { stat_path_param: string; limit_count?: number }
        Returns: {
          player_uuid: string
          player_name: string
          stat_value: number
        }[]
      }
      get_town_data_for_wiki: {
        Args: { town_name_param: string }
        Returns: {
          name: string
          mayor_name: string
          residents_count: number
          balance: number
          level: number
          total_xp: number
          nation_name: string
          is_capital: boolean
          world_name: string
          location_x: number
          location_z: number
          spawn_x: number
          spawn_y: number
          spawn_z: number
          tag: string
          board: string
          max_residents: number
          max_plots: number
          taxes: number
          plot_tax: number
          created_at: string
        }[]
      }
      get_unread_notification_count: {
        Args: { user_id_param: string }
        Returns: number
      }
      get_wiki_page_by_slug: {
        Args: { page_slug: string }
        Returns: {
          id: string
          title: string
          slug: string
          content: string
          status: string
          category_id: string
          author_id: string
          order_index: number
          created_at: string
          updated_at: string
          parent_page_id: string
          depth: number
          icon: string
          color: string
          is_expanded: boolean
          description: string
          tags: string[]
          last_edited_by: string
          last_edited_at: string
          is_public: boolean
          allow_comments: boolean
          allow_editing: boolean
          require_approval: boolean
          is_visible: boolean
          category_title: string
          author_name: string
        }[]
      }
      get_wiki_page_from_db: {
        Args: { page_slug: string }
        Returns: {
          id: string
          title: string
          slug: string
          content: string
          status: string
          category_id: string
          description: string
          tags: string[]
          author_id: string
          last_edited_by: string
          last_edited_at: string
          created_at: string
          updated_at: string
          is_public: boolean
          allow_comments: boolean
          allow_editing: boolean
        }[]
      }
      get_wiki_page_tree: {
        Args: { parent_id_param?: string }
        Returns: {
          id: string
          title: string
          slug: string
          depth: number
          order_index: number
          icon: string
          color: string
          is_expanded: boolean
          has_children: boolean
        }[]
      }
      has_role_or_higher: {
        Args: { required_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      increment_page_view: {
        Args: { page_id_param: string }
        Returns: undefined
      }
      increment_wiki_page_views: {
        Args: { page_id_param: string }
        Returns: undefined
      }
      insert_town_gallery_photo: {
        Args: {
          p_town_name: string
          p_title: string
          p_description: string
          p_file_path: string
          p_file_url: string
          p_file_size: number
          p_file_type: string
          p_width: number
          p_height: number
          p_tags: string[]
          p_uploaded_by: string
          p_uploaded_by_username: string
        }
        Returns: Json
      }
      is_user_restricted: {
        Args: { user_id_param: string }
        Returns: {
          is_banned: boolean
          is_muted: boolean
          banned_until: string
          muted_until: string
        }[]
      }
      list_wiki_pages: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          slug: string
          status: string
          category_id: string
          order_index: number
          created_at: string
          updated_at: string
          category_title: string
          author_name: string
        }[]
      }
      mark_all_notifications_read: {
        Args: { user_id_param: string }
        Returns: number
      }
      mark_notification_read: {
        Args: { notification_id_param: string; user_id_param: string }
        Returns: boolean
      }
      notify_page_subscribers: {
        Args: {
          page_id_param: string
          notification_type_param: string
          actor_id_param: string
          title_param: string
          message_param: string
          data_param?: Json
        }
        Returns: undefined
      }
      restore_page_revision: {
        Args: { p_revision_id: string }
        Returns: boolean
      }
      save_wiki_page_to_db: {
        Args: {
          page_slug: string
          page_title: string
          page_content: string
          page_status?: string
          page_category_id?: string
          page_description?: string
          page_tags?: string[]
        }
        Returns: string
      }
      search_ai_knowledgebase: {
        Args: { search_query: string }
        Returns: {
          id: string
          title: string
          section: string
          content: string
          tags: string[]
          relevance_score: number
        }[]
      }
      search_players: {
        Args: {
          search_term?: string
          town_filter?: string
          nation_filter?: string
          min_balance?: number
          max_balance?: number
          is_mayor_filter?: boolean
          is_king_filter?: boolean
          sort_by?: string
          sort_order?: string
          limit_count?: number
        }
        Returns: {
          uuid: string
          name: string
          town_name: string
          nation_name: string
          balance: number
          is_mayor: boolean
          is_king: boolean
          last_login: string
          activity_score: number
        }[]
      }
      search_towns: {
        Args: {
          search_term?: string
          nation_filter?: string
          min_balance?: number
          max_balance?: number
          min_residents?: number
          max_residents?: number
          is_open_filter?: boolean
          sort_by?: string
          sort_order?: string
          limit_count?: number
        }
        Returns: {
          name: string
          mayor_name: string
          balance: number
          residents_count: number
          nation_name: string
          created_at: string
          activity_score: number
        }[]
      }
      search_wiki_pages: {
        Args: { search_term: string }
        Returns: {
          id: string
          title: string
          slug: string
          content: string
          status: string
          category_id: string
          order_index: number
          created_at: string
          updated_at: string
          category_title: string
          author_name: string
        }[]
      }
      subscribe_to_content: {
        Args: {
          user_id_param: string
          subscription_type_param: string
          target_id_param: string
          frequency_param?: Database["public"]["Enums"]["subscription_frequency"]
        }
        Returns: string
      }
      sync_all_achievements: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_all_town_achievements: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_all_wiki_pages: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      sync_town_achievements: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_town_forums: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      test_wiki_storage_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          bucket_exists: boolean
          bucket_public: boolean
          policies_count: number
          test_result: string
        }[]
      }
      unsubscribe_from_content: {
        Args: {
          user_id_param: string
          subscription_type_param: string
          target_id_param: string
        }
        Returns: boolean
      }
      update_category_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_player_medals: {
        Args: { player_uuid_param: string }
        Returns: undefined
      }
      update_player_points: {
        Args: { player_uuid_param: string }
        Returns: undefined
      }
      update_quickshop_data: {
        Args: { p_shop_id: string; p_quickshop_data: Json }
        Returns: undefined
      }
      update_user_reputation: {
        Args: {
          target_user_id: string
          points_change: number
          event_type: string
          event_description?: string
          related_post_id?: string
          related_reply_id?: string
          related_reaction_id?: string
        }
        Returns: undefined
      }
      verify_minecraft_username: {
        Args: {
          p_player_uuid: string
          p_minecraft_username: string
          p_profile_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "editor" | "member"
      moderation_action_type:
        | "warn"
        | "delete_post"
        | "delete_reply"
        | "lock_post"
        | "unlock_post"
        | "pin_post"
        | "unpin_post"
        | "feature_post"
        | "unfeature_post"
        | "ban_user"
        | "unban_user"
        | "mute_user"
        | "unmute_user"
        | "approve_content"
        | "reject_content"
      notification_priority: "low" | "medium" | "high" | "urgent"
      notification_type:
        | "post_reply"
        | "post_mention"
        | "reply_mention"
        | "post_like"
        | "reply_like"
        | "post_saved"
        | "category_subscription"
        | "moderation_action"
        | "warning_issued"
        | "content_approved"
        | "content_rejected"
        | "daily_digest"
        | "weekly_digest"
      post_type:
        | "discussion"
        | "question"
        | "idea"
        | "announcement"
        | "guide"
        | "showcase"
      reaction_type:
        | "like"
        | "love"
        | "laugh"
        | "wow"
        | "sad"
        | "angry"
        | "helpful"
        | "insightful"
      report_status: "pending" | "investigating" | "resolved" | "dismissed"
      report_type:
        | "spam"
        | "inappropriate"
        | "harassment"
        | "hate_speech"
        | "violence"
        | "copyright"
        | "misinformation"
        | "other"
      subscription_frequency:
        | "instant"
        | "hourly"
        | "daily"
        | "weekly"
        | "never"
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
      app_role: ["admin", "moderator", "editor", "member"],
      moderation_action_type: [
        "warn",
        "delete_post",
        "delete_reply",
        "lock_post",
        "unlock_post",
        "pin_post",
        "unpin_post",
        "feature_post",
        "unfeature_post",
        "ban_user",
        "unban_user",
        "mute_user",
        "unmute_user",
        "approve_content",
        "reject_content",
      ],
      notification_priority: ["low", "medium", "high", "urgent"],
      notification_type: [
        "post_reply",
        "post_mention",
        "reply_mention",
        "post_like",
        "reply_like",
        "post_saved",
        "category_subscription",
        "moderation_action",
        "warning_issued",
        "content_approved",
        "content_rejected",
        "daily_digest",
        "weekly_digest",
      ],
      post_type: [
        "discussion",
        "question",
        "idea",
        "announcement",
        "guide",
        "showcase",
      ],
      reaction_type: [
        "like",
        "love",
        "laugh",
        "wow",
        "sad",
        "angry",
        "helpful",
        "insightful",
      ],
      report_status: ["pending", "investigating", "resolved", "dismissed"],
      report_type: [
        "spam",
        "inappropriate",
        "harassment",
        "hate_speech",
        "violence",
        "copyright",
        "misinformation",
        "other",
      ],
      subscription_frequency: ["instant", "hourly", "daily", "weekly", "never"],
    },
  },
} as const
