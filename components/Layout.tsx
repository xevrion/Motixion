import React from 'react';
import { Home, Edit3, ShoppingBag, User as UserIcon, Users, LogOut } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => setView(view)}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
            : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
        }`}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'} />
        <span className="text-sm">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 border-r border-zinc-900 bg-zinc-950 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-zinc-950 text-xl shadow-lg shadow-emerald-500/20">F</div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white leading-none">FocusForge</h1>
              <p className="text-xs text-zinc-500 mt-1 font-medium">Desktop Edition</p>
            </div>
          </div>

          <button
            onClick={() => setView(ViewState.LOG)}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-transform active:scale-95 mb-6"
          >
            <Edit3 size={18} strokeWidth={2.5} />
            <span>Log Activity</span>
          </button>

          <nav className="space-y-1">
            <NavItem view={ViewState.DASHBOARD} icon={Home} label="Dashboard" />
            <NavItem view={ViewState.FRIEND} icon={Users} label="Friends" />
            <NavItem view={ViewState.SHOP} icon={ShoppingBag} label="Reward Shop" />
            <NavItem view={ViewState.PROFILE} icon={UserIcon} label="Profile" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-zinc-900">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-colors">
            <LogOut size={20} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-zinc-950/50">
        <div className="max-w-6xl mx-auto p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
};