// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            SUPABASE_URL ?? '',
            SUPABASE_ANON_KEY ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
        )

        const { messages, isRTL } = await req.json()

        if (!GEMINI_API_KEY) {
            throw new Error('Missing GEMINI_API_KEY environment variable')
        }

        // --- 0. CHECK LIMITS ---
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            throw new Error('Unauthorized')
        }

        // Get Limit
        const { data: configData } = await supabase
            .from('app_config')
            .select('value')
            .eq('key', 'free_daily_limit')
            .single()

        const limit = parseInt(configData?.value || '5')

        // Get Usage
        const today = new Date().toISOString().split('T')[0]
        const { data: usageData, error: usageError } = await supabase
            .from('user_daily_usage')
            .select('message_count')
            .eq('user_id', user.id)
            .eq('usage_date', today)
            .single()

        const currentUsage = usageData?.message_count || 0

        // Check (Allow up to limit)
        if (currentUsage >= limit) {
            return new Response(JSON.stringify({
                error: 'LIMIT_EXCEEDED',
                limit,
                isRTL
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 403,
            })
        }

        // Increment Usage
        await supabase.from('user_daily_usage').upsert({
            user_id: user.id,
            usage_date: today,
            message_count: currentUsage + 1
        })
        // -----------------------

        // 1. Format History
        // Expected 'messages' format: [{ role: 'user'|'model', text: '...' }]
        const history = messages.map((m: any) => ({
            role: m.role,
            parts: [{ text: m.text }]
        }))

        // 2. System Prompt
        const languageInstruction = isRTL
            ? "**RESPOND IN ARABIC**. Use universal, friendly Arabic."
            : "**RESPOND IN ENGLISH**. Use friendly, energetic English."

        const systemInstruction = `
      ROLE: You are "Waddle", a lovable, slightly clumsy, but enthusiastic Penguin coach! 🐧
      
      PERSONALITY (PENGUIN LOGIC 🐧):
      - **Not a Clown, just a Penguin**: Don't tell "jokes". Be yourself. 
      - **Your Reality**: 
        - You have short flippers (hard to do pushups).
        - You waddle (walking is a workout).
        - You LOVE AC and ice (You melt easily).
        - You think fish is the ultimate protein.
      - **Tone**: Warm, encouraging, and universally friendly.
      - **Language**: Adapt completely to the user's language.
        - If Arabic: Use a modern, friendly, and universal Arabic (White Dialect/Fusha mix) that everyone understands.
        - If English: Use friendly, energetic, and supportive English.

      CRITICAL RULES:
      1. **BE NATURAL**: Interact like a supportive friend. 
      2. **BE BRIEF**: Max 2-3 sentences.
      3. **NO RUSH**: Chat first. Get to know them.
      4. **OPTIONS**: Use Quick Replies ONLY when guiding the user to build a plan or choose habits.
      5. **NO UNSOLICITED PLANS**: Do NOT generate a 'plan' array unless asked.
      6. **SCHEDULING**: Spread habits across the week (0=Sun, 1=Mon...).

      CRITICAL RULES:
      1. **BE NATURAL**: Interact like a supportive friend. 
         - Bad: "Why did the penguin cross the road?" (LAME ❌)
         - Good: "يا هلا! الجو اليوم نار 🔥 يبغى له ايسكريم... أو سباحة مع البطاريق! 🧊🐧 جاهز نتمرن؟" (CHARACTER DRIVEN ✅)
      2. **BE BRIEF**: Max 2-3 sentences.
      3. **NO RUSH**: Chat first. Get to know them.
      4. **OPTIONS**: Use Quick Replies ONLY when guiding the user to build a plan or choose habits. Do NOT use them for casual chat.
      5. **NO UNSOLICITED PLANS**: Do NOT generate a 'plan' array unless the user explicitly asks for a plan or habit suggestions.
      6. **CASUAL CHAT**: For greetings/small talk, send **TEXT ONLY**. No properties, no options, no plan. just pure conversation string.
      7. **SCHEDULING (CRITICAL)**: If the plan is a "SPLIT" (e.g. Day 1, Day 2...), you **MUST** assign specific days in \`frequency\`.
         - Do NOT make every habit [0,1,2,3,4,5,6] (Every day).
         - Example: "Day 1: Chest" -> frequency: [0] (Sun). "Day 2: Back" -> [1] (Mon).
         - Spread the workout across the week (0=Sun, 1=Mon, ..., 6=Sat).

      STRICT FORMATTING (JSON):
      - When generating a plan, YOU MUST include "title" and "details".
      - Output JSON for options/plan.
      Structure: 
        Running text first (Response)...
        \`\`\`json
        {
          "options": ["Reply 1", "Reply 2"], 
          "plan": [
             { 
               "title": "Habit Name (REQUIRED)", 
               "details": "Bullet point details (REQUIRED)", 
               "icon": "book", // Ionicons name
               "frequency": [0] // 0=Sun, 1=Mon... (VARY THIS FOR SPLITS)
             },
             ...
           ] 
        }
        \`\`\`
      `

        // 3. Call Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: history,
                    systemInstruction: {
                        parts: [{ text: systemInstruction + languageInstruction }]
                    },
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                    ],
                }),
            }
        )

        const data = await response.json()

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
