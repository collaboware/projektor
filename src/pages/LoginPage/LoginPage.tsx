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

  useEffect(() => {
    if ((location.state as { redirectTo: string })?.redirectTo) {
      localStorage.setItem(
        'redirect-before-access',
        (location.state as { redirectTo: string }).redirectTo ?? '/'
      )
    }
  }, [])

  return (
    <Page title="Projektor Web App" hideHeader>
      {isLoggingIn || isAuthenticating ? (
        <LoadingOverlay active={true} description="Authenticating..." />
      ) : (
        <div className={styles.main}>
          <h1>Projektor</h1>
          <p>
            This is a prototype, developed to share photos to a decentralized
            network. The prototype protects the privacy of publishers by giving
            them full control over the data infrastructure behind their account.
            Use at your own risk and enjoy.
          </p>
          {location.hash !== '#advanced' && (
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
                        ? undefined
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
          )}
          {location.hash !== '#advanced' && (
            <a href="#advanced">Advanced Login</a>
          )}
          {location.hash === '#advanced' && (
            <div className={styles.advanced}>
              <form
                title="Login with custom idp"
                onSubmit={(e) => {
                  e.preventDefault()
                  const idp = (
                    [...(e.target as HTMLFormElement).children].find(
                      (element) => (element as HTMLInputElement).name === 'idp'
                    ) as HTMLInputElement
                  ).value
                  if (confirm(`Do you really want to login to ${idp}?`)) {
                    setIsLoggingIn(true)
                    login({
                      oidcIssuer: !idp.startsWith('https://')
                        ? `https://${idp}`
                        : idp,
                      clientName: 'Projektor Web App',
                      clientId:
                        process.env.NODE_ENV === 'development'
                          ? undefined
                          : 'https://projektor.technology/projektor.jsonld',
                    })
                  }
                }}
              >
                <input name="idp" placeholder="Custom identity provider url" />
                <button type="submit">Login</button>
              </form>
            </div>
          )}
          {location.hash === '#advanced' && <a href="#">Inrupt Login</a>}
        </div>
      )}
    </Page>
  )
}

export default LoginPage
