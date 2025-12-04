import { supabase } from './supabase';
import { Role, UserRole } from '../types';

export interface UserWithRoles {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  roles: Role[];
}

export const userRoleService = {
  // Get all roles for a user
  async getUserRoles(userId: string): Promise<Role[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles (
          id,
          name,
          emoji,
          description,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('assigned_at', { ascending: true });

    if (error) throw error;
    return data.map((ur: any) => ({
      id: ur.roles.id,
      name: ur.roles.name,
      emoji: ur.roles.emoji,
      description: ur.roles.description,
      createdAt: ur.roles.created_at
    }));
  },

  // Get the first assigned role (top role) for a user
  async getUserTopRole(userId: string): Promise<Role | null> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles (
          id,
          name,
          emoji,
          description,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('assigned_at', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }

    if (!data || !data.roles) return null;

    return {
      id: data.roles.id,
      name: data.roles.name,
      emoji: data.roles.emoji,
      description: data.roles.description,
      createdAt: data.roles.created_at
    };
  },

  // Assign multiple roles to a user
  async assignRolesToUser(userId: string, roleIds: string[]): Promise<void> {
    // First, get existing role assignments
    const { data: existing } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId);

    const existingRoleIds = existing?.map(ur => ur.role_id) || [];
    
    // Find roles to add (not already assigned)
    const rolesToAdd = roleIds.filter(roleId => !existingRoleIds.includes(roleId));
    
    // Find roles to remove (assigned but not in new list)
    const rolesToRemove = existingRoleIds.filter(roleId => !roleIds.includes(roleId));

    // Add new role assignments
    if (rolesToAdd.length > 0) {
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert(rolesToAdd.map(roleId => ({
          user_id: userId,
          role_id: roleId
        })));

      if (insertError) throw insertError;
    }

    // Remove unassigned roles
    if (rolesToRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .in('role_id', rolesToRemove);

      if (deleteError) throw deleteError;
    }
  },

  // Remove a single role from a user
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (error) throw error;
  },

  // Get all users with their roles (for admin)
  async getAllUsersWithRoles(): Promise<UserWithRoles[]> {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, email, avatar_url')
      .order('username', { ascending: true });

    if (usersError) throw usersError;

    // Get all user role assignments
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role_id,
        roles (
          id,
          name,
          emoji,
          description,
          created_at
        )
      `);

    if (userRolesError) throw userRolesError;

    // Group roles by user
    const rolesByUser = new Map<string, Role[]>();
    userRoles?.forEach((ur: any) => {
      if (!ur.roles) return;
      const userId = ur.user_id;
      if (!rolesByUser.has(userId)) {
        rolesByUser.set(userId, []);
      }
      rolesByUser.get(userId)!.push({
        id: ur.roles.id,
        name: ur.roles.name,
        emoji: ur.roles.emoji,
        description: ur.roles.description,
        createdAt: ur.roles.created_at
      });
    });

    // Combine users with their roles
    return users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      roles: rolesByUser.get(user.id) || []
    }));
  }
};

