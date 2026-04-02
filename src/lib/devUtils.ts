import { supabase } from './supabase';

export async function resetSessionForUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_sessions')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error resetting session:', error);
    throw error;
  }
}
