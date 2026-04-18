interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamCallbacks {
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
}
