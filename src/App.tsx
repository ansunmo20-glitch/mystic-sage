import { useState, useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Welcome } from './components/Welcome';
import { Chat } from './components/Chat';
import Login from './components/Login';
import { hasSeenWelcome, markWelcomeSeen } from './lib/storage';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

function AppContent() {
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

  return (
    <>
      <SignedOut>
        <Login />
      </SignedOut>
      <SignedIn>
        {showWelcome ? <Welcome onBegin={handleBegin} /> : <Chat />}
      </SignedIn>
    </>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AppContent />
    </ClerkProvider>
  );
}

export default App;
