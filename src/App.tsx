import React, { useCallback, useEffect, useState } from 'react'
import {
  getDefaultSession,
  handleIncomingRedirect,
  login,
  Session,
} from '@inrupt/solid-client-authn-browser'

import { CurrentUserAuthContext } from './context/CurrentUserAuthContext'
import './App.scss'
import {
  SolidProfileShape,
  PostShape,
  solidProfile,
  post,
  postIndex,
} from './generated/shex'
import UploadButton from './components/UploadButton/UploadButton'
import LoadingOverlay from './components/LoadingOverlay/LoadingOverlay'
import PostGrid from './components/PostGrid/PostGrid'
import { analyticsWindow } from './AnalyticsWindow'
import Header from './components/Header/Header'

function App() {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [posts, setPosts] = useState<PostShape[]>([])
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

  const fetchPosts = useCallback(() => {
    if (currentSession?.info.isLoggedIn) {
      const publicTypeIndexUrl = currentSession?.info.webId?.replace(
        'profile/card#me',
        `settings/publicTypeIndex.ttl`
      )
      postIndex
        .findAll({ doc: publicTypeIndexUrl as string })
        .then(async (posts) => {
          const fullPosts = (await Promise.all(
            posts.data?.map(async (postIndex) => {
              return (
                await post.findOne({
                  where: { id: postIndex.link },
                  doc: postIndex.link,
                })
              ).data
            }) ?? []
          )) as PostShape[]
          setPosts(fullPosts)
        })
    }
  }, [currentSession])

  useEffect(() => {
    fetchPosts()
  }, [currentSession])

  return (
    <CurrentUserAuthContext.Provider
      value={{
        session: currentSession as Session,
        user: currentUser as SolidProfileShape,
      }}
    >
      <div className="app">
        {currentSession ? (
          <Header user={currentUser} />
        ) : (
          <div className="main">
            {isLoggingIn ? (
              <LoadingOverlay active={true} description="Authenticating..." />
            ) : (
              <>
                <h1>Projektor</h1>
                <div className="login-buttons">
                  <button
                    className="login-button"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsLoggingIn(true)
                      analyticsWindow.fathom?.trackGoal('GYLKIUUP', 0)
                      login({
                        oidcIssuer: 'https://broker.pod.inrupt.com',
                        clientName: 'Projektor Web App',
                      })
                    }}
                  >
                    Login with Inrupt Pod
                  </button>
                  <button
                    className="register-button"
                    onClick={(e) => {
                      e.preventDefault()
                      analyticsWindow.fathom?.trackGoal('RMPXPBWB', 0)
                      window.open('https://signup.pod.inrupt.com', '_blank')
                    }}
                  >
                    Register
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {currentSession?.info.isLoggedIn && <PostGrid posts={posts} />}
        {currentSession?.info.isLoggedIn && (
          <div className="footer">
            <UploadButton onUpload={fetchPosts} />
          </div>
        )}
      </div>
    </CurrentUserAuthContext.Provider>
  )
}

export default App
