import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useRecoilState } from 'recoil'

import Page from '../../components/Page/Page'
import Post from '../../components/Post/Post'
import PostGrid from '../../components/PostGrid/PostGrid'
import UploadButton from '../../components/UploadButton/UploadButton'
import { useFeed } from '../../hooks/useFeed'
import { authState } from '../../state/auth'
import { shortenPostId } from '../PostPage/PostPage'

import styles from './FeedPage.module.scss'

export const FeedPage = () => {
  const [auth, _] = useRecoilState(authState)
  const { feed, nextFeed, isLoading, updateFeed } = useFeed(auth.session)
  const navigate = useNavigate()
  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)

  return (
    <Page title="Home" loading={isLoading}>
      {isLoading && <h2>Loading...</h2>}
      <div className={styles.feedSettings}>
        <label>
          <input
            type="checkbox"
            checked={
              urlParams.get('feed') === 'stream' || !urlParams.get('feed')
            }
            onChange={() => navigate(location.pathname + `?feed=stream`)}
          />
          Stream
        </label>
        <label>
          <input
            type="checkbox"
            checked={urlParams.get('feed') === 'grid'}
            onChange={() => navigate(location.pathname + `?feed=grid`)}
          />
          Grid
        </label>
      </div>
      {nextFeed && nextFeed.length > 0 ? (
        <div className={styles.updateButton}>
          <button
            onClick={(e) => {
              e.preventDefault()
              updateFeed()
            }}
          >
            Show Updates ({nextFeed.length})
          </button>
        </div>
      ) : null}
      {feed && (
        <div className={styles.feed}>
          {!urlParams.get('feed') || urlParams.get('feed') === 'stream' ? (
            feed.map(({ post, user }) => {
              return (
                <Post
                  key={post.id}
                  post={post}
                  fullSize={true}
                  onSelect={() => {
                    navigate(
                      `/user/${encodeURIComponent(user)}/${shortenPostId(
                        post.id
                      )}`,
                      { state: location.pathname + location.search }
                    )
                  }}
                />
              )
            })
          ) : (
            <PostGrid feed={feed} />
          )}
        </div>
      )}
      <div className="footer">
        <UploadButton />
      </div>
    </Page>
  )
}
