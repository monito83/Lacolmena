import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'env.supabase') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS for this check

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const tables = ['students', 'families', 'teachers', 'users'];

    console.log('--- Checking Database Content ---');

    for (const table of tables) {
        try {
            const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
            if (error) {
                console.error(`❌ Error checking ${table}:`, error.message);
            } else {
                console.log(`✅ ${table}: ${count} records`);
            }
        } catch (e) {
            console.error(`⚠️ Exception checking ${table}:`, e);
        }
    }
}

checkData();
