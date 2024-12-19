import { create } from 'zustand';
import type { UserInfo } from './tauri-types';

interface BearState {
  user: UserInfo;
  setUserInfo: (user: UserInfo) => void;
}

export const useStore = create<BearState>()((set) => ({
  user: 'None',
  setUserInfo: (user) => set({ user }),
}));
