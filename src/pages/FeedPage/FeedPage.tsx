import { useMemo, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { NavigateFunction, useLocation, useNavigate } from 'react-router'

import Page from '../../components/Page/Page'
import Post from '../../components/Post/Post'
import PostGrid from '../../components/PostGrid/PostGrid'
import UploadButton from '../../components/UploadButton/UploadButton'
import { useFeed } from '../../hooks/useFeed'

import styles from './FeedPage.module.scss'

export const minPostLength = 13

export const fetchMorePosts = (
  navigate: NavigateFunction,
  urlParams: URLSearchParams,
  postsToShow: number
) =>
  navigate(
    location.pathname +
      (!urlParams.get('feed') || urlParams.get('feed') === 'stream'
        ? '?feed=stream'
        : '?feed=grid') +
      `&posts=${postsToShow}`
  )

export const FeedPage = () => {
  const { feed, nextFeed, isLoading, updateFeed } = useFeed()
  const navigate = useNavigate()
  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)
  const [hasMore, setHasMore] = useState(Number(feed?.length) > minPostLength)
  const initialPostsToShow = urlParams.get('posts')
  const [postsToShow, setPostsToShow] = useState(
    Number(initialPostsToShow ? initialPostsToShow : minPostLength)
  )

  console.debug(feed)

  const feedStream = useMemo(() => {
    return (
      feed && (
        <InfiniteScroll
          scrollableTarget="app"
          loader={<h2>...</h2>}
          hasMore={hasMore}
          dataLength={Number(feed?.length)}
          className={styles.feed}
          next={() => {
            if (postsToShow < feed.length) {
              setHasMore(true)
              const remainingPosts = feed.length - postsToShow
              if (remainingPosts > minPostLength) {
                setPostsToShow(postsToShow + minPostLength)
                fetchMorePosts(navigate, urlParams, postsToShow + minPostLength)
              } else {
                setHasMore(false)
                setPostsToShow(postsToShow + remainingPosts)
                fetchMorePosts(
                  navigate,
                  urlParams,
                  postsToShow + remainingPosts
                )
              }
            }
            setHasMore(false)
          }}
        >
          {!urlParams.get('feed') || urlParams.get('feed') === 'stream' ? (
            feed
              .slice(0, feed.length > minPostLength ? postsToShow : feed.length)
              .map(({ post, user }) => {
                console.debug(post, user)
                return (
                  <Post
                    key={post.id}
                    post={post}
                    fullSize={true}
                    onSelect={() => {
                      navigate(
                        `/user/${encodeURIComponent(user)}/${encodeURIComponent(
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
        </InfiniteScroll>
      )
    )
  }, [feed, postsToShow])

  return (
    <Page title="Home" loading={isLoading && !feed}>
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
      {isLoading && <h2>Loading...</h2>}
      {feedStream}
      <div className="footer">
        <UploadButton />
      </div>
    </Page>
  )
}
