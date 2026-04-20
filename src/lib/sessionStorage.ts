interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

const SESSIONS_KEY = 'mystic_sessions';

export function generateTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim();
  return trimmed.length > 30 ? trimmed.slice(0, 30) + '...' : trimmed;
}

export function renameSession(sessionId: string, newTitle: string): void {
  try {
    const sessions = getAllSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.title = newTitle.trim() || session.title;
      session.updatedAt = new Date().toISOString();
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
  } catch (error) {
    console.error('Error renaming session:', error);
  }
}

export function formatSessionDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getAllSessions(): ChatSession[] {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    if (!data) return [];
    const sessions = JSON.parse(data) as ChatSession[];
    return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
}

export function getSession(sessionId: string): ChatSession | null {
  const sessions = getAllSessions();
  return sessions.find(s => s.id === sessionId) || null;
}

export function createNewSession(): ChatSession {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: 'New Conversation',
    createdAt: now,
    updatedAt: now,
    messages: []
  };
}

export function saveSession(session: ChatSession): void {
  try {
    const sessions = getAllSessions();
    const index = sessions.findIndex(s => s.id === session.id);

    if (index >= 0) {
      sessions[index] = { ...session, updatedAt: new Date().toISOString() };
    } else {
      sessions.push(session);
    }

    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

export function deleteSession(sessionId: string): void {
  try {
    const sessions = getAllSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

export function updateSessionTitle(sessionId: string, firstUserMessage: string): void {
  try {
    const sessions = getAllSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.title === 'New Conversation') {
      session.title = generateTitle(firstUserMessage);
      session.updatedAt = new Date().toISOString();
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
  } catch (error) {
    console.error('Error updating session title:', error);
  }
}
