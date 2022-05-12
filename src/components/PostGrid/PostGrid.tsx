import React from 'react'
import { useNavigate } from 'react-router'

import { PostShape } from '../../generated/shex'
import Post from '../Post/Post'

import styles from './PostGrid.module.scss'

interface PostGridProps {
  posts: PostShape[]
}

const PostGrid: React.FC<PostGridProps> = ({ posts }) => {
  const navigate = useNavigate()
  return (
    <div className={styles.postGrid}>
      {posts.map((post) => (
        <Post post={post} onSelect={() => navigate(post.id)} />
      ))}
    </div>
  )
}

export default PostGrid
