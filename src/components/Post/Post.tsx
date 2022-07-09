import React, { useState } from 'react'
import classNames from 'classnames'
import mime from 'mime'

import { PostShape } from '../../generated/shex'
import { getQualityLink } from '../UploadButton/UploadButton'
import screenSizes from '../../constants.scss'

import styles from './Post.module.scss'

interface PostProps {
  post: PostShape
  fullSize?: boolean
  grid?: boolean
  onSelect?: () => void
}

const Post: React.FC<PostProps> = ({ post, fullSize, grid, onSelect }) => {
  const type = mime.lookup(post.link)
  const [loadRaw, setLoadRaw] = useState(false)
  const imageComponent = (
    <img
      onError={() => {
        setLoadRaw(true)
      }}
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
  )
  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.fullSizeWrapper]: fullSize,
        [styles.gridWrapper]: grid,
      })}
    >
      {loadRaw && imageComponent}
      {!loadRaw && (
        <picture>
          <source
            onError={console.error}
            srcSet={getQualityLink(post.link, 3, type)}
            media={`(max-width: ${screenSizes.s}px)`}
          />
          <source
            srcSet={getQualityLink(post.link, 2, type)}
            media={`(min-width: ${screenSizes.s}px)`}
          />
          <source
            srcSet={getQualityLink(post.link, 1, type)}
            media={`(min-width: ${screenSizes.l}px)`}
          />
          {imageComponent}
        </picture>
      )}
    </div>
  )
}

export default Post
