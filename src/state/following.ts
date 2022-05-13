import { Session } from "@inrupt/solid-client-authn-browser";
import { atom } from "recoil";
import { SolidProfileShape } from "../generated/shex";

export interface FollowingState {following: SolidProfileShape[] | []}

export const followingState = atom<FollowingState>({
    key: 'followingState', 
    default: {
        following: []
    }, 
  });