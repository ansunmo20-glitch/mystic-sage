interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: (message: string, options: string[], tokenUsage: { input: number; output: number; total: number }) => void;
  onError: (error: string) => void;
}

export async function sendMessage(messages: Message[], userId: string, callbacks: StreamCallbacks): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration not found');
  }

  const apiUrl = `${supabaseUrl}/functions/v1/mystic-sage-chat`;

  const response = await fetch(apiUrl, {
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

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/event-stream')) {
    const data = await response.json();
    callbacks.onDone(data.message, data.options || [], data.tokenUsage || { input: 0, output: 0, total: 0 });
    return;
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (!data) continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'chunk') {
            callbacks.onChunk(parsed.text);
          } else if (parsed.type === 'done') {
            callbacks.onDone(parsed.message, parsed.options || [], parsed.tokenUsage || { input: 0, output: 0, total: 0 });
          } else if (parsed.type === 'error') {
            callbacks.onError(parsed.error);
          }
        } catch {
        }
      }
    }
  }
}
