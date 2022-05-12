import React, { ChangeEvent, useContext, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { CurrentUserAuthContext } from '../../context/CurrentUserAuthContext'
import { SolidProfileShape } from '../../generated/shex'

import styles from './Header.module.scss'

interface HeaderProps {
  user?: SolidProfileShape | null
}

const Header: React.FC<HeaderProps> = () => {
  const [lastRoute, setLastRoute] = useState('')
  const { term } = useParams<{ term: string }>()
  const [searchTerm, setSearchTerm] = useState(term)
  const { user } = useContext(CurrentUserAuthContext)

  const navigate = useNavigate()
  const location = useLocation()
  const isSearching = location.pathname.startsWith('/search/')

  return (
    <div className={styles.header}>
      <Link to={'/'}>
        <h2 className={styles.brand}>Projektor</h2>
      </Link>
      <div>
        {user && (
          <input
            autoFocus
            className={styles.search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target?.value)
              if (!e.target.value) {
                navigate(lastRoute, { replace: true })
              } else {
                if (!isSearching) {
                  setLastRoute(location.pathname)
                }
                navigate(`/search/${encodeURIComponent(e.target.value)}`, {
                  replace: true,
                })
              }
            }}
            value={searchTerm}
            title="Search"
          />
        )}
        <button
          onClick={() => {
            setSearchTerm('')
            console.debug(lastRoute)
            navigate(lastRoute, { replace: true })
          }}
          title="Clear"
          className={styles.clear}
        >
          X
        </button>
      </div>
      {user && (
        <Link
          className={styles.user}
          to={`/user/${encodeURIComponent(user?.id as string)}`}
        >
          {user?.name}
        </Link>
      )}
    </div>
  )
}

export default Header
