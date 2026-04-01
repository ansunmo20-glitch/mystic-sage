interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ApiResponse {
  message: string;
  options: string[];
}

export async function sendMessage(messages: Message[]): Promise<ApiResponse> {
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
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to send message');
  }

  const data = await response.json();
  return data;
}
