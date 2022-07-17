import { Session } from '@inrupt/solid-client-authn-browser'
import mime from 'mime'
import React, { RefObject, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useRecoilState } from 'recoil'

import { analyticsWindow } from '../../AnalyticsWindow'
import Page from '../../components/Page/Page'
import { encodePostId } from '../../components/Post/Post'
import ShareButton from '../../components/ShareButton/ShareButton'
import { post, PostShape, solidProfile } from '../../generated/shex'
import useClickOutside from '../../hooks/useClickOutside'
import { authState } from '../../state/auth'
import { postState } from '../../state/post'
import { postsState } from '../../state/posts'
import { userState } from '../../state/user'
import { deletePost } from '../ProfilePage/ProfilePage'

import styles from './PostPage.module.scss'

const fetchPostMetadata = async (postURL: string, session?: Session) => {
  if (session) post.fetcher._fetch = session.fetch
  return await post.findOne({
    where: { id: postURL },
    doc: postURL,
  })
}

const fetchRawPost = async (
  postLink: string,
  progressCallback: (e: ProgressEvent<XMLHttpRequestEventTarget>) => void
) => {
  const handleEvent = (e: ProgressEvent<XMLHttpRequestEventTarget>) => {
    switch (e.type) {
      case 'progress':
        console.debug(`Fetched ${e.loaded} bytes, with total: ${e.total}`)
        progressCallback(e)
        break
      default:
        console.debug(`${e.type} event in request`)
    }
  }
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.withCredentials = true
    xhr.responseType = 'blob'
    xhr.onreadystatechange = async function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 400) {
          reject()
        } else {
          resolve(URL.createObjectURL(xhr.response))
        }
      }
    }
    xhr.addEventListener('loadstart', handleEvent)
    xhr.addEventListener('loadend', handleEvent)
    xhr.addEventListener('progress', handleEvent)
    xhr.addEventListener('error', handleEvent)
    xhr.addEventListener('abort', handleEvent)
    xhr.addEventListener('load', handleEvent)
    xhr.open('GET', postLink)
    xhr.send()
  })
}

const PostPage: React.FC = () => {
  const [auth, _] = useRecoilState(authState)
  // const { session: currentSession } = useContext(CurrentUserAuthContext)
  const params = useParams<{ webId: string; post: string }>()
  const selectedPostRef = useRef<HTMLImageElement | HTMLVideoElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState<string>()
  // const [selectedPost, setSelectedPost] = useState<PostShape | null>(null)
  // const [userProfile, setUserProfile] = useState<SolidProfileShape | null>(null)

  const [userData, setUserData] = useRecoilState(userState)
  const [{ post, raw }, setPost] = useRecoilState(postState)
  const [_posts, setPosts] = useRecoilState(postsState)
  const { session } = auth

  const onClose = () => {
    const parentRoute =
      location.state ??
      location.pathname.substring(0, location.pathname.lastIndexOf('/'))
    navigate(parentRoute + `#${encodePostId(post?.id as string)}`)
  }

  useClickOutside(selectedPostRef, () => {
    analyticsWindow.fathom?.trackGoal('7RBSJNKX', 0)
    if (!isLoading) onClose()
  })

  useEffect(() => {
    setIsLoading(true)
    if (session?.info) {
      solidProfile.fetcher._fetch = session.fetch
    }
    if (
      params.webId &&
      (!userData.profile || userData.profile.id !== params.webId)
    ) {
      solidProfile
        .findOne({
          where: { id: params.webId },
          doc: params.webId as string,
        })
        .then((profile) => {
          if (profile.data) {
            setUserData({ ...userData, profile: profile.data })
          }
        })
    }
    if (params.webId && params.post && (!post || post.id !== params.post)) {
      fetchPostMetadata(params.post, session as Session).then(({ data }) => {
        if (data?.link) {
          fetchRawPost(data?.link, (e) => {
            setProgress(`Fetched ${e.loaded} bytes, from a total of ${e.total}`)
          }).then((raw) => {
            setPost({ post: data, raw })
            setIsLoading(false)
          })
        }
      })
    }
    if (params.post && post && post.id === params.post) {
      setPost({ post, raw })
      setIsLoading(false)
    }
  }, [])

  const renderProfileButton = () => {
    if (userData.profile?.id) {
      return (
        <button
          onClick={(e) => {
            e.preventDefault()
            userData.profile?.id &&
              navigate(`/user/${encodeURIComponent(userData.profile.id)}`)
          }}
        >
          {userData.profile?.name}
        </button>
      )
    }
  }

  return (
    <Page
      title={userData ? `Post by ${userData.profile?.name}` : 'Post'}
      loading={isLoading}
      loadingText={progress ? progress : 'Loading...'}
    >
      <div className={styles.selectedPostWrapper}>
        {!isLoading && (
          <div className={styles.buttonBar}>
            {session?.info.webId !== params.webId && renderProfileButton()}
            {session?.info.webId === params.webId && userData.profile?.id ? (
              <button
                className="danger"
                onClick={(e) => {
                  e.preventDefault()
                  if (confirm('Do you really want to delete this post?')) {
                    deletePost(session as Session, post as PostShape).then(
                      () => {
                        setPosts((state) => ({
                          posts: [
                            ...state.posts.filter(
                              (oldPost) => oldPost.id !== post?.id
                            ),
                          ],
                        }))
                        navigate(
                          `/user/${encodeURIComponent(
                            String(userData.profile?.id)
                          )}`,
                          { replace: true }
                        )
                      }
                    )
                  }
                }}
              >
                Delete
              </button>
            ) : null}
            {post?.link && <ShareButton url={window.location.href} post />}
            {location.state ? (
              <button
                onClick={(e) => {
                  analyticsWindow.fathom?.trackGoal('PTSICNRA', 0)
                  e.preventDefault()
                  onClose()
                }}
              >
                Close
              </button>
            ) : null}
          </div>
        )}
        {!post && !isLoading && <h1>This post does not exist</h1>}
        {!isLoading && post && mime.lookup(post.link).startsWith('image') && (
          <img
            title={post.link}
            ref={selectedPostRef as RefObject<HTMLImageElement>}
            className={styles.selectedPost}
            src={raw}
          />
        )}
        {!isLoading && post && mime.lookup(post.link).startsWith('video') && (
          <video
            controls
            crossOrigin="use-credentials"
            preload="auto"
            width={document.body.clientWidth}
            ref={selectedPostRef as RefObject<HTMLVideoElement>}
            className={styles.selectedPost}
          >
            <source src={raw} type={mime.lookup(post.link)} />
            Sorry, your browser doesn't support embedded videos. Here's a link
            to the video instead: {post.link}
          </video>
        )}
      </div>
    </Page>
  )
}

export default PostPage
