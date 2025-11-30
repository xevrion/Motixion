import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for database
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          avatar_url: string | null;
          joined_at: string;
          balance: number;
          current_streak: number;
          best_streak: number;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'joined_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      friendships: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['friendships']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['friendships']['Insert']>;
      };
      daily_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          wake_time: string;
          study_hours: number;
          break_hours: number;
          wasted_time: number;
          tasks_assigned: number;
          tasks_completed: number;
          extra_tasks: number;
          notes: string;
          task_score: number;
          hour_score: number;
          wake_score: number;
          penalties: number;
          total_points: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['daily_logs']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          title: string;
          completed: boolean;
          category: 'core' | 'elective' | 'stretch';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          reward_name: string;
          reward_id: string | null;
          points_spent: number;
          date: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['purchases']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['purchases']['Insert']>;
      };
      custom_rewards: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          cost: number;
          icon: string;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['custom_rewards']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['custom_rewards']['Insert']>;
      };
      streaks: {
        Row: {
          user_id: string;
          current_streak: number;
          best_streak: number;
          wake_streak: number;
          task_streak: number;
          study_streak: number;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['streaks']['Row'], 'updated_at'>;
        Update: Partial<Database['public']['Tables']['streaks']['Insert']>;
      };
    };
  };
}
