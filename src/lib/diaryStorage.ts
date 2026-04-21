import type { DiaryEntry } from './diaryTypes';

export interface DiaryDraft {
  sessionId: string;
  date: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
}

function diaryEntriesKey(userId: string) { return `diary_entries_${userId}`; }
function diaryDraftKey(userId: string) { return `diary_draft_${userId}`; }

export function saveDiaryDraft(draft: DiaryDraft, userId: string): void {
  try {
    localStorage.setItem(diaryDraftKey(userId), JSON.stringify(draft));
  } catch {
  }
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
    const raw = localStorage.getItem(diaryEntriesKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as DiaryEntry[];
  } catch {
    return [];
  }
}

export function saveDiaryEntry(entry: DiaryEntry, userId: string): void {
  try {
    const entries = loadDiaryEntries(userId);
    const idx = entries.findIndex(e => e.id === entry.id);
    if (idx >= 0) {
      entries[idx] = entry;
    } else {
      entries.unshift(entry);
    }
    localStorage.setItem(diaryEntriesKey(userId), JSON.stringify(entries));
  } catch {
  }
}

export function updateDiaryEntry(updated: DiaryEntry, userId: string): void {
  try {
    const entries = loadDiaryEntries(userId);
    const idx = entries.findIndex(e => e.id === updated.id);
    if (idx >= 0) {
      entries[idx] = updated;
      localStorage.setItem(diaryEntriesKey(userId), JSON.stringify(entries));
    }
  } catch {
  }
}

export function deleteDiaryEntry(id: string, userId: string): void {
  try {
    const entries = loadDiaryEntries(userId);
    const filtered = entries.filter(e => e.id !== id);
    localStorage.setItem(diaryEntriesKey(userId), JSON.stringify(filtered));
  } catch {
  }
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
