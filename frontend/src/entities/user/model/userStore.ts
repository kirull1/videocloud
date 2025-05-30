import { makeAutoObservable, runInAction } from 'mobx';
import { userApi } from '../api/userApi';
import type { User } from './types';

class UserStore {
  users: Record<string, User> = {};
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchUserById(userId: string): Promise<User | null> {
    // If we already have this user, return it
    if (this.users[userId]) {
      return this.users[userId];
    }

    this.isLoading = true;
    this.error = null;

    try {
      const user = await userApi.getUserById(userId);
      
      runInAction(() => {
        this.users[userId] = user;
      });
      
      return user;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch user';
      });
      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  getUserAvatarUrl(userId: string): string {
    // Return the direct URL to the avatar endpoint
    return `${import.meta.env.VITE_API_URL || '/api'}/users/${userId}/avatar`;
  }

  clearError(): void {
    this.error = null;
  }
}

export const userStore = new UserStore(); 