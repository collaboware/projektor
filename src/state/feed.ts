import { atom } from 'recoil'

import { PostShape } from '../generated/shex'
import { localPersist } from '../persistState'

export interface FeedState {
  feed: { post: PostShape; user: string }[] | null
}

export const feedState = atom<FeedState>({
  key: 'feedState',
  effects: [localPersist<FeedState>()],
  default: {
    feed: null,
  },
})
