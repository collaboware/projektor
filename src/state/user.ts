import { atom } from "recoil";

export interface UserState {hasFollowingList: boolean}

export const userState = atom<UserState>({
    key: 'userState',
    default: {
        hasFollowingList: false,
    }, 
  });