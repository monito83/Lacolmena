import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Fix for Windows path resolution if needed, though dotenv usually handles it
dotenv.config({ path: path.resolve(process.cwd(), 'env.supabase') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or Key in env.supabase');
    process.exit(1);
}

console.log(`Trying to connect to: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

async function testConnection() {
    try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) throw error;
        console.log('✅ Connection Successful!', data);
    } catch (err) {
        console.error('❌ Connection Failed:', err);
    }
}

testConnection();
