import React, { useState } from 'react'
import { useRef } from 'react'

import { analyticsWindow } from '../../AnalyticsWindow'
import { PostShape } from '../../generated/shex'
import useClickOutside from '../../utils/hooks/useClickOutside'
import Post from '../Post/Post'

import styles from './PostGrid.module.scss'

interface PostGridProps {
  posts: PostShape[]
}

const PostGrid: React.FC<PostGridProps> = ({ posts }) => {
  const [selectedPost, setSelectedPost] = useState<PostShape | null>(null)
  const selectedImageRef = useRef<HTMLImageElement>(null)

  const onClose = () => {
    setSelectedPost(null)
  }

  useClickOutside(selectedImageRef, () => {
    analyticsWindow.fathom?.trackGoal('7RBSJNKX', 0)
    onClose()
  })

  return (
    <>
      {selectedPost && (
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
          <img
            ref={selectedImageRef}
            className={styles.selectedPost}
            src={selectedPost.link}
          />
        </div>
      )}
      <div className={styles.postGrid}>
        {posts.map((post) => (
          <Post post={post} onSelect={() => setSelectedPost(post)} />
        ))}
      </div>
    </>
  )
}

export default PostGrid
