import React from 'react'

import { PostShape } from '../../generated/shex'

import styles from './Post.module.scss'

interface PostProps {
  post: PostShape
  onSelect?: () => void
}

const Post: React.FC<PostProps> = ({ post, onSelect }) => {
  return (
    <div
      key={post.id}
      title={post.link}
      onClick={() => {
        console.debug(post.id)
        if (onSelect) onSelect()
      }}
      className={styles.post}
      style={{
        cursor: 'pointer',
        background: `url(${post.link})`,
        backgroundSize: 'cover',
      }}
    />
  )
}

export default Post
