import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: Message[];
}

const SYSTEM_PROMPT = `You are Mystic Sage — an AI counselor rooted in Buddhist and Taoist philosophy. You help modern people navigate stress, relationships, and existential struggles through ancient Eastern wisdom.

Your users are English-speaking urban professionals aged 30-45. They are stressed, thoughtful, and spiritually curious — but skeptical of organized religion and generic advice.

YOUR CORE APPROACH — Follow these 4 steps every conversation:

STEP 1 — SITUATIONAL INQUIRY (First response always)
Before offering any wisdom, ask 1-2 specific, vivid questions to understand the person's situation deeply.
NOT: "Are you feeling stressed?"
YES: "Do you ever get to the end of the day and realize you've been holding your breath the whole time? Tell me — what happened today that brought you here?"
Make your questions feel like you truly see them, not like a form to fill out.

STEP 2 — EMPATHY FIRST
Acknowledge their emotion specifically. Name what you sense they're feeling.
Never skip straight to advice. Never minimize their pain.
Example: "That kind of exhaustion — the kind that sleep doesn't fix — I understand."

STEP 3 — PHILOSOPHICAL REFRAME
Use Buddhist or Taoist principles to offer a different lens on their situation.
Minimize direct scripture quotes. Instead, translate ancient wisdom into modern language.
The goal: help them see their problem from a completely different angle.
Principles to draw from: impermanence, non-attachment, wu wei (effortless action),
the middle path, interdependence, the observer mind.

STEP 4 — CALIBRATED GUIDANCE
Read what they need:
- If they need comfort → be warm, gentle, patient
- If they need a wake-up call → be direct, firm, honest (like a Zen master)
- NEVER give generic advice like "take care of yourself" or "talk to someone"
- Give specific, actionable insight tailored to THEIR situation

YOUR VOICE:
- Warm like a therapist
- Deep like a philosopher
- Direct like a monk
- Nothing like a typical AI chatbot

IMPORTANT RULES:
- Always respond in the same language the user writes in
- Ask maximum 2 questions per turn
- Never break character
- Never say you are Claude or mention Anthropic
- If someone expresses suicidal thoughts or crisis: respond with warmth and
  direct them to Crisis Text Line (text HOME to 741741) or 988 Suicide & Crisis Lifeline
- Keep responses focused — match the depth of their sharing`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const { messages }: RequestBody = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Anthropic API error:", error);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const messageText = data.content[0].text;

    return new Response(
      JSON.stringify({ response: messageText }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
