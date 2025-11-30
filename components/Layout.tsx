import React, { useState } from 'react';
import { Home, Edit3, ShoppingBag, User as UserIcon, Users, Menu, X, BarChart } from 'lucide-react';
import { ViewState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItem = ({ view, icon: Icon, label, mobile }: { view: ViewState; icon: any; label: string; mobile?: boolean }) => {
    const isActive = currentView === view;

    if (mobile) {
      return (
        <button
          onClick={() => setView(view)}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 transition-all duration-200 ${
            isActive ? 'text-emerald-400' : 'text-zinc-500'
          }`}
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.1 }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
          </motion.div>
          <span className="text-xs font-medium">{label}</span>
        </button>
      );
    }

    return (
      <motion.button
        onClick={() => setView(view)}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive
            ? 'bg-emerald-500/10 text-emerald-400 font-medium'
            : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
        }`}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'} />
        <span className="text-sm">{label}</span>
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-900 bg-zinc-950 z-50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-zinc-950 text-lg shadow-lg shadow-emerald-500/20">M</div>
          <h1 className="font-bold text-lg tracking-tight text-white">Motixion</h1>
        </motion.div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-64 h-full bg-zinc-950 border-r border-zinc-900 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-zinc-950 text-xl shadow-lg shadow-emerald-500/20">M</div>
                  <div>
                    <h1 className="font-bold text-xl tracking-tight text-white leading-none">Motixion</h1>
                    <p className="text-xs text-zinc-500 mt-1 font-medium">Mobile</p>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setView(ViewState.LOG);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-transform mb-6"
                >
                  <Edit3 size={18} strokeWidth={2.5} />
                  <span>Log Activity</span>
                </motion.button>

                <nav className="space-y-1" onClick={() => setMobileMenuOpen(false)}>
                  <NavItem view={ViewState.DASHBOARD} icon={Home} label="Dashboard" />
                  <NavItem view={ViewState.LEADERBOARD} icon={BarChart} label="Leaderboard" />
                  <NavItem view={ViewState.FRIEND} icon={Users} label="Friends" />
                  <NavItem view={ViewState.SHOP} icon={ShoppingBag} label="Reward Shop" />
                  <NavItem view={ViewState.PROFILE} icon={UserIcon} label="Profile" />
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-zinc-900 bg-zinc-950 flex-col">
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-zinc-950 text-xl shadow-lg shadow-emerald-500/20">M</div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white leading-none">Motixion</h1>
              <p className="text-xs text-zinc-500 mt-1 font-medium">v1.0</p>
            </div>
          </motion.div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setView(ViewState.LOG)}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all mb-6"
          >
            <Edit3 size={18} strokeWidth={2.5} />
            <span>Log Activity</span>
          </motion.button>

          <nav className="space-y-1">
            <NavItem view={ViewState.DASHBOARD} icon={Home} label="Dashboard" />
            <NavItem view={ViewState.LEADERBOARD} icon={BarChart} label="Leaderboard" />
            <NavItem view={ViewState.FRIEND} icon={Users} label="Friends" />
            <NavItem view={ViewState.SHOP} icon={ShoppingBag} label="Reward Shop" />
            <NavItem view={ViewState.PROFILE} icon={UserIcon} label="Profile" />
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-zinc-950/50 pb-20 md:pb-0">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-12"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-900 flex items-center justify-around z-40 safe-area-inset-bottom"
      >
        <NavItem view={ViewState.DASHBOARD} icon={Home} label="Home" mobile />
        <NavItem view={ViewState.FRIEND} icon={Users} label="Friends" mobile />
        <NavItem view={ViewState.LEADERBOARD} icon={BarChart} label="Ranks" mobile />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setView(ViewState.LOG)}
          className="flex flex-col items-center justify-center gap-1 -mt-6"
        >
          <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Edit3 size={24} strokeWidth={2.5} className="text-zinc-950" />
          </div>
          <span className="text-xs font-medium text-emerald-400 mt-1">Log</span>
        </motion.button>
        <NavItem view={ViewState.SHOP} icon={ShoppingBag} label="Shop" mobile />
        <NavItem view={ViewState.PROFILE} icon={UserIcon} label="Profile" mobile />
      </motion.div>
    </div>
  );
};
