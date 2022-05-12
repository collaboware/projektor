import React, { useMemo } from 'react'
import { useNavigate } from 'react-router'

import { PostShape } from '../../generated/shex'
import { shortenPostId } from '../../pages/PostPage/PostPage'
import Post from '../Post/Post'

import styles from './PostGrid.module.scss'

interface PostGridProps {
  posts: PostShape[]
}

const PostGrid: React.FC<PostGridProps> = ({ posts }) => {
  const navigate = useNavigate()
  const postGrid = useMemo(
    () =>
      posts.map((post) => (
        <Post
          post={post}
          onSelect={() => navigate(shortenPostId(post.id))}
          key={post.id}
        />
      )),
    [posts]
  )
  return <div className={styles.postGrid}>{postGrid}</div>
}

export default PostGrid
