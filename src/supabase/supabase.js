import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY


if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration incomplete!');
  console.error('Missing URL:', !supabaseUrl);
  console.error('Missing Anon Key:', !supabaseAnonKey);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection
const testConnection = async () => {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    // Test basic connection by getting session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('⚠️ Supabase connection warning:', error.message);
    } else {
      console.log('✅ Supabase client connected successfully!');
      console.log('Session status:', data.session ? 'Active session found' : 'No active session');
    }
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
  }
};

// Run connection test
testConnection();

console.log('Supabase client created:', supabase ? '✅' : '❌');