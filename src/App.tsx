import React, { useEffect, useState } from 'react'
import {
  getDefaultSession,
  handleIncomingRedirect,
  Session,
} from '@inrupt/solid-client-authn-browser'
import { useRoutes } from 'react-router-dom'

import { CurrentUserAuthContext } from './context/CurrentUserAuthContext'
import './App.scss'
import { SolidProfileShape, solidProfile } from './generated/shex'
import UploadButton from './components/UploadButton/UploadButton'
import { routesConfig } from './routing'

function App() {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [currentUser, setCurrentUser] = useState<SolidProfileShape | null>(null)

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
    <CurrentUserAuthContext.Provider
      value={{
        session: currentSession as Session,
        user: currentUser as SolidProfileShape,
      }}
    >
      {routing}
      <div className="app">
        {currentSession?.info.isLoggedIn && (
          <div className="footer">
            <UploadButton />
          </div>
        )}
      </div>
    </CurrentUserAuthContext.Provider>
  )
}

export default App
