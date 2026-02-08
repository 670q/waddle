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

async function checkTokens() {
    console.log('Checking user_push_tokens table...');

    const { data, error, count } = await supabase
        .from('user_push_tokens')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error fetching tokens:', error.message);
    } else {
        console.log(`Found ${count} tokens.`);
        console.log(data);
    }
}

checkTokens();
