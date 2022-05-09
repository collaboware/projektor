import React from 'react'
<<<<<<< HEAD
import classNames from 'classnames'

import { PostShape } from '../../generated/shex'

import styles from './Post.module.scss'

interface PostProps {
  post: PostShape
  fullSize?: boolean
  grid?: boolean
  onSelect?: () => void
}

const Post: React.FC<PostProps> = ({ post, fullSize, grid, onSelect }) => {
  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.fullSizeWrapper]: fullSize,
        [styles.gridWrapper]: grid,
      })}
    >
      <img
        key={post.id}
        title={post.link}
        onClick={() => {
          if (onSelect) onSelect()
        }}
        className={classNames(styles.post, {
          [styles.fullSize]: fullSize,
        })}
        src={post.link}
        loading={'lazy'}
        style={{
          cursor: 'pointer',
        }}
      />
    </div>
=======

import { PostShape } from '../../shex/generated'

interface PostProps {
  post: PostShape
  onSelect?: () => void
}

const Post: React.FC<PostProps> = ({ post, onSelect }) => {
  return (
    <div
      key={post.id}
      onClick={() => {
        console.debug(post.id)
        if (onSelect) onSelect()
      }}
      className="post"
      style={{
        background: `url(${post.link})`,
        backgroundSize: 'cover',
      }}
    />
>>>>>>> 286dad0 (feat: Add basic uploading and viewing)
  )
}

export default Post
