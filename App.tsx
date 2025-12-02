import React, { useState, useEffect } from 'react';
import { AppProvider } from './services/store';
import { ThemeProvider } from './services/theme';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DailyLogger } from './components/DailyLogger';
import { Shop } from './components/Shop';
import { FriendView } from './components/FriendView';
import { Profile } from './components/Profile';
import { Auth } from './components/Auth';
import { LandingPage } from './components/LandingPage';
import { ViewState } from './types';
import { authService } from './services/auth';
import { notificationService } from './services/notifications';
import { Loader2 } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import Leaderboard from './components/Leaderboard';
import { SpeedInsights } from '@vercel/speed-insights/react';

const AppContent: React.FC = () => {
  const [currentView, setView] = useState<ViewState>(ViewState.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.LOG:
        return <DailyLogger setView={setView} />;
      case ViewState.SHOP:
        return <Shop />;
      case ViewState.FRIEND:
        return <FriendView />;
      case ViewState.PROFILE:
        return <Profile />;
      case ViewState.LEADERBOARD:
        return <Leaderboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setView}>
      <div className="animate-in fade-in duration-500">
        {renderView()}
      </div>
    </Layout>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = window.location.pathname;

  useEffect(() => {
    // Check for existing session
    authService.getSession().then((session) => {
      setSession(session);
      setLoading(false);
      
      // Handle routing based on auth state
      const currentPath = window.location.pathname;
      if (session && currentPath === '/login') {
        window.location.href = '/dashboard';
      } else if (!session && currentPath !== '/' && currentPath !== '/login') {
        window.location.href = '/login';
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        const currentPath = window.location.pathname;
        if (session && currentPath === '/login') {
          window.location.href = '/dashboard';
        } else if (!session && currentPath !== '/' && currentPath !== '/login') {
          window.location.href = '/login';
        }
      }
    );

    // Register service worker for push notifications (if supported)
    if (notificationService.isSupported()) {
      notificationService.registerServiceWorker().catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  // Show landing page at root
  if (pathname === '/' || pathname === '') {
    return (
      <>
        <Analytics />
        <SpeedInsights />
        <LandingPage />
      </>
    );
  }

  // Show login page
  if (pathname === '/login') {
    if (loading) {
      return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={48} className="text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Loading...</p>
          </div>
        </div>
      );
    }

    // If already logged in, redirect to dashboard
    if (session) {
      window.location.href = '/dashboard';
      return null;
    }

    return (
      <>
        <Analytics />
        <SpeedInsights />
        <Auth onAuth={() => {
          window.location.href = '/dashboard';
        }} />
      </>
    );
  }

  // Protected routes (dashboard and all app routes)
  // All other routes are treated as app routes (dashboard, shop, etc.)
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading Motixion...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    // Redirect to login if not authenticated
    window.location.href = '/login';
    return null;
  }

  return (
    <ThemeProvider>
      <AppProvider>
        <Analytics />
        <SpeedInsights />
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;