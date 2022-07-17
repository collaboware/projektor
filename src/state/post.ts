import { atom } from 'recoil'

import { PostShape } from '../generated/shex'

export interface PostState {
  post: PostShape | null
  raw?: string
}

export const postState = atom<PostState>({
  key: 'postState',
  default: {
    post: null,
  },
})
