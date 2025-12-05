import { supabase } from './supabase';

export interface ProfileUpdateInput {
  username?: string;
  avatarUrl?: string;
}

export const profileService = {
  /**
   * Upload a cropped avatar image to Supabase Storage
   */
  async uploadAvatar(userId: string, file: Blob | File): Promise<string> {
    const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Delete old avatar if it exists
    try {
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId);
      
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }
    } catch (error) {
      // Ignore errors when deleting old files
      console.warn('Could not delete old avatar:', error);
    }

    // Upload the new avatar
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  /**
   * Check if a username is available
   */
  async isUsernameAvailable(username: string, currentUserId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', currentUserId)
      .single();

    if (error && error.code === 'PGRST116') {
      return true; // No user found with this username
    }

    if (error) {
      throw error;
    }

    return false; // Username is taken
  },

  /**
   * Update user profile (username and/or avatar)
   */
  async updateProfile(userId: string, updates: ProfileUpdateInput): Promise<void> {
    // Validate username if provided
    if (updates.username) {
      const trimmedUsername = updates.username.trim();
      
      if (trimmedUsername.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }
      
      if (trimmedUsername.length > 30) {
        throw new Error('Username must be less than 30 characters');
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
        throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
      }

      const isAvailable = await this.isUsernameAvailable(trimmedUsername, userId);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }
    }

    // Build update object
    const updateData: { username?: string; avatar_url?: string } = {};
    
    if (updates.username) {
      updateData.username = updates.username.trim();
    }
    
    if (updates.avatarUrl) {
      updateData.avatar_url = updates.avatarUrl;
    }

    // Update the user profile
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }
};

