import {
  getDefaultSession,
  handleIncomingRedirect,
  Session,
} from '@inrupt/solid-client-authn-browser'
import React, { useEffect, useState } from 'react'
import { useNavigate, useRoutes } from 'react-router-dom'
import { RecoilRoot, useRecoilState } from 'recoil'

import './App.scss'
import { CurrentUserAuthContext } from './context/CurrentUserAuthContext'
import { solidProfile, SolidProfileShape } from './generated/shex'
import { routesConfig } from './routing'
import { authState } from './state/auth'

function App() {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  // const [currentSession, setCurrentSession] = useState<Session | null>(null)
  // const [currentUser, setCurrentUser] = useState<SolidProfileShape | null>(null)
  const [auth, setAuth] = useRecoilState(authState)

  const { user, session } = auth

  const navigate = useNavigate()

  // useEffect(() => {
  //   if (currentSession?.info.isLoggedIn) {
  //     const redirect = localStorage.getItem('redirect-before-access')
  //     if (redirect) {
  //       localStorage.removeItem('redirect-after-login')
  //       navigate(redirect, { replace: true })
  //     } else {
  //       navigate('/', { replace: true })
  //     }
  //   }
  // }, [currentSession?.info.isLoggedIn])

  useEffect(() => {
    if (session?.info.isLoggedIn) {
      const redirect = localStorage.getItem('redirect-before-access')
      if (redirect) {
        localStorage.removeItem('redirect-after-login')
        navigate(redirect, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }
  }, [session?.info.isLoggedIn])

  useEffect(() => {
    setIsLoggingIn(true)
    handleIncomingRedirect({ restorePreviousSession: true })
      .then(async (sessionInfo) => {
        if (sessionInfo?.isLoggedIn) {
          const newSession = getDefaultSession()
          setAuth({ ...auth, session: newSession })
          const newUser = await solidProfile.findOne({
            where: { id: sessionInfo.webId as string },
            doc: sessionInfo.webId as string,
          })
          setIsLoggingIn(false)

          if (newUser.data) {
            setAuth({ user: newUser.data, session: newSession })
            setIsLoggingIn(false)
          } else {
            setAuth({ ...auth, session: newSession })
            setIsLoggingIn(false)
          }
        } else if (sessionInfo) {
          setIsLoggingIn(false)
        }
      })
      .catch(console.error)
  }, [])

  const routing = useRoutes(
    routesConfig(!!session?.info.isLoggedIn, isLoggingIn)
  )

  return (
    <CurrentUserAuthContext.Provider
      value={{
        session: session as Session,
        user: user as SolidProfileShape,
      }}
    >
      {routing}
    </CurrentUserAuthContext.Provider>
  )
}

// RecoilRoot must be a parent in order to useRecoilState --> needed for auth
export default () => {
  return (
    <RecoilRoot>
      <App />
    </RecoilRoot>
  )
}
