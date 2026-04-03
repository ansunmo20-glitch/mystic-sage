import { getAllSessions } from './sessionStorage';

export function exportConversations() {
  const sessions = getAllSessions();

  if (sessions.length === 0) {
    alert('No conversations to export');
    return;
  }

  let content = 'MYSTIC SAGE - EXPORTED CONVERSATIONS\n';
  content += '=' .repeat(60) + '\n\n';

  sessions.forEach((session, index) => {
    const date = new Date(session.createdAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    content += `CONVERSATION ${index + 1}\n`;
    content += `Title: ${session.title}\n`;
    content += `Date: ${date}\n`;
    content += '-'.repeat(60) + '\n\n';

    session.messages.forEach((message) => {
      const role = message.role === 'user' ? 'YOU' : 'SAGE';
      content += `${role}:\n${message.content}\n\n`;
    });

    content += '='.repeat(60) + '\n\n';
  });

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mystic-sage-conversations.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
