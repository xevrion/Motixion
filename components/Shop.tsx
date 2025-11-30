import React from 'react';
import { useAppStore } from '../services/store';
import { REWARDS } from '../services/mockData';
import { Lock, ShoppingBag, Plus } from 'lucide-react';

export const Shop: React.FC = () => {
  const { user, buyReward } = useAppStore();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Reward Shop</h2>
            <p className="text-zinc-400 mt-1">Redeem your hard-earned points for real-world treats.</p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-xl flex items-center gap-4">
            <div>
                <p className="text-zinc-500 text-xs font-bold uppercase">Balance</p>
                <h2 className="text-3xl font-bold text-white leading-none">{user.balance}</h2>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-full">
                <ShoppingBag className="text-emerald-400" size={24} />
            </div>
          </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {REWARDS.map(reward => {
          const canAfford = user.balance >= reward.cost;
          return (
            <div 
                key={reward.id} 
                className={`bg-zinc-900 border relative overflow-hidden group p-6 rounded-2xl flex flex-col items-center justify-between aspect-[4/5] transition-all duration-300 ${
                    canAfford 
                        ? 'border-zinc-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-900/10 hover:-translate-y-1' 
                        : 'border-zinc-800 opacity-60 grayscale-[0.5]'
                }`}
            >
              {/* Category Badge */}
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-950 px-2 py-1 rounded-full border border-zinc-800">
                    {reward.category}
                </span>
              </div>

              <div className="text-center mt-4">
                <span className="text-6xl block mb-6 drop-shadow-2xl">{reward.icon}</span>
                <h3 className="font-bold text-white text-lg leading-tight mb-2">{reward.name}</h3>
                <p className="text-zinc-500 text-sm">Reward Item</p>
              </div>
              
              <button
                disabled={!canAfford}
                onClick={() => buyReward(reward)}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors mt-6 ${
                    canAfford 
                        ? 'bg-zinc-100 text-zinc-900 hover:bg-white shadow-lg' 
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                }`}
              >
                {!canAfford ? <Lock size={14} /> : <Plus size={14} />}
                {reward.cost} pts
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};