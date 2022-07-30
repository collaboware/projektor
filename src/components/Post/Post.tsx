import classNames from 'classnames'
import mime from 'mime'
import React, { useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'

import screenSizes from '../../constants.scss'
import { PostShape } from '../../generated/shex'
import { authState } from '../../state/auth'
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
  return b64PostId.replaceAll('=', '')
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
  console.debug(type)
  if (type.startsWith('video')) {
    return getVideoThumbnailLink(link, quality)
  } else {
    return getQualityLink(link, quality)
  }
}

const Post: React.FC<PostProps> = ({ post, fullSize, grid, onSelect }) => {
  const [{ session }] = useRecoilState(authState)
  const [loadRaw, setLoadRaw] = useState(isDefinitelyRawUpload(post.id))
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const isVideo = mime.lookup(post.link).startsWith('video')

  useEffect(() => {
    let thumbnailLink = null
    if (loadRaw) {
      thumbnailLink = post.link
    } else {
      if (document.body.clientWidth < screenSizes.s) {
        thumbnailLink = grid
          ? getPostLink(post.link, 8)
          : getQualityLink(post.link, 8)
      } else if (document.body.clientWidth < screenSizes.m) {
        thumbnailLink = grid
          ? getPostLink(post.link, 4)
          : getQualityLink(post.link, 4)
      } else if (document.body.clientWidth > screenSizes.m) {
        thumbnailLink = grid
          ? getPostLink(post.link, 2)
          : getQualityLink(post.link, 2)
      }
    }
    if (thumbnailLink) {
      session?.fetch(thumbnailLink).then(async (res) => {
        if (res.ok) {
          setThumbnailUrl(URL.createObjectURL(await res.blob()))
        }
      })
    }
  }, [grid, post.link])

  const imageComponent = useMemo(() => {
    return thumbnailUrl ? (
      <img
        onError={() => {
          if (!isVideo) setLoadRaw(true)
        }}
        key={post.id}
        title={post.link}
        onClick={() => {
          if (onSelect) onSelect()
        }}
        className={classNames(styles.post, {
          [styles.fullSize]: fullSize,
        })}
        src={thumbnailUrl}
        loading="lazy"
        style={{
          cursor: 'pointer',
        }}
      />
    ) : null
  }, [thumbnailUrl])

  return (
    <div
      id={encodePostId(post.id)}
      className={classNames(styles.wrapper, {
        [styles.fullSizeWrapper]: fullSize,
        [styles.gridWrapper]: grid,
      })}
    >
      {imageComponent}
    </div>
  )
}

export default Post
