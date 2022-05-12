import React, { ChangeEvent, useContext, useState } from 'react'
import { Link } from 'react-router-dom'

import { CurrentUserAuthContext } from '../../context/CurrentUserAuthContext'
import { SolidProfileShape } from '../../generated/shex'

import styles from './Header.module.scss'

interface HeaderProps {
  user?: SolidProfileShape | null
}

const Header: React.FC<HeaderProps> = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useContext(CurrentUserAuthContext)
  return (
    <div className={styles.header}>
      <Link to={'/'}>
        <h2 className={styles.brand}>Projektor</h2>
      </Link>
      <div>
        {user && (
          <input
            className={styles.search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target?.value)
            }}
            value={searchTerm}
            title="Search"
          />
        )}
        <button
          onClick={() => setSearchTerm('')}
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
