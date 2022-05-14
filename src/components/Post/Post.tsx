import React from 'react'
import classNames from 'classnames'

import { PostShape } from '../../generated/shex'

import styles from './Post.module.scss'

interface PostProps {
  post: PostShape
  fullSize?: boolean
  onSelect?: () => void
}

const Post: React.FC<PostProps> = ({ post, fullSize, onSelect }) => {
  return (
    <div
      key={post.id}
      title={post.link}
      onClick={() => {
        if (onSelect) onSelect()
      }}
      className={classNames(styles.post, { [styles.fullSize]: fullSize })}
      style={{
        cursor: 'pointer',
        background: `url(${post.link})`,
        backgroundSize: 'cover',
      }}
    />
  )
}

export default Post
