import React, { ChangeEvent, useState } from 'react'

import { SolidProfileShape } from '../../generated/shex'

import styles from './Header.module.scss'

interface HeaderProps {
  user?: SolidProfileShape | null
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('')
  return (
    <div className={styles.header}>
      <h2 className={styles.brand}>Projektor</h2>
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
        <button onClick={() => setSearchTerm('')} title="Clear">
          X
        </button>
      </div>
      <div className={styles.user}>{user?.name}</div>
    </div>
  )
}

export default Header
