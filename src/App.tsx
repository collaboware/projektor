import {
  getDefaultSession,
  handleIncomingRedirect,
  Session,
} from '@inrupt/solid-client-authn-browser'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useRoutes } from 'react-router-dom'
import { RecoilRoot, useRecoilState } from 'recoil'

import './App.scss'
import { CurrentUserAuthContext } from './context/CurrentUserAuthContext'
import { solidProfile, SolidProfileShape } from './generated/shex'
import { routesConfig } from './routing'
import { authState } from './state/auth'

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const [auth, setAuth] = useRecoilState(authState)
  const [isLoggingIn, setIsLoggingIn] = useState(
    Boolean(new URLSearchParams(location.search).get('code_challenge'))
  )

  const { user, session } = auth

  useEffect(() => {
    if (session?.fetch) {
      const redirect = localStorage.getItem('redirect-before-access')
      if (redirect) {
        localStorage.removeItem('redirect-before-access')
        navigate(redirect, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }
  }, [session?.fetch])

  useEffect(() => {
    if (location.pathname === '/')
      localStorage.setItem(
        'last-feed-page',
        location.pathname +
          location.search.substring(0, location.search.indexOf('&posts'))
      )
  }, [location.pathname])

  useEffect(() => {
    if (!location.pathname.startsWith('/login')) {
      const urlParams = new URLSearchParams(location.search)
      urlParams.delete('posts')
      localStorage.setItem(
        'redirect-before-access',
        location.pathname + `?${urlParams.toString()}` + location.hash
      )
    }
    handleIncomingRedirect({ restorePreviousSession: true })
      .then(async (sessionInfo) => {
        if (sessionInfo?.isLoggedIn) {
          const newSession = getDefaultSession()
          const newUser = await solidProfile.findOne({
            where: { id: sessionInfo.webId as string },
            doc: sessionInfo.webId as string,
          })
          if (newUser.data) {
            setAuth({ user: newUser.data, session: newSession })
            setIsLoggingIn(false)
          } else {
            setAuth({ ...auth, session: newSession })
            setIsLoggingIn(false)
          }
        } else {
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
