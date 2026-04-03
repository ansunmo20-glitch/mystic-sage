import { useState, useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Welcome } from './components/Welcome';
import { Chat } from './components/Chat';
import Login from './components/Login';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { hasSeenWelcome, markWelcomeSeen } from './lib/storage';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

type Page = 'main' | 'terms' | 'privacy';

function AppContent() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('main');

  useEffect(() => {
    if (hasSeenWelcome()) {
      setShowWelcome(false);
    }
    setIsReady(true);

    const path = window.location.pathname;
    if (path === '/terms') {
      setCurrentPage('terms');
    } else if (path === '/privacy') {
      setCurrentPage('privacy');
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/terms') {
        setCurrentPage('terms');
      } else if (path === '/privacy') {
        setCurrentPage('privacy');
      } else {
        setCurrentPage('main');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleBegin = () => {
    markWelcomeSeen();
    setShowWelcome(false);
  };

  const navigateToTerms = () => {
    window.history.pushState({}, '', '/terms');
    setCurrentPage('terms');
  };

  const navigateToPrivacy = () => {
    window.history.pushState({}, '', '/privacy');
    setCurrentPage('privacy');
  };

  const navigateToMain = () => {
    window.history.pushState({}, '', '/');
    setCurrentPage('main');
  };

  if (!isReady) {
    return null;
  }

  if (currentPage === 'terms') {
    return <TermsOfService onBack={navigateToMain} />;
  }

  if (currentPage === 'privacy') {
    return <PrivacyPolicy onBack={navigateToMain} />;
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
