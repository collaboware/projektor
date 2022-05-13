import { atom } from "recoil";
import { PostShape } from "../generated/shex";

export interface PostState {current:PostShape | null}

export const postState = atom<PostState>({
    key: 'postState', 
    default: {
        current: null,
    }, 
  });
