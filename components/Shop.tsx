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
          <p className="text-zinc-600 dark:text-zinc-400">Loading shop...</p>
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
    if (window.confirm('Delete this reward?')) {
      try {
        await deleteCustomReward(rewardId);
      } catch {
        alert('Failed to delete');
      }
    }
  };

  const renderRewardCard = (reward: Reward) => {
    const canAfford = user.balance >= reward.cost;
    const isCustom = reward.isCustom;

    return (
      <div
        key={reward.id}
        className={`relative bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 flex flex-col items-center justify-between aspect-[4/5] transition-all duration-300
          ${canAfford
            ? 'hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-900/10 hover:-translate-y-1 active:scale-95'
            : 'opacity-60 grayscale-[0.5]'
          }
          ${isCustom ? 'ring-2 ring-purple-500/30' : ''}
        `}
      >
        {/* Category + Custom Badge */}
        <div className="absolute top-3 right-3 flex gap-2">
          {isCustom && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20 flex items-center gap-1">
              <Sparkles size={10} />
              Custom
            </span>
          )}

          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 dark:bg-zinc-950 px-2 py-1 rounded-full border border-zinc-300 dark:border-zinc-800">
            {reward.category}
          </span>
        </div>

        {/* Edit/Delete for Custom Rewards */}
        {isCustom && (
          <div className="absolute top-3 left-3 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const r = customRewards.find(cr => cr.id === reward.id);
                if (r) handleOpenForm(r);
              }}
              className="p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-md text-purple-400 active:scale-95"
            >
              <Edit size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteReward(reward.id);
              }}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-md text-red-400 active:scale-95"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {/* Icon + Title */}
        <div className="text-center mt-6">
          <span className="text-5xl drop-shadow-2xl">{reward.icon}</span>
          <h3 className="font-bold text-zinc-900 dark:text-white text-base mt-2 line-clamp-2">
            {reward.name}
          </h3>
          <p className="text-zinc-500 text-xs hidden sm:block">Reward Item</p>
        </div>

        {/* Buy Button */}
        <button
          disabled={!canAfford}
          onClick={async () => {
            const ok = await buyReward(reward);
            if (!ok) alert('Purchase failed');
          }}
          className={`w-full py-2 rounded-lg mt-auto text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-colors
            ${canAfford
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-black dark:hover:bg-zinc-200 shadow-lg'
              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-300 dark:border-zinc-700'
            }
          `}
        >
          {canAfford ? <Plus size={12} /> : <Lock size={12} />}
          {reward.cost} pts
        </button>
      </div>
    );
  };

  // Merge Global + Custom Rewards
  const globalRewards: Reward[] = REWARDS.map(r => ({ ...r, isCustom: false }));
  const userCustomRewards: Reward[] = customRewards.map(r => ({
    id: r.id,
    name: r.name,
    cost: r.cost,
    icon: r.icon,
    category: r.category,
    isCustom: true,
    userId: r.userId
  }));
  const allRewards = [...globalRewards, ...userCustomRewards];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Reward Shop</h2>
          <p className="text-zinc-500 text-sm mt-1">
            Redeem your hard-earned points.
          </p>
        </div>

        {/* Balance Card */}
        <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-6 py-3 rounded-xl">
          <div>
            <p className="text-xs font-bold uppercase text-zinc-500">Balance</p>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">{user.balance}</h2>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-full">
            <ShoppingBag className="text-emerald-400" size={22} />
          </div>
        </div>
      </div>

      {/* Add Custom Reward Button */}
      <button
        onClick={() => handleOpenForm()}
        className="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold flex items-center gap-2 text-sm"
      >
        <Sparkles size={18} />
        Add Custom Reward
      </button>

      {/* Empty State */}
      {allRewards.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl">
          <ShoppingBag size={40} className="mx-auto text-zinc-500 mb-4" />
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">No rewards available</h3>
          <p className="text-zinc-500 mt-2 mb-4">Add a custom reward to start!</p>

          <button
            onClick={() => handleOpenForm()}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold flex items-center gap-2 mx-auto"
          >
            <Sparkles size={18} />
            Add Reward
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {allRewards.map(r => renderRewardCard(r))}
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
