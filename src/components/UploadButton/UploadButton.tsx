import gifshot from '@collaboware/gifshot'
import {
  getSourceUrl,
  overwriteFile,
  WithResourceInfo,
} from '@inrupt/solid-client'
import { Session } from '@inrupt/solid-client-authn-browser'
import imageCompression from 'browser-image-compression'
import classNames from 'classnames'
import mime from 'mime'
import { Fetcher, Store } from 'rdflib'
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useRecoilState } from 'recoil'

import { analyticsWindow } from '../../AnalyticsWindow'
import {
  post,
  postIndex,
  PostShapeIndexType,
  PostShapeType,
} from '../../generated/shex'
import { dataURItoBlob } from '../../gifHelper'
import { useFeed } from '../../hooks/useFeed'
import { authState } from '../../state/auth'
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay'

import styles from './UploadButton.module.scss'

export function getQualityLink(link: string, quality: number) {
  const type = mime.lookup(link)
  const extension = mime.extension(type) as string
  return `${link.substring(0, link.lastIndexOf('.'))}-${quality}.${extension}`
}

export function getVideoThumbnailLink(link: string, quality: number) {
  return `${link}-${quality}.gif`
}

export function migrateStorageFromEssWebId(webId: string) {
  return webId.replace('pod.inrupt.com', 'storage.inrupt.com')
}

interface UploadButtonProps {
  onUpload?: () => void
}

enum MediaType {
  Image = 'image',
  Video = 'video',
}

export const ImageQualities = ['raw', 2, 4, 8]

