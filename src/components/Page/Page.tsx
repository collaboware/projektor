import React, { PropsWithChildren, useContext } from 'react'
import Helmet from 'react-helmet'

import { CurrentUserAuthContext } from '../../context/CurrentUserAuthContext'
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
  return (
    <div className="app">
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
