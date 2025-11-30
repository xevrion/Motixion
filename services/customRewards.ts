import { supabase } from './supabase';
import { CustomReward } from '../types';

export interface CustomRewardInput {
  name: string;
  cost: number;
  icon: string;
  category: 'food' | 'leisure' | 'upgrade' | 'misc';
}

export const customRewardService = {
  // Get all custom rewards for a user
  async getUserCustomRewards(userId: string): Promise<CustomReward[]> {
    const { data, error } = await supabase
      .from('custom_rewards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(reward => ({
      id: reward.id,
      userId: reward.user_id,
      name: reward.name,
      cost: reward.cost,
      icon: reward.icon,
      category: reward.category || 'misc',
      createdAt: reward.created_at,
      updatedAt: reward.updated_at || reward.created_at
    }));
  },

  // Create a new custom reward
  async createCustomReward(userId: string, rewardData: CustomRewardInput): Promise<CustomReward> {
    const { data, error } = await supabase
      .from('custom_rewards')
      .insert({
        user_id: userId,
        name: rewardData.name,
        cost: rewardData.cost,
        icon: rewardData.icon,
        category: rewardData.category || 'misc'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      cost: data.cost,
      icon: data.icon,
      category: data.category || 'misc',
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at
    };
  },

  // Update an existing custom reward
  async updateCustomReward(rewardId: string, updates: Partial<CustomRewardInput>): Promise<CustomReward> {
    const { data, error } = await supabase
      .from('custom_rewards')
      .update(updates)
      .eq('id', rewardId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      cost: data.cost,
      icon: data.icon,
      category: data.category || 'misc',
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at
    };
  },

  // Delete a custom reward
  async deleteCustomReward(rewardId: string): Promise<void> {
    const { error } = await supabase
      .from('custom_rewards')
      .delete()
      .eq('id', rewardId);

    if (error) throw error;
  }
};