const handleMediaUpload = (
  session: Session,
  input: HTMLInputElement,
  type: MediaType
) => {
  const file = input.files && input?.files[0]
  if (!file) {
    alert('No file was selected')
    return Promise.resolve()
  }
  if (file && !file.type.startsWith(type.toLowerCase())) {
    alert(`You have to select a valid ${type.toLowerCase()} file`)
    return Promise.resolve()
  }
  const reader = new FileReader()
  const store = new Store()
  const fetcher = new Fetcher(store)
  return new Promise<void>((resolve, reject) => {
    if (session?.fetch) {
      fetcher._fetch = session.fetch
      post.fetcher._fetch = fetcher._fetch
      postIndex.fetcher._fetch = fetcher._fetch
    }
    reader.onloadend = async function () {
      const data = this.result
      const contentType = file?.type
      const time = new Date().getTime()
      const mediaUrl = migrateStorageFromEssWebId(
        session?.info.webId?.replace(
          'profile/card#me',
          `public/${time}-${file?.name.replaceAll(' ', '-') as string}`
        ) as string
      )
      const postUrl = migrateStorageFromEssWebId(
        session?.info.webId?.replace(
          'profile/card#me',
          `public/${time}-post`
        ) as string
      )
      const publicTypeIndexUrl = migrateStorageFromEssWebId(
        session?.info.webId?.replace(
          'profile/card#me',
          `settings/publicTypeIndex.ttl`
        ) as string
      )
      const uploads = ImageQualities.map(async (quality) => {
        if (quality === 'raw') {
          return overwriteFile(
            mediaUrl as string,
            new Blob([data as string], { type: file.type }),
            { contentType, fetch: session.fetch }
          )
          // return fetcher.webOperation('PUT', mediaUrl as string, {
          //   data: data as string,
          //   contentType: contentType,
          // })
        } else {
          if (type === MediaType.Image) {
            const thumbnail = await imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1024,
              initialQuality: 1 / Number(quality),
              useWebWorker: true,
            })
            return overwriteFile(
              getQualityLink(mediaUrl as string, quality as number),
              thumbnail,
              { contentType: thumbnail.type, fetch: session.fetch }
            )
          }
          if (type === MediaType.Video) {
            const gifFile = await new Promise<Blob>((resolve) => {
              gifshot.createGIF(
                {
                  video: [URL.createObjectURL(file)],
                  interval: 1,
                  frameDuration: 1,
                  numFrames: 20,
                  gifWidth: 1440 / (quality as number),
                  gifHeight: 1440 / (quality as number),
                  repeat: 3,
                },
                function (obj: { error: string; image: string }) {
                  if (!obj.error) {
                    resolve(dataURItoBlob(obj.image, 'image/gif'))
                  } else {
                    reject(obj.error)
                  }
                }
              )
            })
            const gifImage = new File([gifFile], 'thumbnail.gif', {
              type: 'image/gif',
            })
            const thumbnailUrl = getVideoThumbnailLink(
              mediaUrl as string,
              quality as number
            )
            overwriteFile(thumbnailUrl, gifImage, {
              contentType: gifImage.type,
              fetch: session.fetch,
            })
            const thumbnail = await imageCompression(gifImage, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1024,
              initialQuality: 1 / Number(quality),
              useWebWorker: true,
              fileType: 'image/png',
            })
            return overwriteFile(
              getQualityLink(mediaUrl as string, quality as number),
              thumbnail,
              { contentType: thumbnail.type, fetch: session.fetch }
            )
          } else {
            throw Error('Unknown media type')
          }
        }
      })
      Promise.all(uploads)
        .then(async (uploads: (Blob & WithResourceInfo)[]) => {
          const res = uploads[0]
          const { data } = await post.create({
            doc: postUrl as string,
            data: {
              type: PostShapeType.Post,
              id: (postUrl + `#${time}`) as string,
              link: new URL(getSourceUrl(res)),
            },
          })
          if (data?.id) {
            await postIndex.create({
              doc: publicTypeIndexUrl as string,
              data: {
                id: data.id,
                type: [PostShapeIndexType.PostIndex],
                link: new URL(data.id),
              },
            })
            resolve()
          }
        })
        .catch(reject)
    }
    reader.readAsArrayBuffer(file)
  })
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUpload }) => {
  const [auth, _] = useRecoilState(authState)
  const { refetchFeed } = useFeed()
  const location = useLocation()
  const navigate = useNavigate()
  const currentSession = auth.session
  const [isUploading, setIsUploading] = useState(false)
  return (
    <>
      <LoadingOverlay active={isUploading} description="Uploading..." />
      <div
        className={classNames(styles.uploadButtons, {
          [styles.uploadButtonsOpen]: location.hash === '#upload',
        })}
      >
        {!isUploading && location.hash !== '#upload' && (
          <button
            onClick={() => {
              navigate(`${location.search}#upload`)
            }}
          >
            Upload
          </button>
        )}
        {!isUploading && location.hash === '#upload' && (
          <button className={styles.uploadButton}>
            <label
              htmlFor="picture-upload"
              style={{ display: 'block', width: '100%' }}
            >
              <input
                type="file"
                id="picture-upload"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  setIsUploading(true)
                  handleMediaUpload(
                    currentSession as Session,
                    e.target,
                    MediaType.Image
                  )
                    .then(() => {
                      setIsUploading(false)
                      refetchFeed()
                      analyticsWindow.fathom?.trackGoal('7VL5QY9P', 0)
                      if (onUpload) onUpload()
                    })
                    .catch((err: Error) => {
                      setIsUploading(false)
                      console.error(err)
                    })
                }}
              />
              Photo
            </label>
          </button>
        )}
        {!isUploading && location.hash === '#upload' && (
          <button className={styles.uploadButton}>
            <label
              htmlFor="video-upload"
              style={{ display: 'block', width: '100%' }}
            >
              <input
                type="file"
                id="video-upload"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={({ target }) => {
                  const file = target.files && target.files[0]
                  if (!file) {
                    alert('No file was selected')
                    return
                  }
                  if (file && !file.type.startsWith('video')) {
                    alert('You have to select a valid video file')
                    return
                  }
                  setIsUploading(true)
                  handleMediaUpload(
                    currentSession as Session,
                    target,
                    MediaType.Video
                  )
                    .then(() => {
                      setIsUploading(false)
                      refetchFeed()
                      analyticsWindow.fathom?.trackGoal('7VL5QY9P', 0)
                      if (onUpload) onUpload()
                    })
                    .catch((err: Error) => {
                      setIsUploading(false)
                      console.error(err)
                    })
                }}
              />
              Video
            </label>
          </button>
        )}
      </div>
    </>
  )
}

export default UploadButton
