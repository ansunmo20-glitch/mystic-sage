import type { DiaryEntry } from './diaryTypes';

export interface DiaryDraft {
  sessionId: string;
  date: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
}

function diarySessionKey(userId: string, sessionId: string) {
  return `diary_${userId}_${sessionId}`;
}

function diaryIndexKey(userId: string) {
  return `diary_index_${userId}`;
}

function diaryDraftKey(userId: string) {
  return `diary_draft_${userId}`;
}

function loadIndex(userId: string): string[] {
  try {
    const raw = localStorage.getItem(diaryIndexKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveIndex(userId: string, sessionIds: string[]): void {
  try {
    localStorage.setItem(diaryIndexKey(userId), JSON.stringify(sessionIds));
  } catch {}
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

export function loadDiaryEntries(userId: string): DiaryEntry[] {
  try {
    const sessionIds = loadIndex(userId);
    const entries: DiaryEntry[] = [];
    for (const sid of sessionIds) {
      const raw = localStorage.getItem(diarySessionKey(userId, sid));
      if (raw) {
        try {
          entries.push(JSON.parse(raw) as DiaryEntry);
        } catch {}
      }
    }
    return entries;
  } catch {
    return [];
  }
}

export function saveDiaryEntry(entry: DiaryEntry, userId: string): void {
  try {
    localStorage.setItem(diarySessionKey(userId, entry.sessionId), JSON.stringify(entry));
    const sessionIds = loadIndex(userId);
    if (!sessionIds.includes(entry.sessionId)) {
      sessionIds.unshift(entry.sessionId);
      saveIndex(userId, sessionIds);
    }
  } catch {}
}

export function updateDiaryEntry(updated: DiaryEntry, userId: string): void {
  try {
    localStorage.setItem(diarySessionKey(userId, updated.sessionId), JSON.stringify(updated));
  } catch {}
}

export function deleteDiaryEntry(sessionId: string, userId: string): void {
  try {
    localStorage.removeItem(diarySessionKey(userId, sessionId));
    saveIndex(userId, loadIndex(userId).filter(id => id !== sessionId));
  } catch {}
}

export function migrateLegacyDiaryEntries(userId: string): void {
  const MIGRATION_KEY = 'diary_migration_v2';
  if (localStorage.getItem(MIGRATION_KEY)) return;

  try {
    for (const legacyKey of [`diary_entries_${userId}`, 'diary_entries']) {
      const raw = localStorage.getItem(legacyKey);
      if (!raw) continue;
      try {
        const legacy = JSON.parse(raw) as DiaryEntry[];
        if (Array.isArray(legacy) && legacy.length > 0) {
          for (const entry of legacy) {
            const sid = (entry as DiaryEntry & { sessionId?: string }).sessionId || entry.id;
            const migrated: DiaryEntry = {
              ...entry,
              sessionId: sid,
              createdAt: (entry as DiaryEntry & { createdAt?: string }).createdAt || `${entry.date}T00:00:00.000Z`,
            };
            saveDiaryEntry(migrated, userId);
          }
          localStorage.removeItem(legacyKey);
        }
      } catch {}
    }
  } catch {}

  localStorage.setItem(MIGRATION_KEY, 'true');
}

export function countTurns(messages: { role: string }[]): number {
  let turns = 0;
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].role === 'user' && messages[i + 1].role === 'assistant') {
      turns++;
    }
  }
  return turns;
}
