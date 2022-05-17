import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useRecoilState } from 'recoil'

import { analyticsWindow } from '../../AnalyticsWindow'
import Page from '../../components/Page/Page'
import { solidProfile } from '../../generated/shex'
import useClickOutside from '../../hooks/useClickOutside'
import { authState } from '../../state/auth'
import { postState } from '../../state/post'
import { userState } from '../../state/user'
import { fetchPosts } from '../ProfilePage/ProfilePage'

import styles from './PostPage.module.scss'

export const shortenPostId = (post: string) => {
  return post.substring(post.lastIndexOf('/') + 1, post.lastIndexOf('-post'))
}

const PostPage: React.FC = () => {
  const [auth, _] = useRecoilState(authState)
  // const { session: currentSession } = useContext(CurrentUserAuthContext)
  const params = useParams<{ webId: string; post: string }>()
  const selectedImageRef = useRef<HTMLImageElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const [isLoading, setIsLoading] = useState(true)
  // const [selectedPost, setSelectedPost] = useState<PostShape | null>(null)
  // const [userProfile, setUserProfile] = useState<SolidProfileShape | null>(null)

  const [userData, setUserData] = useRecoilState(userState)
  const [post, setPost] = useRecoilState(postState)
  const { session } = auth

  const onClose = () => {
    const parentRoute = location.pathname.substring(
      0,
      location.pathname.lastIndexOf('/')
    )
    navigate((location.state as string) ?? parentRoute)
  }

  useClickOutside(selectedImageRef, () => {
    analyticsWindow.fathom?.trackGoal('7RBSJNKX', 0)
    onClose()
  })

  useEffect(() => {
    setIsLoading(true)
    if (session?.info) {
      fetchPosts(session, params.webId as string)
        .then((posts) => {
          const selected = posts.find(
            (post) => shortenPostId(post.id) === params.post
          )
          if (selected) {
            setPost({ ...post, current: selected })
            solidProfile.fetcher._fetch = session.fetch
            solidProfile
              .findOne({
                where: { id: params.webId },
                doc: params.webId as string,
              })
              .then((profile) => {
                if (profile.data) {
                  setUserData({ ...userData, current: profile.data })
                }
              })
            setIsLoading(false)
          }
        })
        .catch(() => setIsLoading(false))
    }
  }, [])

  const renderProfileButton = () => {
    if (userData.current?.id) {
      return (
        <button
          onClick={(e) => {
            e.preventDefault()
            userData.current?.id &&
              navigate(`/user/${encodeURIComponent(userData.current.id)}`)
          }}
        >
          View {userData.current?.name}'s profile
        </button>
      )
    }
  }

  return (
    <Page title="Post" loading={isLoading} loadingText="Loading...">
      <div className={styles.selectedPostWrapper}>
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
        </div>
        {!post.current && !isLoading && <h1>This post does not exist</h1>}
        {post.current && (
          <img
            ref={selectedImageRef}
            className={styles.selectedPost}
            src={post.current.link}
          />
        )}
      </div>
    </Page>
  )
}

export default PostPage
