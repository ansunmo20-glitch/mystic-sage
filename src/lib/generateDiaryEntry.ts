import type { DiaryEntry } from './diaryTypes';
import type { DiaryDraft } from './diaryStorage';

export async function generateDiaryEntry(draft: DiaryDraft): Promise<DiaryEntry> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const firstUserMessage = draft.messages.find(m => m.role === 'user')?.content ?? 'Had a conversation today.';

  const fallbackEntry: DiaryEntry = {
    id: crypto.randomUUID(),
    sessionId: draft.sessionId,
    date: draft.date,
    createdAt: new Date().toISOString(),
    summary: firstUserMessage,
    emotionBefore: 'overwhelmed',
    emotionAfter: 'unknown',
    sageMessage: 'Every step forward counts, however small.',
    originalChat: draft.messages,
    bgColor: '#faf6ef',
    theme: 'default',
    character: null,
  };

  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('[Diary] Missing Supabase config, using fallback');
      return fallbackEntry;
    }

    console.log('[Diary] Generating diary for', draft.messages.length, 'messages');

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

    console.log('[Diary] API response status:', response.status);

    if (!response.ok) {
      console.log('[Diary] API call failed with status', response.status);
      return fallbackEntry;
    }

    const data = await response.json();
    const rawText: string = data.message ?? '';

    console.log('[Diary] Raw response text:', rawText);

    const clean = rawText.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.log('[Diary] JSON parse failed:', parseErr, '| Raw text was:', rawText);
      return fallbackEntry;
    }

    return {
      id: crypto.randomUUID(),
      sessionId: draft.sessionId,
      date: draft.date,
      createdAt: new Date().toISOString(),
      summary: parsed.summary ?? fallbackEntry.summary,
      emotionBefore: parsed.emotionBefore ?? fallbackEntry.emotionBefore,
      emotionAfter: parsed.emotionAfter ?? fallbackEntry.emotionAfter,
      sageMessage: parsed.sageMessage ?? fallbackEntry.sageMessage,
      originalChat: draft.messages,
      bgColor: '#faf6ef',
      theme: 'default',
      character: null,
    };
  } catch (err) {
    console.log('[Diary] Unexpected error:', err);
    return fallbackEntry;
  }
}
