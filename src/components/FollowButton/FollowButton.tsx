import React from 'react'

import { useFollowingList } from '../../hooks/useFollowingList'

import styles from './FollowButton.module.scss'

interface FollowButtonProps {
  webId: URL
}

const FollowButton: React.FC<FollowButtonProps> = ({ webId }) => {
  const { isFollowing, isLoading, toggleFollowing } = useFollowingList()

  if (isLoading || !toggleFollowing) {
    return (
      <button className={styles.followButton} disabled>
        {isFollowing(webId) ? 'Unfollow' : 'Follow'}
      </button>
    )
  }

  return (
    <button
      className={styles.followButton}
      onClick={() => toggleFollowing(webId)}
    >
      {isFollowing(webId) ? 'Unfollow' : 'Follow'}
    </button>
  )
}

export default FollowButton
