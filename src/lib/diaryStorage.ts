import type { DiaryEntry } from './diaryTypes';

const DIARY_ENTRIES_KEY = 'diary_entries';
const DIARY_DRAFT_KEY = 'diary_draft';

export interface DiaryDraft {
  sessionId: string;
  date: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
}

export function saveDiaryDraft(draft: DiaryDraft): void {
  try {
    localStorage.setItem(DIARY_DRAFT_KEY, JSON.stringify(draft));
  } catch {
  }
}

export function loadDiaryDraft(): DiaryDraft | null {
  try {
    const raw = localStorage.getItem(DIARY_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DiaryDraft;
  } catch {
    return null;
  }
}

export function clearDiaryDraft(): void {
  localStorage.removeItem(DIARY_DRAFT_KEY);
}

export function loadDiaryEntries(): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(DIARY_ENTRIES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DiaryEntry[];
  } catch {
    return [];
  }
}

export function saveDiaryEntry(entry: DiaryEntry): void {
  try {
    const entries = loadDiaryEntries();
    const idx = entries.findIndex(e => e.id === entry.id);
    if (idx >= 0) {
      entries[idx] = entry;
    } else {
      entries.unshift(entry);
    }
    localStorage.setItem(DIARY_ENTRIES_KEY, JSON.stringify(entries));
  } catch {
  }
}

export function updateDiaryEntry(updated: DiaryEntry): void {
  try {
    const entries = loadDiaryEntries();
    const idx = entries.findIndex(e => e.id === updated.id);
    if (idx >= 0) {
      entries[idx] = updated;
      localStorage.setItem(DIARY_ENTRIES_KEY, JSON.stringify(entries));
    }
  } catch {
  }
}

export function deleteDiaryEntry(id: string): void {
  try {
    const entries = loadDiaryEntries();
    const filtered = entries.filter(e => e.id !== id);
    localStorage.setItem(DIARY_ENTRIES_KEY, JSON.stringify(filtered));
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
