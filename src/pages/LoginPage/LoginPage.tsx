import { login } from '@inrupt/solid-client-authn-browser'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

import { analyticsWindow } from '../../AnalyticsWindow'
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay'
import Page from '../../components/Page/Page'

import styles from './LoginPage.module.scss'

interface LoginPageProps {
  isAuthenticating?: boolean
}

const LoginPage: React.FC<LoginPageProps> = ({ isAuthenticating }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const location = useLocation()

  // set redirect url for auth process
  useEffect(() => {
    if ((location.state as { redirectTo: string })?.redirectTo) {
      localStorage.setItem(
        'redirect-before-access',
        (location.state as { redirectTo: string }).redirectTo ?? '/'
      )
    }
  }, [])

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
                login({
                  oidcIssuer: 'https://broker.pod.inrupt.com',
                  clientName: 'Projektor Web App',
                  clientId:
                    process.env.NODE_ENV === 'development'
                      ? 'http://localhost:3000/projektor.development.jsonld'
                      : 'https://projektor.technology/projektor.jsonld',
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
