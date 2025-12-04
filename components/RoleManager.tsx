import React, { useState, useEffect } from 'react';
import { roleService } from '../services/roles';
import { userRoleService, UserWithRoles } from '../services/userRoles';
import { Role } from '../types';
import { Plus, Edit2, Trash2, Search, X, Save } from 'lucide-react';
import { Avatar } from './Avatar';

export const RoleManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create/Edit role state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({ name: '', emoji: '', description: '' });

  // User role assignment state
  const [userRoleSelections, setUserRoleSelections] = useState<Map<string, string[]>>(new Map());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, usersData] = await Promise.all([
        roleService.getAllRoles(),
        userRoleService.getAllUsersWithRoles()
      ]);
      setRoles(rolesData);
      setUsers(usersData);
      
      // Initialize role selections for each user
      const selections = new Map<string, string[]>();
      usersData.forEach(user => {
        selections.set(user.id, user.roles.map(r => r.id));
      });
      setUserRoleSelections(selections);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!roleForm.name || !roleForm.emoji) {
      alert('Name and emoji are required');
      return;
    }

    try {
      await roleService.createRole(roleForm.name, roleForm.emoji, roleForm.description || undefined);
      setRoleForm({ name: '', emoji: '', description: '' });
      setShowCreateForm(false);
      await loadData();
    } catch (error: any) {
      console.error('Error creating role:', error);
      alert(error.message || 'Failed to create role');
    }
  };

  const handleEditRole = async () => {
    if (!editingRole || !roleForm.name || !roleForm.emoji) {
      alert('Name and emoji are required');
      return;
    }

    try {
      await roleService.updateRole(editingRole.id, {
        name: roleForm.name,
        emoji: roleForm.emoji,
        description: roleForm.description || undefined
      });
      setEditingRole(null);
      setRoleForm({ name: '', emoji: '', description: '' });
      await loadData();
    } catch (error: any) {
      console.error('Error updating role:', error);
      alert(error.message || 'Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? This will remove it from all users.')) {
      return;
    }

    try {
      await roleService.deleteRole(roleId);
      await loadData();
    } catch (error: any) {
      console.error('Error deleting role:', error);
      alert(error.message || 'Failed to delete role');
    }
  };

  const handleSaveAllUserRoles = async () => {
    try {
      // Save all user role changes
      await Promise.all(
        Array.from(userRoleSelections.entries()).map(([userId, roleIds]) =>
          userRoleService.assignRolesToUser(userId, roleIds)
        )
      );
      await loadData();
      alert('All role assignments saved successfully!');
    } catch (error: any) {
      console.error('Error updating user roles:', error);
      alert(error.message || 'Failed to update user roles');
    }
  };

  const hasUnsavedChanges = () => {
    // Check if any user's role selections differ from their current roles
    return users.some(user => {
      const currentRoleIds = user.roles.map(r => r.id).sort().join(',');
      const selectedRoleIds = (userRoleSelections.get(user.id) || []).sort().join(',');
      return currentRoleIds !== selectedRoleIds;
    });
  };

  const toggleUserRole = (userId: string, roleId: string) => {
    const current = userRoleSelections.get(userId) || [];
    const updated = current.includes(roleId)
      ? current.filter(id => id !== roleId)
      : [...current, roleId];
    setUserRoleSelections(new Map(userRoleSelections.set(userId, updated)));
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading role manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Role Manager</h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1">
          Manage roles and assign them to users.
        </p>
      </div>

      {/* Roles Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Roles</h3>
          <button
            onClick={() => {
              setShowCreateForm(true);
              setEditingRole(null);
              setRoleForm({ name: '', emoji: '', description: '' });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 transition-colors"
          >
            <Plus size={18} />
            Create Role
          </button>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingRole) && (
          <div className="mb-6 p-4 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-300 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-zinc-900 dark:text-white">
                {editingRole ? 'Edit Role' : 'Create Role'}
              </h4>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingRole(null);
                  setRoleForm({ name: '', emoji: '', description: '' });
                }}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-white"
                  placeholder="e.g., Early Supporter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Emoji
                </label>
                <input
                  type="text"
                  value={roleForm.emoji}
                  onChange={(e) => setRoleForm({ ...roleForm, emoji: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-white"
                  placeholder="e.g., ⭐"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-white"
                  placeholder="Role description..."
                  rows={2}
                />
              </div>
              <button
                onClick={editingRole ? handleEditRole : handleCreateRole}
                className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors font-medium"
              >
                {editingRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </div>
        )}

        {/* Roles List */}
        <div className="space-y-2">
          {roles.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400 text-center py-4">No roles created yet.</p>
          ) : (
            roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-300 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{role.emoji}</span>
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-white">{role.name}</div>
                    {role.description && (
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">{role.description}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingRole(role);
                      setShowCreateForm(false);
                      setRoleForm({
                        name: role.name,
                        emoji: role.emoji,
                        description: role.description || ''
                      });
                    }}
                    className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Assignment Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Assign Roles to Users</h3>
          <button
            onClick={handleSaveAllUserRoles}
            disabled={!hasUnsavedChanges()}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              hasUnsavedChanges()
                ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Save size={18} />
            Save All Changes
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by username or email..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400 text-center py-4">No users found.</p>
          ) : (
            filteredUsers.map((user) => {
              const selectedRoleIds = userRoleSelections.get(user.id) || [];
              return (
                <div
                  key={user.id}
                  className="p-4 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-300 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar
                      avatarUrl={user.avatar_url || ''}
                      username={user.username}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-zinc-900 dark:text-white">{user.username}</div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</div>
                    </div>
                    {(() => {
                      const currentRoleIds = user.roles.map(r => r.id).sort().join(',');
                      const selectedRoleIds = (userRoleSelections.get(user.id) || []).sort().join(',');
                      const hasChanges = currentRoleIds !== selectedRoleIds;
                      return hasChanges && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          Unsaved changes
                        </span>
                      );
                    })()}
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Select Roles:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {roles.map((role) => {
                        const isSelected = selectedRoleIds.includes(role.id);
                        return (
                          <button
                            key={role.id}
                            onClick={() => toggleUserRole(user.id, role.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                              isSelected
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500'
                            }`}
                          >
                            <span>{role.emoji}</span>
                            <span className="text-sm font-medium">{role.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedRoleIds.length === 0 && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">No roles selected</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

