import type { DiaryEntry } from './diaryTypes';

function offsetDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

export const SAMPLE_DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: '1',
    date: offsetDate(0),
    summary: 'Felt a wave of gratitude this morning — something quietly shifted inside.',
    emotionBefore: 'anxious',
    emotionAfter: 'peaceful',
    sageMessage: 'Gratitude has a way of opening what fear closes. You noticed the light today. That is enough.',
    originalChat: [],
    bgColor: '#faf6ef',
    theme: 'default',
    character: null,
  },
  {
    id: '2',
    date: offsetDate(3),
    summary: 'Explored the tension between what I want and what I fear losing.',
    emotionBefore: 'confused',
    emotionAfter: 'curious',
    sageMessage: 'The tension you feel is not a problem to solve. It is a signal asking to be heard. Sit with it a little longer.',
    originalChat: [],
    bgColor: '#faf6ef',
    theme: 'default',
    character: null,
  },
  {
    id: '3',
    date: offsetDate(7),
    summary: 'Wrote about my relationship with stillness — it felt hard at first.',
    emotionBefore: 'restless',
    emotionAfter: 'grounded',
    sageMessage: 'Stillness is not emptiness. It is the space where your truest voice finally has room to speak.',
    originalChat: [],
    bgColor: '#faf6ef',
    theme: 'default',
    character: null,
  },
  {
    id: '4',
    date: offsetDate(12),
    summary: 'A memory surfaced unexpectedly. I let myself sit with it instead of running.',
    emotionBefore: 'melancholy',
    emotionAfter: 'tender',
    sageMessage: 'Old memories return not to haunt, but to be witnessed. You gave it that today. That is a quiet kind of courage.',
    originalChat: [],
    bgColor: '#faf6ef',
    theme: 'default',
    character: null,
  },
];
