import { create } from 'zustand';
import type { User } from '@/types';
import { get, patch } from '@/lib/api';

/**
 * 用户信息状态 Store
 *
 * 管理当前用户信息和加载状态。
 * MVP 阶段为单用户模式（id=1），提供查询和更新功能。
 */

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  error: null,

  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const user = await get<User>('/api/user');
      set({ user, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  updateUser: async (data: Partial<User>) => {
    set({ loading: true, error: null });
    try {
      const updated = await patch<User>('/api/user', data);
      set({ user: updated, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },
}));
