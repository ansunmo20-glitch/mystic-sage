import { useState, useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import InAppBrowserGuard from './components/InAppBrowserGuard';
import { Welcome } from './components/Welcome';
import { Chat } from './components/Chat';
import Login from './components/Login';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Admin } from './components/Admin';
import { Diary } from './components/Diary';
import { BetaConsent } from './components/BetaConsent';
import { hasSeenWelcome, markWelcomeSeen, hasConsented, markConsented } from './lib/storage';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

type Page = 'main' | 'terms' | 'privacy' | 'admin' | 'diary';

function AppContent() {
  const { isSignedIn, user } = useUser();
  const userId = user?.id;

  const [showWelcome, setShowWelcome] = useState(false);
  const [showBetaConsent, setShowBetaConsent] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('main');

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/terms') setCurrentPage('terms');
    else if (path === '/privacy') setCurrentPage('privacy');
    else if (path === '/admin') setCurrentPage('admin');
    else if (path === '/diary') setCurrentPage('diary');
  }, []);

  useEffect(() => {
    if (isSignedIn === undefined) return;

    if (!isSignedIn || !userId) {
      setIsReady(true);
      return;
    }

    (async () => {
      try {
        const [welcomed, consented] = await Promise.all([
          hasSeenWelcome(userId),
          hasConsented(userId),
        ]);
        setShowWelcome(!welcomed);
        setShowBetaConsent(!consented);
      } catch (err) {
        console.error('Failed to load user settings:', err);
      } finally {
        setIsReady(true);
      }
    })();
  }, [isSignedIn, userId]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/terms') setCurrentPage('terms');
      else if (path === '/privacy') setCurrentPage('privacy');
      else if (path === '/admin') setCurrentPage('admin');
      else if (path === '/diary') setCurrentPage('diary');
      else setCurrentPage('main');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleBegin = async () => {
    if (userId) await markWelcomeSeen(userId);
    setShowWelcome(false);
  };

  const handleConsentAccept = async () => {
    if (userId) await markConsented(userId);
    setShowBetaConsent(false);
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

  const navigateToDiary = () => {
    window.history.pushState({}, '', '/diary');
    setCurrentPage('diary');
  };

  if (!isReady) {
    return null;
  }

  if (currentPage === 'admin') {
    return <Admin />;
  }

  if (currentPage === 'terms') {
    return <TermsOfService onBack={navigateToMain} />;
  }

  if (currentPage === 'privacy') {
    return <PrivacyPolicy onBack={navigateToMain} />;
  }

  if (currentPage === 'diary') {
    return (
      <SignedIn>
        <Diary onNavigateHome={navigateToMain} />
      </SignedIn>
    );
  }

  return (
    <>
      <SignedOut>
        <Login onNavigateTerms={navigateToTerms} onNavigatePrivacy={navigateToPrivacy} />
      </SignedOut>
      <SignedIn>
        {showBetaConsent ? (
          <BetaConsent onAccept={handleConsentAccept} />
        ) : showWelcome ? (
          <Welcome onBegin={handleBegin} />
        ) : (
          <Chat onNavigateDiary={navigateToDiary} />
        )}
      </SignedIn>
    </>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <InAppBrowserGuard />
      <AppContent />
    </ClerkProvider>
  );
}

export default App;
