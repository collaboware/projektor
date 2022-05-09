import React from 'react'
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
  )
}

export default Post
