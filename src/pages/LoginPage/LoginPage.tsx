import { login } from '@inrupt/solid-client-authn-browser'
import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { analyticsWindow } from '../../AnalyticsWindow'
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay'
import Page from '../../components/Page/Page'
import { CurrentUserAuthContext } from '../../context/CurrentUserAuthContext'

import styles from './LoginPage.module.scss'

interface LoginPageProps {
  isAuthenticating?: boolean
}

const LoginPage: React.FC<LoginPageProps> = ({ isAuthenticating }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { session: currentSession } = useContext(CurrentUserAuthContext)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentSession?.info.isLoggedIn) {
      const redirect = localStorage.getItem('redirect-after-login')
      if (redirect) {
        navigate(redirect)
      } else {
        navigate('/')
      }
    }
  }, [currentSession])

  return (
    <Page title="Projektor Web App">
      {isLoggingIn || isAuthenticating ? (
        <LoadingOverlay active={true} description="Authenticating..." />
      ) : (
        <div className={styles.main}>
          <h1>Projektor</h1>
          <div className={styles.loginButtons}>
            <button
              className="login-button"
              onClick={(e) => {
                e.preventDefault()
                setIsLoggingIn(true)
                analyticsWindow.fathom?.trackGoal('GYLKIUUP', 0)
                localStorage.setItem(
                  'redirect-after-login',
                  (location.state as { redirectTo: string })?.redirectTo ?? '/'
                )
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
        </div>
      )}
    </Page>
  )
}

export default LoginPage
