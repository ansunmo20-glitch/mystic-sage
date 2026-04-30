import { supabase } from './supabase';

export interface Message {
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

export function generateTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim();
  return trimmed.length > 30 ? trimmed.slice(0, 30) + '...' : trimmed;
}

export function formatSessionDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export async function getAllSessions(userId: string): Promise<ChatSession[]> {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id, title, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  if (!sessions || sessions.length === 0) return [];

  const sessionIds = sessions.map((s) => s.id);
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('id, session_id, role, content, timestamp')
    .in('session_id', sessionIds)
    .order('timestamp', { ascending: true });

  if (msgError) throw msgError;

  return sessions.map((s) => ({
    id: s.id,
    title: s.title,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    messages: (messages || [])
      .filter((m) => m.session_id === s.id)
      .map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: m.timestamp,
      })),
  }));
}

export async function getSession(sessionId: string, userId: string): Promise<ChatSession | null> {
  const { data: session, error } = await supabase
    .from('sessions')
    .select('id, title, created_at, updated_at')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (error) return null;

  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('id, role, content, timestamp')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });

  if (msgError) throw msgError;

  return {
    id: session.id,
    title: session.title,
    createdAt: session.created_at,
    updatedAt: session.updated_at,
    messages: (messages || []).map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: m.timestamp,
    })),
  };
}

export async function createNewSession(userId: string): Promise<ChatSession> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const { error } = await supabase.from('sessions').insert({
    id,
    user_id: userId,
    title: 'New Conversation',
    created_at: now,
    updated_at: now,
  });
  if (error) throw error;
  return { id, title: 'New Conversation', createdAt: now, updatedAt: now, messages: [] };
}

export async function saveSession(session: ChatSession, userId: string): Promise<void> {
  const now = new Date().toISOString();

  const { error: sessionError } = await supabase.from('sessions').upsert(
    {
      id: session.id,
      user_id: userId,
      title: session.title,
      created_at: session.createdAt,
      updated_at: now,
    },
    { onConflict: 'id' }
  );
  if (sessionError) throw sessionError;

  const { error: deleteError } = await supabase
    .from('messages')
    .delete()
    .eq('session_id', session.id);
  if (deleteError) throw deleteError;

  if (session.messages.length > 0) {
    const { error: insertError } = await supabase.from('messages').insert(
      session.messages.map((m) => ({
        id: m.id,
        session_id: session.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      }))
    );
    if (insertError) throw insertError;
  }
}

export async function deleteSession(sessionId: string, userId: string): Promise<void> {
  await supabase.from('messages').delete().eq('session_id', sessionId);
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function updateSessionTitle(
  sessionId: string,
  firstUserMessage: string,
  userId: string
): Promise<void> {
  const { data: session, error } = await supabase
    .from('sessions')
    .select('title')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (error || !session || session.title !== 'New Conversation') return;

  const { error: updateError } = await supabase
    .from('sessions')
    .update({ title: generateTitle(firstUserMessage), updated_at: new Date().toISOString() })
    .eq('id', sessionId);
  if (updateError) throw updateError;
}

export async function renameSession(
  sessionId: string,
  newTitle: string,
  userId: string
): Promise<void> {
  const trimmed = newTitle.trim();
  if (!trimmed) return;
  const { error } = await supabase
    .from('sessions')
    .update({ title: trimmed, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', userId);
  if (error) throw error;
}
