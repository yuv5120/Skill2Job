import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Optional: Database types for type safety
export type Database = {
  public: {
    Tables: {
      Resume: {
        Row: {
          id: string;
          userId: string;
          name: string;
          email: string;
          skills: string[];
          experience: string;
          createdAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          name: string;
          email: string;
          skills: string[];
          experience: string;
          createdAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          name?: string;
          email?: string;
          skills?: string[];
          experience?: string;
          createdAt?: string;
        };
      };
      Job: {
        Row: {
          id: string;
          title: string;
          description: string;
          skills: string[];
          createdAt: string;
          postedBy: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          skills: string[];
          createdAt?: string;
          postedBy: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          skills?: string[];
          createdAt?: string;
          postedBy?: string;
        };
      };
    };
  };
};
