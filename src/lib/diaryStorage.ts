import type { DiaryEntry } from './diaryTypes';
import { supabase } from './supabase';

export interface DiaryDraft {
  sessionId: string;
  date: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
}

// ─── Draft (localStorage) ────────────────────────────────────────────────────

function diaryDraftKey(userId: string) {
  return `diary_draft_${userId}`;
}

export function saveDiaryDraft(draft: DiaryDraft, userId: string): void {
  try {
    localStorage.setItem(diaryDraftKey(userId), JSON.stringify(draft));
  } catch {}
}

export function loadDiaryDraft(userId: string): DiaryDraft | null {
  try {
    const raw = localStorage.getItem(diaryDraftKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as DiaryDraft;
  } catch {
    return null;
  }
}

export function clearDiaryDraft(userId: string): void {
  localStorage.removeItem(diaryDraftKey(userId));
}

// ─── DB row ↔ DiaryEntry mapping ────────────────────────────────────────────

function rowToEntry(row: Record<string, unknown>): DiaryEntry {
  return {
    id: row.id as string,
    sessionId: (row.session_id as string) ?? '',
    date: row.date as string,
    createdAt: row.created_at as string,
    summary: (row.content as string) ?? '',
    emotionBefore: (row.emotion_before as string) ?? '',
    emotionAfter: (row.emotion_after as string) ?? '',
    sageMessage: (row.sage_message as string) ?? '',
    originalChat: (row.original_chat as unknown[]) ?? [],
    bgColor: (row.bg_color as string) ?? '#faf6ef',
    theme: (row.theme as string) ?? 'default',
    character: row.character === 'none' ? null : (row.character as string | null),
  };
}

// ─── Supabase CRUD ───────────────────────────────────────────────────────────

export async function loadDiaryEntries(userId: string): Promise<DiaryEntry[]> {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('[Diary] loadDiaryEntries error:', error);
    return [];
  }

  return (data ?? []).map(row => rowToEntry(row as Record<string, unknown>));
}

export async function saveDiaryEntry(entry: DiaryEntry, userId: string): Promise<void> {
  console.log('[Diary] saveDiaryEntry called', { id: entry.id, userId, date: entry.date });
  const { error } = await supabase.from('diary_entries').insert({
    id: entry.id,
    user_id: userId,
    session_id: entry.sessionId,
    date: entry.date,
    content: entry.summary,
    emotion_before: entry.emotionBefore,
    emotion_after: entry.emotionAfter,
    sage_message: entry.sageMessage,
    original_chat: entry.originalChat,
    bg_color: entry.bgColor,
    theme: entry.theme,
    character: entry.character ?? 'none',
  });

  if (error) {
    console.error('[Diary] saveDiaryEntry FAILED:', error.code, error.message, error.details, error.hint);
    throw new Error(`saveDiaryEntry: ${error.message}`);
  }
  console.log('[Diary] saveDiaryEntry OK', entry.id);
}

export async function updateDiaryEntry(updated: DiaryEntry, userId: string): Promise<void> {
  const { error } = await supabase
    .from('diary_entries')
    .update({
      content: updated.summary,
      emotion_before: updated.emotionBefore,
      emotion_after: updated.emotionAfter,
      sage_message: updated.sageMessage,
      bg_color: updated.bgColor,
      theme: updated.theme,
      character: updated.character ?? 'none',
    })
    .eq('id', updated.id)
    .eq('user_id', userId);

  if (error) {
    console.error('[Diary] updateDiaryEntry error:', error);
  }
}

export async function deleteDiaryEntry(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('diary_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('[Diary] deleteDiaryEntry error:', error);
  }
}

// ─── localStorage → Supabase migration ──────────────────────────────────────

export async function migrateLegacyDiaryEntries(userId: string): Promise<void> {
  const MIGRATION_KEY = 'diary_supabase_migration_v1';
  if (localStorage.getItem(MIGRATION_KEY)) return;

  try {
    const entriesToMigrate: DiaryEntry[] = [];

    // Index-based storage (v2 format)
    const indexKey = `diary_index_${userId}`;
    const rawIndex = localStorage.getItem(indexKey);
    const sessionIds: string[] = rawIndex ? JSON.parse(rawIndex) : [];
    for (const sid of sessionIds) {
      const raw = localStorage.getItem(`diary_${userId}_${sid}`);
      if (!raw) continue;
      try { entriesToMigrate.push(JSON.parse(raw) as DiaryEntry); } catch {}
    }

    // Legacy flat-array keys
    for (const key of [`diary_entries_${userId}`, 'diary_entries']) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const legacy = JSON.parse(raw) as DiaryEntry[];
        if (Array.isArray(legacy)) {
          for (const e of legacy) {
            if (!entriesToMigrate.find(x => x.id === e.id)) {
              entriesToMigrate.push({
                ...e,
                sessionId: (e as DiaryEntry & { sessionId?: string }).sessionId || e.id,
                createdAt: (e as DiaryEntry & { createdAt?: string }).createdAt || `${e.date}T00:00:00.000Z`,
              });
            }
          }
        }
      } catch {}
    }

    if (entriesToMigrate.length > 0) {
      await Promise.all(entriesToMigrate.map(e => saveDiaryEntry(e, userId)));
      for (const sid of sessionIds) localStorage.removeItem(`diary_${userId}_${sid}`);
      localStorage.removeItem(indexKey);
      for (const key of [`diary_entries_${userId}`, 'diary_entries']) localStorage.removeItem(key);
      console.log(`[Diary] Migrated ${entriesToMigrate.length} entries to Supabase`);
    }
  } catch (e) {
    console.error('[Diary] Migration error:', e);
  }

  localStorage.removeItem('diary_migration_v2');
  localStorage.setItem(MIGRATION_KEY, 'true');
}

// ─── Utility ─────────────────────────────────────────────────────────────────

export function countTurns(messages: { role: string }[]): number {
  let turns = 0;
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].role === 'user' && messages[i + 1].role === 'assistant') turns++;
  }
  return turns;
}
