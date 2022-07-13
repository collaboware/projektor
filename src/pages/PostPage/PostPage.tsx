import { Session } from '@inrupt/solid-client-authn-browser'
import mime from 'mime'
import React, { RefObject, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useRecoilState } from 'recoil'

import { analyticsWindow } from '../../AnalyticsWindow'
import Page from '../../components/Page/Page'
import { encodePostId } from '../../components/Post/Post'
import { PostShape, solidProfile } from '../../generated/shex'
import useClickOutside from '../../hooks/useClickOutside'
import { authState } from '../../state/auth'
import { postState } from '../../state/post'
import { postsState } from '../../state/posts'
import { userState } from '../../state/user'
import { deletePost, fetchPosts } from '../ProfilePage/ProfilePage'

import styles from './PostPage.module.scss'

export const shortenPostId = (post: string) => {
  return post.substring(post.lastIndexOf('/') + 1, post.lastIndexOf('-post'))
}

const PostPage: React.FC = () => {
  const [auth, _] = useRecoilState(authState)
  // const { session: currentSession } = useContext(CurrentUserAuthContext)
  const params = useParams<{ webId: string; post: string }>()
  const selectedPostRef = useRef<HTMLImageElement | HTMLVideoElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const [isLoading, setIsLoading] = useState(true)
  // const [selectedPost, setSelectedPost] = useState<PostShape | null>(null)
  // const [userProfile, setUserProfile] = useState<SolidProfileShape | null>(null)

  const [userData, setUserData] = useRecoilState(userState)
  const [{ post }, setPost] = useRecoilState(postState)
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
    fetchPosts(session, params.webId as string)
      .then((posts) => {
        const selected = posts.find(
          (post) => shortenPostId(post.id) === params.post
        )
        if (selected) {
          setPost({ ...post, post: selected })
          setIsLoading(false)
        }
      })
      .catch(() => setIsLoading(false))
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
          View {userData.profile?.name}'s profile
        </button>
      )
    }
  }

  return (
    <Page
      title={userData ? `Post by ${userData.profile?.name}` : 'Post'}
      loading={isLoading}
      loadingText="Loading..."
    >
      <div className={styles.selectedPostWrapper}>
        {!isLoading && (
          <div className={styles.buttonBar}>
            {renderProfileButton()}
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
          </div>
        )}
        {!post && !isLoading && <h1>This post does not exist</h1>}
        {!isLoading && post && mime.lookup(post.link).startsWith('image') && (
          <img
            title={post.link}
            loading={'lazy'}
            ref={selectedPostRef as RefObject<HTMLImageElement>}
            className={styles.selectedPost}
            src={post.link}
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
            <source src={post.link} type="video/quicktime" />
            Sorry, your browser doesn't support embedded videos. Here's a link
            to the video instead: {post.link}
          </video>
        )}
      </div>
    </Page>
  )
}

export default PostPage
