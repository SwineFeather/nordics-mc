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
          created_at: string
          description: string
          id: string
          name: string
          stat: string
        }
        Insert: {
          created_at?: string
          description: string
          id: string
          name: string
          stat: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          stat?: string
        }
        Relationships: []
      }
      achievement_tiers: {
        Row: {
          achievement_id: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          points: number
          threshold: number
          tier: number
        }
        Insert: {
          achievement_id: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          points: number
          threshold: number
          tier: number
        }
        Update: {
          achievement_id?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
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
      forum_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_moderator_only: boolean | null
          name: string
          order_index: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_moderator_only?: boolean | null
          name: string
          order_index?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_moderator_only?: boolean | null
          name?: string
          order_index?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
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
          reply_count: number | null
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
          reply_count?: number | null
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
          reply_count?: number | null
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
      level_definitions: {
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
      marketplace_shops: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_sponsored: boolean | null
          location: string | null
          owner_name: string
          shop_name: string
          shop_type: string | null
          sponsored_priority: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_sponsored?: boolean | null
          location?: string | null
          owner_name: string
          shop_name: string
          shop_type?: string | null
          sponsored_priority?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_sponsored?: boolean | null
          location?: string | null
          owner_name?: string
          shop_name?: string
          shop_type?: string | null
          sponsored_priority?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      marketplace_transactions: {
        Row: {
          buyer_name: string
          created_at: string | null
          id: string
          item_name: string
          price: number
          quantity: number
          seller_name: string
          shop_name: string | null
          total_amount: number
          transaction_date: string
        }
        Insert: {
          buyer_name: string
          created_at?: string | null
          id?: string
          item_name: string
          price: number
          quantity?: number
          seller_name: string
          shop_name?: string | null
          total_amount: number
          transaction_date: string
        }
        Update: {
          buyer_name?: string
          created_at?: string | null
          id?: string
          item_name?: string
          price?: number
          quantity?: number
          seller_name?: string
          shop_name?: string | null
          total_amount?: number
          transaction_date?: string
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
      nations: {
        Row: {
          bank: string
          capital: string
          color: string
          created_at: string
          daily_upkeep: string
          description: string
          founded: string
          government: string
          history: string | null
          id: string
          image_url: string | null
          leader: string
          leader_name: string
          lore: string
          motto: string
          name: string
          population: number
          specialties: string[]
          type: string
        }
        Insert: {
          bank: string
          capital: string
          color: string
          created_at?: string
          daily_upkeep: string
          description: string
          founded: string
          government: string
          history?: string | null
          id?: string
          image_url?: string | null
          leader: string
          leader_name: string
          lore: string
          motto: string
          name: string
          population?: number
          specialties?: string[]
          type: string
        }
        Update: {
          bank?: string
          capital?: string
          color?: string
          created_at?: string
          daily_upkeep?: string
          description?: string
          founded?: string
          government?: string
          history?: string | null
          id?: string
          image_url?: string | null
          leader?: string
          leader_name?: string
          lore?: string
          motto?: string
          name?: string
          population?: number
          specialties?: string[]
          type?: string
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
          content: string
          created_at: string
          id: string
          page_id: string | null
          revision_note: string | null
          title: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          page_id?: string | null
          revision_note?: string | null
          title: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          page_id?: string | null
          revision_note?: string | null
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
          created_at: string | null
          id: number
          medal: string
          player_uuid: string
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
          created_at?: string | null
          id?: number
          medal: string
          player_uuid: string
          points?: number
          stat_path?: string | null
          stat_value?: number | null
          tier: string
        }
        Update: {
          achieved_at?: string | null
          award_description?: string | null
          award_id?: string
          award_name?: string
          created_at?: string | null
          id?: number
          medal?: string
          player_uuid?: string
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
      player_medals: {
        Row: {
          bronze_count: number | null
          created_at: string | null
          gold_count: number | null
          last_updated: string | null
          player_uuid: string
          silver_count: number | null
          total_medals: number | null
        }
        Insert: {
          bronze_count?: number | null
          created_at?: string | null
          gold_count?: number | null
          last_updated?: string | null
          player_uuid: string
          silver_count?: number | null
          total_medals?: number | null
        }
        Update: {
          bronze_count?: number | null
          created_at?: string | null
          gold_count?: number | null
          last_updated?: string | null
          player_uuid?: string
          silver_count?: number | null
          total_medals?: number | null
        }
        Relationships: [
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
          created_at: string | null
          diamond_points: number | null
          iron_points: number | null
          last_updated: string | null
          player_uuid: string
          stone_points: number | null
          total_points: number | null
        }
        Insert: {
          created_at?: string | null
          diamond_points?: number | null
          iron_points?: number | null
          last_updated?: string | null
          player_uuid: string
          stone_points?: number | null
          total_points?: number | null
        }
        Update: {
          created_at?: string | null
          diamond_points?: number | null
          iron_points?: number | null
          last_updated?: string | null
          player_uuid?: string
          stone_points?: number | null
          total_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_points_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["uuid"]
          },
        ]
      }
      player_stats: {
        Row: {
          created_at: string | null
          last_updated: number
          player_uuid: string
          stats: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          last_updated: number
          player_uuid: string
          stats?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          last_updated?: number
          player_uuid?: string
          stats?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["uuid"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string | null
          last_seen: number
          name: string
          updated_at: string | null
          uuid: string
        }
        Insert: {
          created_at?: string | null
          last_seen: number
          name: string
          updated_at?: string | null
          uuid: string
        }
        Update: {
          created_at?: string | null
          last_seen?: number
          name?: string
          updated_at?: string | null
          uuid?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          anonymous_mode: boolean
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          minecraft_username: string | null
          role: Database["public"]["Enums"]["app_role"]
          silent_join_leave: boolean
          updated_at: string
        }
        Insert: {
          anonymous_mode?: boolean
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          minecraft_username?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          silent_join_leave?: boolean
          updated_at?: string
        }
        Update: {
          anonymous_mode?: boolean
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          minecraft_username?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          silent_join_leave?: boolean
          updated_at?: string
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
      towns: {
        Row: {
          created_at: string
          founded: string
          id: string
          is_independent: boolean
          mayor: string
          name: string
          nation_id: string | null
          population: number
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          founded: string
          id?: string
          is_independent?: boolean
          mayor: string
          name: string
          nation_id?: string | null
          population?: number
          status: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          founded?: string
          id?: string
          is_independent?: boolean
          mayor?: string
          name?: string
          nation_id?: string | null
          population?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "towns_nation_id_fkey"
            columns: ["nation_id"]
            isOneToOne: false
            referencedRelation: "nations"
            referencedColumns: ["id"]
          },
        ]
      }
      unlocked_achievements: {
        Row: {
          claimed_at: string | null
          id: string
          is_claimed: boolean | null
          player_uuid: string
          tier_id: string
          unlocked_at: string
        }
        Insert: {
          claimed_at?: string | null
          id?: string
          is_claimed?: boolean | null
          player_uuid: string
          tier_id: string
          unlocked_at?: string
        }
        Update: {
          claimed_at?: string | null
          id?: string
          is_claimed?: boolean | null
          player_uuid?: string
          tier_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unlocked_achievements_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "achievement_tiers"
            referencedColumns: ["id"]
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
        Relationships: [
          {
            foreignKeyName: "webhook_logs_player_uuid_fkey"
            columns: ["player_uuid"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["uuid"]
          },
        ]
      }
      wiki_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_index: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      wiki_pages: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string
          github_path: string | null
          id: string
          order_index: number
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          github_path?: string | null
          id?: string
          order_index?: number
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          github_path?: string | null
          id?: string
          order_index?: number
          slug?: string
          status?: string
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
        ]
      }
      wiki_pages_index: {
        Row: {
          id: number
          title: string
          slug: string
          path: string
          bucket: string
          type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          slug: string
          path: string
          bucket: string
          type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          slug?: string
          path?: string
          bucket?: string
          type?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      },
      ai_answer_cache: {
        Row: {
          id: number;
          question_hash: string;
          entity: string;
          answer: string;
          created_at: string;
          updated_at: string;
          hits: number;
        }
        Insert: {
          id?: number;
          question_hash: string;
          entity: string;
          answer: string;
          created_at?: string;
          updated_at?: string;
          hits?: number;
        }
        Update: {
          id?: number;
          question_hash?: string;
          entity?: string;
          answer?: string;
          created_at?: string;
          updated_at?: string;
          hits?: number;
        }
        Relationships: []
      }
    }
    Views: {
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
    }
    Functions: {
      admin_claim_achievement: {
        Args: {
          p_admin_user_id: string
          p_player_uuid: string
          p_tier_id: string
        }
        Returns: Json
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
      calculate_player_rankings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_recent_playtime: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      claim_achievement: {
        Args: { p_player_uuid: string; p_tier_id: string }
        Returns: Json
      }
      cleanup_expired_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_chat_messages: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_tokenlink_user: {
        Args: { p_player_uuid: string; p_player_name: string; p_email?: string }
        Returns: string
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
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_medal_leaderboard: {
        Args: { medal_type: string; limit_count?: number }
        Returns: {
          player_name: string
          medal_count: number
          total_points: number
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
      get_top_players_by_stat: {
        Args: { stat_name_param: string; limit_count?: number }
        Returns: {
          player_name: string
          stat_value: number
        }[]
      }
      has_role_or_higher: {
        Args: { required_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      sync_all_achievements: {
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
      verify_minecraft_username: {
        Args: {
          p_player_uuid: string
          p_minecraft_username: string
          p_profile_id: string
        }
        Returns: Json
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
          level: number | null
          total_xp: number | null
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
      calculate_player_achievements: {
        Args: { p_player_uuid: string; p_player_stats: Json }
        Returns: Json
      }
      get_player_stats_for_achievements: {
        Args: { p_player_uuid: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "editor" | "member"
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
    },
  },
} as const
