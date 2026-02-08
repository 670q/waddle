import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
    console.log('Testing connection to:', supabaseUrl);

    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`Attempting SignUp for ${email}...`);
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('SignUp Error:', error.message);
        if (error.status) console.error('Status:', error.status);
    } else {
        console.log('SignUp Success:', data.user?.id);
    }
}

testAuth();
