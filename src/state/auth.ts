import { Session } from '@inrupt/solid-client-authn-browser'
import { atom } from 'recoil'

import { SolidProfileShape } from '../generated/shex'

export interface AuthState {
  session: Session | null
  user: SolidProfileShape | null
}

export const authState = atom<AuthState>({
  dangerouslyAllowMutability: true,
  key: 'authState',
  default: {
    user: null,
    session: null,
  },
})
