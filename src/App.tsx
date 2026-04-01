import { useState, useEffect } from 'react';
import { Welcome } from './components/Welcome';
import { Chat } from './components/Chat';
import { hasSeenWelcome, markWelcomeSeen } from './lib/storage';

function App() {
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

  if (!isReady) {
    return null;
  }

  return showWelcome ? <Welcome onBegin={handleBegin} /> : <Chat />;
}

export default App;
