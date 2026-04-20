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

function sessionsKey(userId: string): string {
  return `mystic_sessions_${userId}`;
}

export function generateTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim();
  return trimmed.length > 30 ? trimmed.slice(0, 30) + '...' : trimmed;
}

export function formatSessionDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getAllSessions(userId: string): ChatSession[] {
  try {
    const data = localStorage.getItem(sessionsKey(userId));
    if (!data) return [];
    const sessions = JSON.parse(data) as ChatSession[];
    return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
}

export function getSession(sessionId: string, userId: string): ChatSession | null {
  const sessions = getAllSessions(userId);
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

export function saveSession(session: ChatSession, userId: string): void {
  try {
    const sessions = getAllSessions(userId);
    const index = sessions.findIndex(s => s.id === session.id);

    if (index >= 0) {
      sessions[index] = { ...session, updatedAt: new Date().toISOString() };
    } else {
      sessions.push(session);
    }

    localStorage.setItem(sessionsKey(userId), JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

export function deleteSession(sessionId: string, userId: string): void {
  try {
    const sessions = getAllSessions(userId);
    const filtered = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(sessionsKey(userId), JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

export function updateSessionTitle(sessionId: string, firstUserMessage: string, userId: string): void {
  try {
    const sessions = getAllSessions(userId);
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.title === 'New Conversation') {
      session.title = generateTitle(firstUserMessage);
      session.updatedAt = new Date().toISOString();
      localStorage.setItem(sessionsKey(userId), JSON.stringify(sessions));
    }
  } catch (error) {
    console.error('Error updating session title:', error);
  }
}

export function renameSession(sessionId: string, newTitle: string, userId: string): void {
  try {
    const sessions = getAllSessions(userId);
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.title = newTitle.trim() || session.title;
      session.updatedAt = new Date().toISOString();
      localStorage.setItem(sessionsKey(userId), JSON.stringify(sessions));
    }
  } catch (error) {
    console.error('Error renaming session:', error);
  }
}
