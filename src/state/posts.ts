import { atom } from "recoil";

import { PostShape } from "../generated/shex";

export interface PostsState {posts: PostShape[]}

export const postsState = atom<PostsState>({
    key: 'postsState', 
    default: {
        posts: [],
    }, 
  });
