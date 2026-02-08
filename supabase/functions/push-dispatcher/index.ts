import { createClient } from 'jsr:@supabase/supabase-js@2'

console.log("Hello from Push Dispatcher!")

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Parse Payload (Expect from Database Webhook or Direct Call)
        const payload = await req.json()
        console.log('Received payload:', payload)

        const record = payload.record // If from DB Webhook (INSERT to announcements)

        // Default values if testing manually
        const title = record?.title ?? "New Announcement"
        const body = record?.body ?? "Check out the latest updates!"

        // 2. Fetch All Tokens
        const { data: tokens, error } = await supabase
            .from('user_push_tokens')
            .select('token')

        if (error) throw error
        if (!tokens || tokens.length === 0) {
            return new Response(JSON.stringify({ message: 'No tokens found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 3. Construct Expo Messages
        // Expo expects chunks of 100 max, but for simplicity we map all. 
        // In production, batching is recommended.
        const messages = tokens.map(t => ({
            to: t.token,
            sound: 'default',
            title: title,
            body: body,
            data: { announcement_id: record?.id },
        })).filter(msg => ExponentPushToken.isValid(msg.to)) // Basic validation

        // 4. Send to Expo
        const chunks = chunkArray(messages, 100);
        const tickets = [];

        for (const chunk of chunks) {
            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chunk),
            });
            const data = await response.json();
            tickets.push(...(data.data || []));
        }

        return new Response(JSON.stringify({ success: true, tickets }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})

// Helper to check valid token format (basic check)
const ExponentPushToken = {
    isValid: (token) => {
        return typeof token === 'string' && token.startsWith('ExponentPushToken');
    }
}

function chunkArray(myArray, chunk_size) {
    var results = [];
    while (myArray.length) {
        results.push(myArray.splice(0, chunk_size));
    }
    return results;
}
