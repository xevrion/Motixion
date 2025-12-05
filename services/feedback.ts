import { supabase } from './supabase';
import { FeedbackInput } from '../types';

export const feedbackService = {
  /**
   * Submit feedback via Supabase Edge Function
   */
  async submitFeedback(feedbackData: FeedbackInput, userInfo: { username: string; email: string }): Promise<void> {
    // Validate input
    if (!feedbackData.type || !feedbackData.title || !feedbackData.description) {
      throw new Error('All fields are required');
    }

    if (feedbackData.title.length < 3 || feedbackData.title.length > 100) {
      throw new Error('Title must be between 3 and 100 characters');
    }

    if (feedbackData.description.length < 10 || feedbackData.description.length > 2000) {
      throw new Error('Description must be between 10 and 2000 characters');
    }

    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('You must be logged in to submit feedback');
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-feedback', {
      body: {
        type: feedbackData.type,
        title: feedbackData.title.trim(),
        description: feedbackData.description.trim(),
        username: userInfo.username,
        userEmail: userInfo.email,
      },
    });

    if (error) {
      console.error('Feedback submission error:', error);
      throw new Error(error.message || 'Failed to submit feedback. Please try again.');
    }

    if (!data || !data.success) {
      throw new Error(data?.error || 'Failed to submit feedback. Please try again.');
    }
  },
};

