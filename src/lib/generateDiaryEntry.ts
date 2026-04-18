import type { DiaryEntry } from './diaryTypes';
import type { DiaryDraft } from './diaryStorage';

export async function generateDiaryEntry(draft: DiaryDraft): Promise<DiaryEntry> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const fallbackEntry: DiaryEntry = {
    id: crypto.randomUUID(),
    date: draft.date,
    summary: draft.messages.find(m => m.role === 'user')?.content ?? '',
    emotionBefore: '',
    emotionAfter: '',
    sageMessage: '',
    originalChat: draft.messages,
    bgColor: '#faf6ef',
    theme: 'default',
    character: null,
  };

  try {
    if (!supabaseUrl || !supabaseAnonKey) return fallbackEntry;

    const apiUrl = `${supabaseUrl}/functions/v1/mystic-sage-chat`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        messages: draft.messages,
        isDiarySummary: true,
      }),
    });

    if (!response.ok) return fallbackEntry;

    const data = await response.json();
    const text: string = data.message ?? '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallbackEntry;

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      id: crypto.randomUUID(),
      date: draft.date,
      summary: parsed.summary ?? fallbackEntry.summary,
      emotionBefore: parsed.emotionBefore ?? '',
      emotionAfter: parsed.emotionAfter ?? '',
      sageMessage: parsed.sageMessage ?? '',
      originalChat: draft.messages,
      bgColor: '#faf6ef',
      theme: 'default',
      character: null,
    };
  } catch {
    return fallbackEntry;
  }
}
