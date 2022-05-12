import React from 'react'
import { Session } from '@inrupt/solid-client-authn-browser'

import { SolidProfileShape } from '../generated/shex'

export const CurrentUserAuthContext: React.Context<{
  session?: Session
  user?: SolidProfileShape
}> = React.createContext({})
