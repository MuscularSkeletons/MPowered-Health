import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

import AsyncStorage from '@react-native-async-storage/async-storage';

// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
// const supabaseKey =
//   process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
//   process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
//   '';

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('Warning: Supabase URL or Key is missing from environment variables.');
}



export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});