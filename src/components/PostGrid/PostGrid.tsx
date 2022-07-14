import React, { useMemo, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useNavigate } from 'react-router'

import { PostShape } from '../../generated/shex'
import { minPostLength } from '../../pages/FeedPage/FeedPage'
import { shortenPostId } from '../../pages/PostPage/PostPage'
import Post from '../Post/Post'

import styles from './PostGrid.module.scss'

interface PostGridProps {
  posts?: PostShape[]
  feed?: { post: PostShape; user: string }[]
}

const PostGrid: React.FC<PostGridProps> = ({ posts, feed }) => {
  const navigate = useNavigate()
  const [hasMore, setHasMore] = useState(
    Number((feed ?? posts)?.length) > minPostLength
  )
  const [postsToShow, setPostsToShow] = useState(minPostLength)
  const postGrid = useMemo(() => {
    if (feed) {
      return feed
        .slice(0, feed.length > minPostLength ? postsToShow : feed.length)
        .map(({ post, user }) => (
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
      return posts
        .slice(0, posts.length > minPostLength ? postsToShow : posts.length)
        .map((post) => (
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
  }, [posts, postsToShow, feed])

  return (
    <InfiniteScroll
      scrollableTarget="app"
      loader={<h2>...</h2>}
      hasMore={hasMore}
      dataLength={Number((feed ?? posts)?.length)}
      className={styles.postGrid}
      next={() => {
        if ((feed ?? posts) && postsToShow < (feed ?? posts ?? []).length) {
          setHasMore(true)
          const remainingPosts = (feed ?? posts ?? []).length - postsToShow
          if (remainingPosts > minPostLength) {
            setPostsToShow(postsToShow + minPostLength)
          } else {
            setHasMore(false)
            setPostsToShow(postsToShow + remainingPosts)
          }
        }
        setHasMore(false)
      }}
    >
      {postGrid}
    </InfiniteScroll>
  )
}

export default PostGrid
