import React, { useState, useEffect } from "react";
import { CustomReward } from "../types";
import { CustomRewardInput } from "../services/customRewards";
import { X, Save, Loader2 } from "lucide-react";

interface CustomRewardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rewardData: CustomRewardInput) => Promise<void>;
  editingReward?: CustomReward | null;
}

const CATEGORIES: Array<"food" | "leisure" | "upgrade" | "misc"> = [
  "food",
  "leisure",
  "upgrade",
  "misc",
];
const EMOJI_SUGGESTIONS = [
  "🍕",
  "🍔",
  "🍟",
  "🌮",
  "🍱",
  "🍣",
  "🍰",
  "🍪",
  "🍦",
  "🥤",
  "🍺",
  "🍷",
  "🎮",
  "🎯",
  "🎲",
  "🎪",
  "🎨",
  "🎭",
  "🎸",
  "🎵",
  "📺",
  "💻",
  "⌨️",
  "🖱️",
  "🎧",
  "📱",
  "⌚",
  "📷",
  "🏖️",
  "🌴",
  "💆",
  "🧘",
  "🛀",
  "👕",
  "👟",
  "🎁",
  "🛍️",
  "💎",
  "🏋️",
  "⚽",
  "🏀",
  "🎾",
  "🏊",
  "🚴",
];

export const CustomRewardForm: React.FC<CustomRewardFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingReward,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<CustomRewardInput>({
    name: "",
    cost: 50,
    icon: "🎁",
    category: "misc",
  });

  useEffect(() => {
    if (editingReward) {
      setFormData({
        name: editingReward.name,
        cost: editingReward.cost,
        icon: editingReward.icon,
        category: editingReward.category,
      });
    } else {
      setFormData({
        name: "",
        cost: 50,
        icon: "🎁",
        category: "misc",
      });
    }
    setError("");
  }, [editingReward, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save custom reward");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md my-auto animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-zinc-200 dark:border-zinc-300 dark:border-zinc-800">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-900 dark:text-white">
            {editingReward ? "Edit Custom Reward" : "Add Custom Reward"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-900 dark:text-white active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6 overflow-y-auto flex-1"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm p-2 sm:p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Reward Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm sm:text-base"
              placeholder="e.g., Gaming Session"
              maxLength={50}
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Icon (Emoji)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                required
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg sm:rounded-xl p-2 sm:p-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xl sm:text-2xl text-center"
                placeholder="🎁"
                maxLength={2}
              />
              <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg sm:rounded-xl p-2 sm:p-3 text-xl sm:text-2xl flex items-center justify-center min-w-[48px] sm:min-w-[56px]">
                {formData.icon || "🎁"}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-24 sm:max-h-32 overflow-y-auto p-2 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-300 dark:border-zinc-800">
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: emoji })}
                  className={`text-lg sm:text-xl md:text-2xl p-1.5 sm:p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors active:scale-95 ${
                    formData.icon === emoji
                      ? "bg-emerald-500/20 ring-1 sm:ring-2 ring-emerald-500/50"
                      : ""
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Cost */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Cost (Points)
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.cost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cost: parseInt(e.target.value) || 0,
                })
              }
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm sm:text-base"
              placeholder="50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as any })
              }
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm sm:text-base"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg sm:rounded-xl font-bold transition-colors text-sm sm:text-base active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim() || formData.cost < 1}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 
             bg-emerald-500 hover:bg-emerald-600 
             disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed 
             text-white 
             rounded-lg sm:rounded-xl font-bold 
             transition-colors flex items-center justify-center gap-2 
             text-sm sm:text-base active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="sm:w-[18px] sm:h-[18px] animate-spin"
                  />
                  <span className="hidden sm:inline">Saving...</span>
                  <span className="sm:hidden">Save...</span>
                </>
              ) : (
                <>
                  <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
                  {editingReward ? "Update" : "Create"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
