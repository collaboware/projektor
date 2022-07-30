import { getProfileAll, universalAccess } from '@inrupt/solid-client'
import {
  getDefaultSession,
  handleIncomingRedirect,
  Session,
} from '@inrupt/solid-client-authn-browser'
import { Namespace } from 'rdflib'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useRoutes } from 'react-router-dom'
import { RecoilRoot, useRecoilState } from 'recoil'

import './App.scss'
import { CurrentUserAuthContext } from './context/CurrentUserAuthContext'
import { solidProfile, SolidProfileShape } from './generated/shex'
import { routesConfig } from './routing'
import { authState } from './state/auth'

export const PIM = Namespace('http://www.w3.org/ns/pim/space#')
export const RDFS = Namespace('http://www.w3.org/2000/01/rdf-schema#')

export const getProfileAndStorageUrl = async (webId: string) => {
  const profiles = await getProfileAll(webId as string)
  const webIdSubject = profiles.webIdProfile.graphs.default[webId as string]
  const extendedProfile =
    webIdSubject.predicates[RDFS('seeAlso').value]?.namedNodes
  const storageUrl = webIdSubject.predicates[PIM('storage').value]?.namedNodes
  return [
    (extendedProfile && extendedProfile[0]) || webId,
    storageUrl ? storageUrl[0] : null,
  ]
}

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
    if (!location.pathname.startsWith('/login')) {
      const urlParams = new URLSearchParams(location.search)
      urlParams.delete('posts')
      localStorage.setItem(
        'redirect-before-access',
        location.pathname + `?${urlParams.toString()}` + location.hash
      )
    }
    const newSession = getDefaultSession()
    if (newSession.eventNames().includes('sessionExpired')) {
      handleIncomingRedirect({ restorePreviousSession: true })
        .then(async (sessionInfo) => {
          if (
            sessionInfo?.isLoggedIn &&
            sessionInfo.webId &&
            newSession.fetch
          ) {
            const [extendedProfile, storageUrl] = await getProfileAndStorageUrl(
              sessionInfo.webId
            )
            solidProfile.fetcher._fetch = newSession.fetch
            const { data } = await solidProfile.findOne({
              where: { id: sessionInfo.webId as string },
              doc: extendedProfile || (sessionInfo.webId as string),
            })
            if (data) {
              setAuth({
                user: data,
                session: newSession,
                storage: storageUrl ?? (data.storage as string),
              })
              setIsLoggingIn(false)
            } else {
              setAuth({ ...auth, session: newSession })
              setIsLoggingIn(false)
            }
          } else {
            setIsLoggingIn(false)
          }
        })
        .catch((e) => {
          console.error(e)
          setIsLoggingIn(false)
        })
    }
  }, [])

  // Fixing public folder for ESS 2.2
  useEffect(() => {
    if (auth.storage && auth.session) {
      universalAccess
        .getPublicAccess(auth.storage + 'public', {
          fetch: auth.session.fetch as (
            input: RequestInfo | URL,
            init?: RequestInit | undefined
          ) => Promise<Response>,
        })
        .then((access) => {
          if (!access?.read) {
            universalAccess.setPublicAccess(
              auth.storage + 'public',
              {
                read: true,
              },
              {
                fetch: auth.session?.fetch as (
                  input: RequestInfo | URL,
                  init?: RequestInit | undefined
                ) => Promise<Response>,
              }
            )
          }
        })
    }
  }, [auth.storage])

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
