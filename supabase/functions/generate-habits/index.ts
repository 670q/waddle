// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Suppress VS Code errors for Deno environment without extension
declare const Deno: any;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { goal } = await req.json()
        const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')

        if (!GOOGLE_API_KEY) {
            throw new Error('Missing Google API Key')
        }

        if (!goal) {
            throw new Error('Missing goal')
        }

        const systemPrompt = `You are a habit-building expert. The user's goal is: '${goal}'.
    Generate exactly 3 daily habits to achieve this.
    Return ONLY raw JSON. No markdown formatting (no \`\`\`json blocks).
    The JSON structure must be an array: [{"title": "string", "icon": "string", "color": "hex-string"}].
    For icons, select valid 'lucide-react' icon names (e.g., 'book', 'zap', 'droplet').
    For colors, choose vibrant, motivating hex codes.`

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemPrompt }]
                }]
            })
        })

        const data = await response.json()

        // Parse Gemini Response
        // Gemini returns { candidates: [ { content: { parts: [ { text: "..." } ] } } ] }
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!textResponse) {
            throw new Error('Invalid response from Gemini')
        }

        // Clean up potential markdown formatting if Gemini disobeys
        const cleanJson = textResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        const habits = JSON.parse(cleanJson)

        return new Response(
            JSON.stringify(habits),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message || 'Unknown error', habits: [] }), // Return empty habits on error to allow fallback
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }, // Return 200 even on error to handle gracefully in client
        )
    }
})

