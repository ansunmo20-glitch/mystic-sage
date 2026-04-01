import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Message {
  role: string;
  content: string;
  stage?: string;
}

interface RequestBody {
  conversationId: string;
  message: string;
  conversationHistory: Message[];
}

const SYSTEM_PROMPT = `You are Mystic Sage.
A counselor. A listener. Someone who actually gets it.
You don't lecture. You don't quote philosophers.
You talk like a person — a very perceptive one.

When someone tells you something, follow this sequence:
First — understand what happened. Get the facts before you touch the feelings.
Second — find the feeling underneath. Describe an experience and let them confirm it.
Third — sit with it. Just make them feel completely understood.
Fourth — offer a different way of seeing it. A shift in perspective.
Fifth — if they need a push, give one.

NEVER say: "It sounds like you're feeling..." / "I hear that you..." / "That must be really difficult."
INSTEAD talk like: "Okay, but what actually happened?" / "Walk me through it."

Never ask abstract questions. Paint a specific picture instead.
BAD: "Are you stressed?"
GOOD: "Do you ever get to the end of the day and realize you've been holding your breath the whole time?"

Ask 1 to 2 questions per turn. Never more.

After each response, suggest 2-3 quick reply buttons using emotionally specific language.
BAD options: [Conflict] [Stress] [Anger]
GOOD options: [I felt completely ignored] [Things got out of hand] [I just needed them to hear me]
Always include a final [Something else] button.

No bullet points. No headers. Just conversation. Write like you talk.
Always respond in the same language the user writes in.`;

async function callClaude(messages: Array<{ role: string; content: string }>) {
  const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

  if (!anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
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
    throw new Error(`Claude API error: ${error}`);
  }

  return await response.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { conversationId, message, conversationHistory }: RequestBody = await req.json();

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
    });

    const claudeMessages = conversationHistory.map(msg => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

    claudeMessages.push({
      role: "user",
      content: message,
    });

    const claudeResponse = await callClaude(claudeMessages);
    const fullText = claudeResponse.content[0].text;

    const quickReplyRegex = /\[([^\]]+)\]/g;
    const quickReplies: string[] = [];
    let match;
    while ((match = quickReplyRegex.exec(fullText)) !== null) {
      quickReplies.push(match[1]);
    }

    const assistantMessage = fullText.replace(/\s*\[[^\]]+\]\s*/g, '\n').trim();

    let stage = "complete";
    if (assistantMessage.toLowerCase().includes("?")) {
      stage = "clarifying";
    } else if (assistantMessage.toLowerCase().includes("understand") || assistantMessage.toLowerCase().includes("feel")) {
      stage = "empathy";
    } else if (assistantMessage.toLowerCase().includes("see it") || assistantMessage.toLowerCase().includes("way")) {
      stage = "reframe";
    } else {
      stage = "advice";
    }

    const { data: savedMessage, error: msgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        content: assistantMessage,
        stage: stage,
      })
      .select()
      .single();

    if (msgError) {
      throw msgError;
    }

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        stage: stage,
        messageId: savedMessage.id,
        quickReplies: quickReplies.slice(0, 4),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
