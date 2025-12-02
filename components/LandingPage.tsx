import React from 'react';
import { ArrowRight, Users, Trophy, LineChart, Shield, Zap, Sparkles } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const handleEnter = () => {
    window.location.href = '/login';
  };
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500/30">
      
      {/* Navigation */}
      <nav className="border-b border-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-zinc-950 shadow-lg shadow-emerald-500/20">M</div>
            <span className="font-bold text-lg tracking-tight">Motixion</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block">Features</button>
            <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block">Pricing</button>
            <button 
              onClick={handleEnter}
              className="text-sm font-bold bg-zinc-100 text-zinc-950 px-4 py-2 rounded-lg hover:bg-white transition-transform active:scale-95"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-emerald-400 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={12} fill="currentColor" />
            <span>Gamify Your Productivity Journey</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Forge Your Focus.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Gamify Your Growth.</span>
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            The minimal accountability tracker for high-performers. Log habits, earn points, compete with friends, and redeem real rewards.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <button 
              onClick={handleEnter}
              className="h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-lg shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
            >
              Get Started Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={handleEnter} className="h-12 px-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium hover:bg-zinc-800 transition-all">
              Sign In
            </button>
          </div>
        </div>

        {/* Abstract UI Preview */}
        <div className="mt-20 max-w-6xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800/50 p-2 shadow-2xl shadow-emerald-900/10 backdrop-blur-sm">
             <div className="rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden relative aspect-[16/9] md:aspect-[21/9]">
                {/* Mock UI Content */}
                <div className="absolute inset-0 flex">
                   {/* Sidebar Mock */}
                   <div className="w-64 border-r border-zinc-900 bg-zinc-950/50 hidden md:flex flex-col p-6 gap-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg"></div>
                        <div className="h-4 w-24 bg-zinc-800 rounded"></div>
                      </div>
                      <div className="h-10 w-full bg-emerald-500/10 rounded-lg border border-emerald-500/20"></div>
                      <div className="space-y-2">
                        <div className="h-8 w-full bg-zinc-900 rounded-lg"></div>
                        <div className="h-8 w-full bg-zinc-900 rounded-lg"></div>
                        <div className="h-8 w-full bg-zinc-900 rounded-lg"></div>
                      </div>
                   </div>
                   {/* Dashboard Mock */}
                   <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-4 gap-6 content-start">
                      <div className="h-32 bg-zinc-900/50 rounded-xl border border-zinc-800 flex flex-col justify-between p-4">
                         <div className="w-8 h-8 bg-emerald-500/20 rounded-lg mb-2"></div>
                         <div className="h-8 w-16 bg-zinc-800 rounded"></div>
                      </div>
                      <div className="h-32 bg-zinc-900/50 rounded-xl border border-zinc-800 flex flex-col justify-between p-4">
                         <div className="w-8 h-8 bg-orange-500/20 rounded-lg mb-2"></div>
                         <div className="h-8 w-12 bg-zinc-800 rounded"></div>
                      </div>
                      <div className="col-span-1 md:col-span-2 h-32 bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 flex items-end gap-2">
                         <div className="w-full bg-zinc-800 h-8 rounded-t"></div>
                         <div className="w-full bg-emerald-500 h-16 rounded-t"></div>
                         <div className="w-full bg-zinc-800 h-12 rounded-t"></div>
                         <div className="w-full bg-emerald-500/50 h-20 rounded-t"></div>
                      </div>
                   </div>
                </div>
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-zinc-900/30 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why High Performers Choose Motixion</h2>
            <p className="text-zinc-400">Built for those who refuse to settle for mediocrity.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Users} 
              title="Radical Accountability" 
              desc="Link accounts with a friend. See their dashboard. If you slack off, they'll know instantly. No hiding."
            />
            <FeatureCard 
              icon={Trophy} 
              title="Real Stakes Rewards" 
              desc="Set point costs for real-world treats like movies or cheat meals. Earn your leisure time."
            />
            <FeatureCard 
              icon={LineChart} 
              title="Data-Driven Insights" 
              desc="Track wake times, deep work hours, and task completion rates with beautiful, instant analytics."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center font-bold text-zinc-950 text-xs">M</div>
             <span className="text-zinc-500 font-medium">Motixion &copy; 2024</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500">
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-900 transition-all group">
    <div className="w-12 h-12 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:border-emerald-500/50">
      <Icon className="text-emerald-400" size={24} />
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-zinc-400 leading-relaxed">{desc}</p>
  </div>
);
