import React, { ChangeEvent, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useRecoilState } from 'recoil'

import { useIsMobile } from '../../hooks/useIsMobile'
import { authState } from '../../state/auth'

import styles from './Header.module.scss'

interface HeaderProps {
  hideSearch?: boolean
}

const Header: React.FC<HeaderProps> = ({ hideSearch }) => {
  const { term } = useParams<{ term: string }>()
  const [searchTerm, setSearchTerm] = useState(term)
  const [auth, _] = useRecoilState(authState)
  const { user } = auth

  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const isSearching = location.pathname.startsWith('/search/')
  const lastRoute = location.state as string

  const input =
    user && !hideSearch ? (
      <div className={styles.searchWrapper}>
        <input
          autoFocus={isSearching}
          className={styles.search}
          placeholder="Search and maybe find"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target?.value)
            if (!e.target.value) {
              navigate(lastRoute ?? '/', { replace: true })
            } else {
              navigate(
                `/search/${encodeURIComponent(e.target.value.toLowerCase())}`,
                {
                  replace: true,
                  state: isSearching ? location.state : location.pathname,
                }
              )
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
    <>
      <div className={styles.header}>
        <Link to={localStorage.getItem('last-feed-page') ?? '/'}>
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
        {!user && (
          <Link className={styles.user} to={`/login`}>
            Login
          </Link>
        )}
      </div>
      {isMobile && input}
    </>
  )
}

export default Header
