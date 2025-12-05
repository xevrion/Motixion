import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { feedbackService } from '../services/feedback';
import { FeedbackInput } from '../types';
import { supabase } from '../services/supabase';
import { MessageSquare, Bug, Sparkles, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export const Feedback: React.FC = () => {
  const { user } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FeedbackInput>({
    type: 'bug',
    title: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to submit feedback');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get user email from auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser?.email) {
        throw new Error('Unable to retrieve your email address');
      }

      await feedbackService.submitFeedback(formData, {
        username: user.username,
        email: authUser.email,
      });

      setSuccess(true);
      setFormData({
        type: 'bug',
        title: '',
        description: '',
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-rose-500' },
    { value: 'feature', label: 'Feature Request', icon: Sparkles, color: 'text-emerald-500' },
    { value: 'other', label: 'Other Feedback', icon: MessageSquare, color: 'text-blue-500' },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Feedback</h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1">
          Found a bug? Have a feature idea? We'd love to hear from you!
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 md:p-8">
        {success && (
          <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-800 dark:text-emerald-200 font-medium">Feedback submitted successfully!</p>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm mt-1">
                Thank you for your feedback. We'll review it and get back to you if needed.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-rose-700 dark:text-rose-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info (Read-only) */}
          {user && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">Submitting as:</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{user.username}</p>
            </div>
          )}

          {/* Feedback Type */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Type of Feedback <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {typeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.type === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: option.value as 'bug' | 'feature' | 'other' })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={isSelected ? 'text-emerald-500' : option.color} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        {option.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                setError(null);
              }}
              placeholder="Brief summary of your feedback"
              className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
              minLength={3}
              maxLength={100}
              disabled={loading}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                setError(null);
              }}
              placeholder="Please provide as much detail as possible. For bugs, include steps to reproduce. For features, explain the use case."
              rows={8}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              required
              minLength={10}
              maxLength={2000}
              disabled={loading}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {formData.description.length}/2000 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.description.trim()}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-h-[44px]"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

