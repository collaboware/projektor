import React, { ChangeEvent, useContext, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { CurrentUserAuthContext } from '../../context/CurrentUserAuthContext'
import { SolidProfileShape } from '../../generated/shex'
import { useIsMobile } from '../../hooks/useIsMobile'

import styles from './Header.module.scss'

interface HeaderProps {
  user?: SolidProfileShape | null
}

const Header: React.FC<HeaderProps> = () => {
  const { term } = useParams<{ term: string }>()
  const [searchTerm, setSearchTerm] = useState(term)
  const { user } = useContext(CurrentUserAuthContext)

  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const isSearching = location.pathname.startsWith('/search/')
  const lastRoute = location.state as string

  const input = user ? (
    <div className={styles.searchWrapper}>
      <input
        autoFocus={isSearching}
        className={styles.search}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setSearchTerm(e.target?.value)
          if (!e.target.value) {
            navigate(lastRoute ?? '/', { replace: true })
          } else {
            navigate(`/search/${encodeURIComponent(e.target.value)}`, {
              replace: true,
              state: isSearching ? location.state : location.pathname,
            })
          }
        }}
        value={searchTerm}
        title="Search"
      />
      <button
        onClick={() => {
          setSearchTerm('')
          navigate(lastRoute ?? '/', { replace: true })
        }}
        title="Clear"
        className={styles.clear}
      >
        X
      </button>
    </div>
  ) : null

  return (
    <div className={styles.headerWrapper}>
      <div className={styles.header}>
        <Link to={'/'}>
          <h2 className={styles.brand}>Projektor</h2>
        </Link>
        {!isMobile && input}
        {user && (
          <Link
            className={styles.user}
            to={`/user/${encodeURIComponent(user?.id as string)}`}
          >
            {user?.name}
          </Link>
        )}
      </div>
      {isMobile && input}
    </div>
  )
}

export default Header
