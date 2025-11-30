import React, { useState, useEffect } from 'react';
import { AppProvider } from './services/store';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DailyLogger } from './components/DailyLogger';
import { Shop } from './components/Shop';
import { FriendView } from './components/FriendView';
import { Profile } from './components/Profile';
import { Auth } from './components/Auth';
import { ViewState } from './types';
import { authService } from './services/auth';
import { Loader2 } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import Leaderboard from './components/Leaderboard';

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

  useEffect(() => {
    // Check for existing session
    authService.getSession().then((session) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading Motixion...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth onAuth={() => window.location.reload()} />;
  }

  return (
    <AppProvider>
      <Analytics />
      <AppContent />
    </AppProvider>
  );
};

export default App;