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
    // Check authentication
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser || authUser.id !== userId) {
      throw new Error('You must be authenticated to upload an avatar');
    }

    // Convert Blob to File with proper MIME type if needed
    let fileToUpload: File;
    if (file instanceof File) {
      fileToUpload = file;
    } else {
      // Create a File from Blob with proper MIME type
      fileToUpload = new File([file], `avatar-${Date.now()}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
    }

    // Validate file size (5MB limit)
    if (fileToUpload.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(fileToUpload.type)) {
      throw new Error('Invalid image type. Please use JPEG, PNG, GIF, or WebP');
    }

    const fileName = `${userId}-${Date.now()}.jpg`;
    const filePath = `${userId}/${fileName}`;

    // Delete old avatar if it exists
    try {
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('avatars')
        .list(userId);
      
      if (listError) {
        // If bucket doesn't exist or access denied, log but continue
        if (listError.message.includes('not found') || listError.message.includes('permission')) {
          throw new Error('Storage bucket not configured. Please run supabase-storage-setup.sql in your Supabase SQL Editor.');
        }
        console.warn('Could not list existing avatars:', listError);
      } else if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove(filesToDelete);
        
        if (deleteError) {
          console.warn('Could not delete old avatar:', deleteError);
        }
      }
    } catch (error: any) {
      // If it's our custom error, re-throw it
      if (error.message?.includes('Storage bucket not configured')) {
        throw error;
      }
      // Otherwise, just log and continue
      console.warn('Error cleaning up old avatar:', error);
    }

    // Upload the new avatar with explicit content type
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false,
        contentType: fileToUpload.type || 'image/jpeg',
      });

    if (error) {
      console.error('Avatar upload error:', error);
      
      // Provide more helpful error messages
      if (error.message.includes('not found') || error.message.includes('bucket')) {
        throw new Error('Storage bucket not configured. Please run supabase-storage-setup.sql in your Supabase SQL Editor.');
      } else if (error.message.includes('permission') || error.message.includes('policy')) {
        throw new Error('Permission denied. Please check your storage policies in Supabase.');
      } else if (error.message.includes('size')) {
        throw new Error('File size exceeds the 5MB limit.');
      } else {
        throw new Error(`Failed to upload avatar: ${error.message}`);
      }
    }

    if (!data) {
      throw new Error('Upload succeeded but no data returned');
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded avatar');
    }

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

