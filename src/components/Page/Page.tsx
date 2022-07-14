import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useRef,
} from 'react'
import Helmet from 'react-helmet'
import { useLocation } from 'react-router'

import Header from '../Header/Header'
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay'

interface PageProps {
  title: string
  loading?: boolean
  loadingText?: string
  hideSearch?: boolean
  hideHeader?: boolean
}

interface PageContext {
  app?: React.RefObject<HTMLDivElement>
}

export const pageContext = createContext<PageContext>({})

const Page: React.FC<PropsWithChildren<PageProps>> = ({
  children,
  title,
  loading,
  loadingText,
  hideSearch,
  hideHeader,
}) => {
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
    <div id="app" className="app" ref={app}>
      <pageContext.Provider value={{ app }}>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        {(loading || !app.current) && loadingText && (
          <LoadingOverlay active={loading} description={loadingText} />
        )}
        {!hideHeader && <Header hideSearch={hideSearch} />}
        {children}
      </pageContext.Provider>
    </div>
  )
}

export default Page
