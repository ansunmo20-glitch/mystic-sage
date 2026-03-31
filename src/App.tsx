import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Chat } from './components/Chat';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  return user ? <Chat /> : <Auth />;
}

export default App;
