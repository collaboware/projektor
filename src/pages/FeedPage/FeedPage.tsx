import React from 'react'
import { useLocation, useNavigate } from 'react-router'

import Page from '../../components/Page/Page'
import Post from '../../components/Post/Post'
import UploadButton from '../../components/UploadButton/UploadButton'
import { useFeed } from '../../hooks/useFeed'
import { shortenPostId } from '../PostPage/PostPage'

export const FeedPage = () => {
  const { feed, isLoading } = useFeed()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Page title="Home" loading={isLoading}>
      {isLoading && <h2>Loading your feed...</h2>}
      <div>
        {feed.map(({ post, user }) => {
          return (
            <Post
              key={post.id}
              post={post}
              fullSize
              onSelect={() => {
                navigate(
                  `/user/${encodeURIComponent(user)}/${shortenPostId(post.id)}`,
                  { state: location.pathname }
                )
              }}
            />
          )
        })}
      </div>
      <div className="footer">
        <UploadButton />
      </div>
    </Page>
  )
}
