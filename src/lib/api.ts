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

  const data = await response.json();

  if (data.error) {
    callbacks.onError(data.error);
    return;
  }

  const chunks: string[] = data.chunks || [];
  const tokenUsage = data.tokenUsage || { input: 0, output: 0, total: 0 };

  if (chunks.length === 0) {
    callbacks.onDone(data.message, data.options || [], tokenUsage);
    return;
  }

  for (const chunk of chunks) {
    callbacks.onChunk(chunk);
    await new Promise<void>((resolve) => setTimeout(resolve, 10));
  }

  callbacks.onDone(data.message, data.options || [], tokenUsage);
}
