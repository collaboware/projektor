import React, { useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import { analyticsWindow } from '../../AnalyticsWindow'
import Page from '../../components/Page/Page'
import { CurrentUserAuthContext } from '../../context/CurrentUserAuthContext'
import { PostShape } from '../../generated/shex'
import useClickOutside from '../../utils/hooks/useClickOutside'
import { fetchPosts } from '../ProfilePage/ProfilePage'

import styles from './PostPage.module.scss'

export const shortenPostId = (post: string) => {
  return post.substring(post.lastIndexOf('/') + 1, post.lastIndexOf('-post'))
}

const PostPage: React.FC = () => {
  // const PostPage: React.FC<PostPageProps> = () => {
  const { session: currentSession } = useContext(CurrentUserAuthContext)
  const params = useParams<{ webId: string; post: string }>()
  const selectedImageRef = useRef<HTMLImageElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const [isLoading, setIsLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<PostShape | null>(null)

  const onClose = () => {
    navigate(location.pathname.substring(0, location.pathname.lastIndexOf('/')))
  }

  useClickOutside(selectedImageRef, () => {
    analyticsWindow.fathom?.trackGoal('7RBSJNKX', 0)
    onClose()
  })

  useEffect(() => {
    setIsLoading(true)
    if (currentSession?.info) {
      fetchPosts(currentSession, params.webId as string)
        .then((posts) => {
          const selected = posts.find(
            (post) => shortenPostId(post.id) === params.post
          )
          if (selected) {
            setSelectedPost(selected)
            setIsLoading(false)
          }
        })
        .catch(() => setIsLoading(false))
    }
  }, [])

  return (
    <Page title="Post" loading={isLoading} loadingText="Loading...">
      <div className={styles.selectedPostWrapper}>
        <button
          className={styles.closeSelectedPostButton}
          onClick={(e) => {
            analyticsWindow.fathom?.trackGoal('PTSICNRA', 0)
            e.preventDefault()
            onClose()
          }}
        >
          Close
        </button>
        {!selectedPost && !isLoading && <h1>This post does not exist</h1>}
        {selectedPost && (
          <img
            ref={selectedImageRef}
            className={styles.selectedPost}
            src={selectedPost.link}
          />
        )}
      </div>
    </Page>
  )
}

export default PostPage
