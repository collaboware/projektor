import { atom } from 'recoil'

import { FollowingShape } from '../generated/shex'
import { localPersist } from '../persistState'

export const followingState = atom<FollowingShape | null>({
  key: 'followingState',
  effects: [localPersist<FollowingShape | null>()],
  default: null,
})
