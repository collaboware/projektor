import React, { PropsWithChildren, useContext, useEffect, useRef } from 'react'
import Helmet from 'react-helmet'
import { useLocation } from 'react-router'

import { CurrentUserAuthContext } from '../../context/CurrentUserAuthContext'
import Header from '../Header/Header'
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay'

interface PageProps {
  title: string
  loading?: boolean
  loadingText?: string
  hideSearch?: boolean
}

const Page: React.FC<PropsWithChildren<PageProps>> = ({
  children,
  title,
  loading,
  loadingText,
  hideSearch,
}) => {
  const { session: currentSession } = useContext(CurrentUserAuthContext)
  const app = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash)
      if (element) element.scrollIntoView()
    }
  }, [location.hash])

  // useScrollState(location.pathname, app.current as HTMLDivElement, !loading)

  return (
    <div className="app" ref={app}>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {(loading || !app.current) && loadingText && (
        <LoadingOverlay active={loading} description={loadingText} />
      )}
      {currentSession && <Header hideSearch={hideSearch} />}
      {children}
    </div>
  )
}

export default Page
