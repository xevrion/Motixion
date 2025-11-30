import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { REWARDS } from '../services/mockData';
import { CustomRewardForm } from './CustomRewardForm';
import { CustomReward, Reward } from '../types';
import { CustomRewardInput } from '../services/customRewards';
import { Lock, ShoppingBag, Plus, Edit, Trash2, Sparkles } from 'lucide-react';

export const Shop: React.FC = () => {
  const { 
    user, 
    buyReward, 
    loading, 
    customRewards, 
    addCustomReward, 
    updateCustomReward, 
    deleteCustomReward 
  } = useAppStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<CustomReward | null>(null);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading shop...</p>
        </div>
      </div>
    );
  }

  const handleOpenForm = (reward?: CustomReward) => {
    setEditingReward(reward || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingReward(null);
  };

  const handleSubmitReward = async (rewardData: CustomRewardInput) => {
    if (editingReward) {
      await updateCustomReward(editingReward.id, rewardData);
    } else {
      await addCustomReward(rewardData);
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (window.confirm('Are you sure you want to delete this custom reward?')) {
      try {
        await deleteCustomReward(rewardId);
      } catch (error) {
        alert('Failed to delete custom reward');
      }
    }
  };

  const renderRewardCard = (reward: Reward) => {
    const canAfford = user.balance >= reward.cost;
    const isCustom = reward.isCustom || false;
    return (
      <div
        key={reward.id}
        className={`bg-zinc-900 border relative overflow-hidden group p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl sm:rounded-2xl flex flex-col items-center justify-between aspect-[4/5] transition-all duration-300 ${
          canAfford
            ? 'border-zinc-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-900/10 hover:-translate-y-1 active:scale-95'
            : 'border-zinc-800 opacity-60 grayscale-[0.5]'
        } ${isCustom ? 'ring-1 sm:ring-2 ring-purple-500/20' : ''}`}
      >
        {/* Category Badge */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col sm:flex-row gap-1 sm:gap-2 items-end">
          {isCustom && (
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-purple-500/20 flex items-center gap-0.5 sm:gap-1">
              <Sparkles size={8} className="sm:w-[10px] sm:h-[10px]" />
              <span className="hidden xs:inline">Custom</span>
            </span>
          )}
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-950 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-zinc-800">
            {reward.category}
          </span>
        </div>

        {/* Edit/Delete buttons for custom rewards */}
        {isCustom && (
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex gap-1 sm:gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const customReward = customRewards.find(cr => cr.id === reward.id);
              if (customReward) handleOpenForm(customReward);
            }}
              className="p-1.5 sm:p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-colors text-purple-400 hover:text-purple-300 active:scale-95"
              title="Edit reward"
            >
              <Edit size={12} className="sm:w-[14px] sm:h-[14px]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteReward(reward.id);
              }}
              className="p-1.5 sm:p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors text-red-400 hover:text-red-300 active:scale-95"
              title="Delete reward"
            >
              <Trash2 size={12} className="sm:w-[14px] sm:h-[14px]" />
            </button>
          </div>
        )}

        <div className="text-center mt-4 sm:mt-6 pt-4 sm:pt-0">
          <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl block mb-2 sm:mb-3 md:mb-4 lg:mb-6 drop-shadow-2xl">{reward.icon}</span>
          <h3 className="font-bold text-white text-xs sm:text-sm md:text-base lg:text-lg leading-tight mb-0.5 sm:mb-1 md:mb-2 px-1 line-clamp-2">{reward.name}</h3>
          <p className="text-zinc-500 text-[10px] sm:text-xs md:text-sm hidden sm:block">Reward Item</p>
        </div>

        <button
          disabled={!canAfford}
          onClick={async () => {
            const success = await buyReward(reward);
            if (!success) alert('Failed to purchase reward');
          }}
          className={`w-full py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 rounded-xl text-[10px] sm:text-xs md:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-colors mt-auto active:scale-95 ${
            canAfford
              ? 'bg-zinc-100 text-zinc-900 hover:bg-white shadow-lg'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
          }`}
        >
          {!canAfford ? <Lock size={11} className="sm:w-3 sm:h-3" /> : <Plus size={11} className="sm:w-3 sm:h-3" />}
          <span>{reward.cost} pts</span>
        </button>
      </div>
    );
  };

  // Combine global and custom rewards, marking custom ones
  const globalRewardsList: Array<Reward> = REWARDS.map(r => ({ ...r, isCustom: false }));
  const customRewardsList: Array<Reward> = customRewards.map(r => ({
    id: r.id,
    name: r.name,
    cost: r.cost,
    icon: r.icon,
    category: r.category,
    isCustom: true,
    userId: r.userId
  }));
  const allRewards: Reward[] = [...globalRewardsList, ...customRewardsList];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Reward Shop</h2>
            <p className="text-xs sm:text-sm md:text-base text-zinc-400 mt-1">Redeem your hard-earned points for real-world treats.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 px-4 sm:px-6 py-3 rounded-xl flex items-center gap-3 sm:gap-4 w-full sm:w-fit justify-between sm:justify-start">
            <div>
              <p className="text-zinc-500 text-xs font-bold uppercase">Balance</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-none">{user.balance}</h2>
            </div>
            <div className="bg-emerald-500/10 p-2 sm:p-3 rounded-full">
              <ShoppingBag className="text-emerald-400" size={20} />
            </div>
          </div>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="w-full sm:w-auto px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Sparkles size={18} />
          <span>Add Custom Reward</span>
        </button>
      </div>

      {allRewards.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-zinc-900 border border-zinc-800 rounded-2xl px-4">
          <ShoppingBag className="mx-auto text-zinc-600 mb-4" size={40} />
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No rewards available</h3>
          <p className="text-sm sm:text-base text-zinc-400 mb-4">Add your first custom reward to get started!</p>
          <button
            onClick={() => handleOpenForm()}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-colors flex items-center gap-2 mx-auto text-sm sm:text-base"
          >
            <Sparkles size={18} />
            Add Custom Reward
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {allRewards.map(reward => renderRewardCard(reward))}
        </div>
      )}

      <CustomRewardForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitReward}
        editingReward={editingReward}
      />
    </div>
  );
};