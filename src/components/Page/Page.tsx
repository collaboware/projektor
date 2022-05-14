import React, { PropsWithChildren, useContext, useRef } from 'react'
import Helmet from 'react-helmet'
import { useLocation } from 'react-router'

import { CurrentUserAuthContext } from '../../context/CurrentUserAuthContext'
import { useScrollState } from '../../hooks/useScrollState'
import Header from '../Header/Header'
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay'

interface PageProps {
  title: string
  loading?: boolean
  loadingText?: string
}

const Page: React.FC<PropsWithChildren<PageProps>> = ({
  children,
  title,
  loading,
  loadingText,
}) => {
  const { session: currentSession } = useContext(CurrentUserAuthContext)
  const app = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useScrollState(location.pathname, app.current as HTMLDivElement, !loading)

  return (
    <div className="app" ref={app}>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {loading && loadingText && (
        <LoadingOverlay active={loading} description={loadingText} />
      )}
      {currentSession && <Header />}
      {children}
    </div>
  )
}

export default Page
