import { Session } from '@inrupt/solid-client-authn-browser'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'

import { FollowingShape, PostShape } from '../generated/shex'
import { shortenPostId } from '../pages/PostPage/PostPage'
import { fetchPosts } from '../pages/ProfilePage/ProfilePage'
import { feedState } from '../state/feed'

import { useFollowingList } from './useFollowingList'

const loadFeed = (followingList: FollowingShape, session: Session) => {
  const following =
    typeof followingList.following === 'string'
      ? [followingList.following]
      : followingList.following
  return Promise.all(
    [...(following ?? []), session.info.webId as string].map((following) => {
      return fetchPosts(session, following).then((posts) =>
        posts.map((post) => ({ post, user: following }))
      )
    })
  ).then((individualPostsLists) =>
    individualPostsLists
      .reduce((allPosts, postList) => {
        return [...allPosts, ...postList]
      })
      .sort(({ post: postA }, { post: postB }) => {
        const postATimeString = postA.id.substring(
          postA.id.lastIndexOf('/') + 1,
          postA.id.lastIndexOf('-post')
        )
        const postBTimeString = postB.id.substring(
          postB.id.lastIndexOf('/') + 1,
          postB.id.lastIndexOf('-post')
        )
        return Number(postBTimeString) - Number(postATimeString)
      })
  )
}

export const useFeed = (currentSession: Session | null) => {
  const { followingList } = useFollowingList()
  const [isLoading, setIsLoading] = useState(true)
  const [{ feed, nextFeed }, setFeedState] = useRecoilState(feedState)

  const setNextFeed = (feed: { post: PostShape; user: string }[]) => {
    setFeedState((state) => {
      const nextFeed =
        state.feed && state.feed.length
          ? feed.filter(
              ({ post }) =>
                Number(shortenPostId(post.id)) >
                Number(
                  shortenPostId(
                    (state.feed as { post: PostShape }[])[0].post.id
                  )
                )
            )
          : feed
      if (state.feed?.length && (state.feed?.length ?? 0) > feed.length) {
        return { feed }
      }
      return {
        nextFeed,
        feed: state.feed ?? feed,
      }
    })
  }

  const refetchFeed = async () => {
    setIsLoading(true)
    if (followingList && currentSession) {
      await loadFeed(followingList, currentSession).then((feed) => {
        setFeedState({ feed, nextFeed: [] })
        setIsLoading(false)
      })
    }
  }

  const updateFeed = () => {
    if (nextFeed && feed) setFeedState({ feed: [...nextFeed, ...feed] })
  }

  useEffect(() => {
    if (currentSession && followingList) {
      setIsLoading(true)
      loadFeed(followingList, currentSession).then((feed) => {
        setNextFeed(feed)
        setIsLoading(false)
      })
    }
  }, [followingList?.following])

  if (feed) {
    return { isLoading: false, feed, nextFeed, updateFeed, refetchFeed }
  }

  return { isLoading, feed, nextFeed, updateFeed, refetchFeed }
}
