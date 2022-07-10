import classNames from 'classnames'
import mime from 'mime'
import React, { useState } from 'react'

import screenSizes from '../../constants.scss'
import { PostShape } from '../../generated/shex'
import { getQualityLink } from '../UploadButton/UploadButton'

import styles from './Post.module.scss'

interface PostProps {
  post: PostShape
  fullSize?: boolean
  grid?: boolean
  onSelect?: () => void
}

export const encodePostId = (postId: string) => {
  const b64PostId = btoa(postId)
  return b64PostId.substring(
    0,
    ((b64PostId.length - (b64PostId.length % 3)) / 3) * 3
  )
}

const isDefinitelyRawUpload = (post: string) => {
  const whenCompressionWasAdded = new Date('2022-07-9')
  const postUrlPath = new URL(post).pathname
  const postId = postUrlPath.substring(
    postUrlPath.lastIndexOf('/') + 1,
    postUrlPath.length
  )
  return Number(postId) < whenCompressionWasAdded.getTime()
}

const Post: React.FC<PostProps> = ({ post, fullSize, grid, onSelect }) => {
  const [loadRaw, setLoadRaw] = useState(isDefinitelyRawUpload(post.id))
  const type = mime.lookup(post.link)
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
      id={encodePostId(post.id)}
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
