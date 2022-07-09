import React, { useState } from 'react'
import { Fetcher, Store } from 'rdflib'
import { useRecoilState } from 'recoil'
import imageCompression from 'browser-image-compression'
import mime from 'mime'

import {
  post,
  postIndex,
  PostShapeIndexType,
  PostShapeType,
} from '../../generated/shex'
import { analyticsWindow } from '../../AnalyticsWindow'
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay'
import { authState } from '../../state/auth'

import styles from './UploadButton.module.scss'

export function getQualityLink(link: string, quality: number, type: string) {
  const extension = mime.extension(type) as string
  return `${String(link).replace(`.${extension}`, '')}-${quality}.${extension}`
}

function blobToArrayBuffer(blob: Blob) {
  return new Promise<string | ArrayBuffer | null | undefined>((resolve) => {
    const reader = new FileReader()
    reader.onload = function (e) {
      resolve(e.target?.result)
    }
    reader.readAsArrayBuffer(blob)
  })
}

interface UploadButtonProps {
  onUpload?: () => void
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUpload }) => {
  const [auth, _] = useRecoilState(authState)
  const currentSession = auth.session
  const [isUploading, setIsUploading] = useState(false)
  return (
    <>
      <LoadingOverlay active={isUploading} description="Uploading..." />
      {!isUploading && (
        <button className={styles.uploadButton}>
          <label
            htmlFor="picture-upload"
            style={{ display: 'block', width: '100%' }}
          >
            <input
              type="file"
              id="picture-upload"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={(e) => {
                setIsUploading(true)
                const file = (e.target?.files as unknown as File[])[0]
                const reader = new FileReader()
                const store = new Store()
                const fetcher = new Fetcher(store)
                if (currentSession?.fetch) {
                  fetcher._fetch = currentSession.fetch
                  post.fetcher._fetch = fetcher._fetch
                  postIndex.fetcher._fetch = fetcher._fetch
                }
                reader.onload = function () {
                  const data = this.result
                  const contentType = file.type
                  const time = new Date().getTime()
                  const pictureUrl = currentSession?.info.webId?.replace(
                    'profile/card#me',
                    `public/${time}-${encodeURIComponent(
                      file.name.replaceAll(' ', '-')
                    )}`
                  )
                  const postUrl = currentSession?.info.webId?.replace(
                    'profile/card#me',
                    `public/${time}-post`
                  )
                  const publicTypeIndexUrl =
                    currentSession?.info.webId?.replace(
                      'profile/card#me',
                      `settings/publicTypeIndex.ttl`
                    )
                  const imgQualities = ['raw', 2, 4, 8]
                  const uploads = imgQualities.map(async (quality, index) => {
                    if (quality === 'raw') {
                      return fetcher.webOperation('PUT', pictureUrl as string, {
                        data: data as string,
                        contentType: contentType,
                      })
                    } else {
                      const img = await imageCompression(file, {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1024,
                        initialQuality: 1 / Number(quality),
                        useWebWorker: true,
                      })
                      return fetcher.webOperation(
                        'PUT',
                        getQualityLink(
                          pictureUrl as string,
                          index as number,
                          img.type
                        ),
                        {
                          data: (await blobToArrayBuffer(img)) as string,
                          contentType: img.type,
                        }
                      )
                    }
                  })
                  Promise.all(uploads)
                    .then(async (uploads: Response[]) => {
                      const res = uploads[0]
                      if (res.status >= 201 && res.status < 400) {
                        const { data } = await post.create({
                          doc: postUrl as string,
                          data: {
                            type: PostShapeType.Post,
                            id: (postUrl + `#${time}`) as string,
                            link: new URL(res.url),
                          },
                        })
                        if (data?.id) {
                          await postIndex
                            .create({
                              doc: publicTypeIndexUrl as string,
                              data: {
                                id: data.id,
                                type: PostShapeIndexType.Post,
                                link: new URL(data.id),
                              },
                            })
                            .then(() => {
                              setIsUploading(false)
                              analyticsWindow.fathom?.trackGoal('7VL5QY9P', 0)
                              if (onUpload) onUpload()
                            })
                        }
                      }
                    })
                    .catch((err: Error) => {
                      setIsUploading(false)
                      console.error(err)
                    })
                }
                reader.readAsArrayBuffer(file)
              }}
            />
            Upload
          </label>
        </button>
      )}
    </>
  )
}

export default UploadButton
