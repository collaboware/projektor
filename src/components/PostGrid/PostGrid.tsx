import React, { useMemo } from 'react'
import { useNavigate } from 'react-router'

import { PostShape } from '../../generated/shex'
import { shortenPostId } from '../../pages/PostPage/PostPage'
import Post from '../Post/Post'

import styles from './PostGrid.module.scss'

interface PostGridProps {
  posts?: PostShape[]
  feed?: { post: PostShape; user: string }[]
}

const PostGrid: React.FC<PostGridProps> = ({ posts, feed }) => {
  const navigate = useNavigate()
  const postGrid = useMemo(() => {
    if (feed) {
      return feed.map(({ post, user }) => (
        <Post
          grid
          post={post}
          onSelect={() =>
            navigate(
              `/user/${encodeURIComponent(user)}/${shortenPostId(post.id)}`,
              { state: location.pathname + location.search }
            )
          }
          key={post.id}
        />
      ))
    }
    if (posts)
      return posts.map((post) => (
        <Post
          grid
          post={post}
          onSelect={() =>
            navigate(shortenPostId(post.id), {
              state: location.pathname + location.search,
            })
          }
          key={post.id}
        />
      ))
  }, [posts, feed])
  return <div className={styles.postGrid}>{postGrid}</div>
}

export default PostGrid
