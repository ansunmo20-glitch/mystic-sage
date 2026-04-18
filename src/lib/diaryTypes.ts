export interface DiaryEntry {
  id: string;
  date: string;
  summary: string;
  emotionBefore: string;
  emotionAfter: string;
  sageMessage: string;
  originalChat: unknown[];
  bgColor: string;
  theme: string;
  character: string | null;
}
