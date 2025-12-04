import { supabase } from './supabase';
import { Role } from '../types';

export const roleService = {
  // Get all roles
  async getAllRoles(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map(r => ({
      id: r.id,
      name: r.name,
      emoji: r.emoji,
      description: r.description,
      createdAt: r.created_at
    }));
  },

  // Create a new role
  async createRole(name: string, emoji: string, description?: string): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .insert({
        name,
        emoji,
        description: description || null
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      emoji: data.emoji,
      description: data.description,
      createdAt: data.created_at
    };
  },

  // Update a role
  async updateRole(roleId: string, updates: { name?: string; emoji?: string; description?: string }): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .update(updates)
      .eq('id', roleId)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      emoji: data.emoji,
      description: data.description,
      createdAt: data.created_at
    };
  },

  // Delete a role (cascades to user_roles)
  async deleteRole(roleId: string): Promise<void> {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId);

    if (error) throw error;
  }
};

