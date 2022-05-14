import {
  getDefaultSession,
  handleIncomingRedirect,
  Session,
} from '@inrupt/solid-client-authn-browser'
import React, { useEffect, useState } from 'react'
import { useNavigate, useRoutes } from 'react-router-dom'
import { RecoilRoot } from 'recoil'

import './App.scss'
import { CurrentUserAuthContext } from './context/CurrentUserAuthContext'
import { solidProfile, SolidProfileShape } from './generated/shex'
import { routesConfig } from './routing'

function App() {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [currentUser, setCurrentUser] = useState<SolidProfileShape | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (currentSession?.info.isLoggedIn) {
      const redirect = localStorage.getItem('redirect-before-access')
      if (redirect) {
        localStorage.removeItem('redirect-after-login')
        navigate(redirect, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }
  }, [currentSession?.info.isLoggedIn])

  useEffect(() => {
    setIsLoggingIn(true)
    handleIncomingRedirect({ restorePreviousSession: true }).then(
      async (sessionInfo) => {
        if (sessionInfo?.isLoggedIn) {
          const session = getDefaultSession()
          setCurrentSession(session)
          setIsLoggingIn(false)
          const user = await solidProfile.findOne({
            where: { id: sessionInfo.webId as string },
            doc: sessionInfo.webId as string,
          })
          if (user.data) {
            setCurrentUser(user.data)
            setIsLoggingIn(false)
          }
        } else if (sessionInfo) {
          setIsLoggingIn(false)
        }
      }
    )
  }, [])

  const routing = useRoutes(
    routesConfig(!!currentSession?.info.isLoggedIn, isLoggingIn)
  )

  return (
    <RecoilRoot>
    <CurrentUserAuthContext.Provider
      value={{
        session: currentSession as Session,
        user: currentUser as SolidProfileShape,
      }}
    >
      {routing}
    </CurrentUserAuthContext.Provider>
    </RecoilRoot>
  )
}

export default App
