import { useState, useEffect } from 'react';
import { Welcome } from './components/Welcome';
import { Chat } from './components/Chat';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { hasSeenWelcome, markWelcomeSeen } from './lib/storage';

function AppContent() {
  const { user, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (hasSeenWelcome()) {
      setShowWelcome(false);
    }
    setIsReady(true);
  }, []);

  const handleBegin = () => {
    markWelcomeSeen();
    setShowWelcome(false);
  };

  if (loading || !isReady) {
    return null;
  }

  if (!user) {
    return <Login />;
  }

  return showWelcome ? <Welcome onBegin={handleBegin} /> : <Chat />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
