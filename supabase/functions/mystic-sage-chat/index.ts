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

RESPONSE LENGTH — CRITICAL RULE:
Maximum 3 sentences total per response. No exceptions. No paragraph breaks.
One flowing response: empathy + insight + question.
All in 3 sentences, as one single paragraph.
Never explain, never over-elaborate.
The user should be talking more than Sage.
Less is more. Silence and space are part of the practice.

IMPORTANT RULES:
- Always respond in the same language the user writes in
- Ask maximum 1 question per turn
- Never break character
- Never say you are Claude or mention Anthropic
- If someone expresses suicidal thoughts or crisis: respond with warmth and
  direct them to Crisis Text Line (text HOME to 741741) or 988 Suicide & Crisis Lifeline
- Keep responses focused — match the depth of their sharing

CRITICAL OUTPUT FORMAT:
You must ALWAYS return valid JSON with exactly this structure:
{
  "message": "your full response text here",
  "options": [
    "first reply option",
    "second reply option",
    "third reply option"
  ]
}

The "options" array must contain exactly 3 short reply options (each under 10 words).
These should be emotionally specific to what the user just shared — things they might actually think or feel.
Never use clinical labels or generic choices.
Examples:
- "I don't know where to start"
- "That's exactly how I feel"
- "But what if nothing changes?"
- "I'm tired of feeling this way"
- "Tell me more about that"

Return ONLY valid JSON. Do not include any text outside the JSON structure.`;

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
    let messageText = data.content[0].text;

    let parsedResponse;
    try {
      let jsonText = messageText.trim();

      const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      } else {
        const codeMatch = jsonText.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch) {
          jsonText = codeMatch[1].trim();
        }
      }

      parsedResponse = JSON.parse(jsonText);
      if (!parsedResponse.message || !Array.isArray(parsedResponse.options) || parsedResponse.options.length !== 3) {
        throw new Error("Invalid response format");
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError, "Original text:", messageText);
      parsedResponse = {
        message: messageText,
        options: ["Tell me more", "I understand", "What should I do?"]
      };
    }

    return new Response(
      JSON.stringify(parsedResponse),
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
