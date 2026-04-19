interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamCallbacks {
  onChunk?: (text: string) => void;
  onDone: (message: string, options: string[], tokenUsage: { input: number; output: number; total: number }) => void;
  onError: (error: string) => void;
}

export async function sendMessage(messages: Message[], userId: string, callbacks: StreamCallbacks): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration not found');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/mystic-sage-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ messages, userId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to send message');
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/event-stream')) {
    const data = await response.json();
    if (data.error) {
      callbacks.onError(data.error);
      return;
    }
    callbacks.onDone(
      data.message,
      data.options || [],
      data.tokenUsage || { input: 0, output: 0, total: 0 }
    );
    return;
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    let eventType = "";
    let dataLine = "";

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        eventType = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        dataLine = line.slice(6).trim();
      } else if (line === "") {
        if (eventType && dataLine) {
          try {
            const payload = JSON.parse(dataLine);

            if (eventType === "chunk" && callbacks.onChunk) {
              callbacks.onChunk(payload.text ?? "");
            } else if (eventType === "done") {
              callbacks.onDone(
                payload.message,
                payload.options || [],
                payload.tokenUsage || { input: 0, output: 0, total: 0 }
              );
            } else if (eventType === "error") {
              callbacks.onError(payload.error || "Unknown stream error");
            }
          } catch {
            // ignore malformed events
          }
        }
        eventType = "";
        dataLine = "";
      }
    }
  }
}
