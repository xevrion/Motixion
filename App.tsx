import React, { useState } from 'react';
import { AppProvider } from './services/store';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DailyLogger } from './components/DailyLogger';
import { Shop } from './components/Shop';
import { FriendView } from './components/FriendView';
import { Profile } from './components/Profile';
import { ViewState } from './types';

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
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;