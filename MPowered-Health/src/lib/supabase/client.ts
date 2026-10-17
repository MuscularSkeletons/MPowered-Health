import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = (
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
)?.trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and a publishable key to .env.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,     // allow token to automatically refresh
    persistSession: true,       // if user closes and reopens app, they are still logged in
    detectSessionInUrl: false,
  },
});
