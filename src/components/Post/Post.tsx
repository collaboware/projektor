import classNames from 'classnames'
import mime from 'mime'
import React, { useState } from 'react'

import screenSizes from '../../constants.scss'
import { PostShape } from '../../generated/shex'
import {
  getQualityLink,
  getVideoThumbnailLink,
} from '../UploadButton/UploadButton'

import styles from './Post.module.scss'

interface PostProps {
  post: PostShape
  fullSize?: boolean
  grid?: boolean
  onSelect?: () => void
}

export const encodePostId = (postId: string) => {
  const b64PostId = btoa(postId)
  return b64PostId.replaceAll("=","")
}

const isDefinitelyRawUpload = (post: string) => {
  const whenCompressionWasAdded = new Date('2022-07-9')
  const postUrlPath = new URL(post).pathname
  const postId = postUrlPath
    .substring(postUrlPath.lastIndexOf('/') + 1, postUrlPath.length)
    .replace('-post', '')
  return Number(postId) < whenCompressionWasAdded.getTime()
}

export const getPostLink = (link: string, quality: number) => {
  const type = mime.lookup(link)
  if (type.startsWith('video')) {
    return getVideoThumbnailLink(link, quality)
  } else {
    return getQualityLink(link, quality)
  }
}

const Post: React.FC<PostProps> = ({ post, fullSize, grid, onSelect }) => {
  const [loadRaw, setLoadRaw] = useState(isDefinitelyRawUpload(post.id))
  const imageComponent = (
    <img
      onError={() => setLoadRaw(true)}
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
            srcSet={
              grid ? getPostLink(post.link, 8) : getQualityLink(post.link, 8)
            }
            media={`(max-width: ${screenSizes.s}px)`}
          />
          <source
            srcSet={
              grid ? getPostLink(post.link, 4) : getQualityLink(post.link, 4)
            }
            media={`(max-width: ${screenSizes.m}px)`}
          />
          <source
            srcSet={
              grid ? getPostLink(post.link, 2) : getQualityLink(post.link, 2)
            }
            media={`(min-width: ${screenSizes.l}px)`}
          />
          {imageComponent}
        </picture>
      )}
    </div>
  )
}

export default Post
