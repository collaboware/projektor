import { atom } from 'recoil'

import { SolidProfileShape } from '../generated/shex'

export interface UserState {
  hasFollowingList?: boolean
  profile: SolidProfileShape | null
}

export const userState = atom<UserState>({
  key: 'userState',

  default: {
    hasFollowingList: false,
    profile: null,
  },
})
