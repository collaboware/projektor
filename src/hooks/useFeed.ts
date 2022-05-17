import { useContext, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'

import { CurrentUserAuthContext } from '../context/CurrentUserAuthContext'
import { PostShape } from '../generated/shex'
import { fetchPosts } from '../pages/ProfilePage/ProfilePage'
import { feedState } from '../state/feed'

import { useFollowingList } from './useFollowingList'

export const useFeed = () => {
  const { session: currentSession } = useContext(CurrentUserAuthContext)
  const { followingList } = useFollowingList()
  const [isLoading, setIsLoading] = useState(true)
  const [{ feed }, setFeedState] = useRecoilState(feedState)

  const setFeed = (feed: { post: PostShape; user: string }[]) => {
    setFeedState({ feed })
  }

  useEffect(() => {
    if (
      currentSession &&
      followingList?.following &&
      followingList?.following.length > 0
    ) {
      setIsLoading(true)
      const following =
        typeof followingList.following === 'string'
          ? [followingList.following]
          : followingList.following
      Promise.all(
        [...following, currentSession.info.webId as string].map((following) => {
          return fetchPosts(currentSession, following).then((posts) =>
            posts.map((post) => ({ post, user: following }))
          )
        })
      ).then((individualPostLists) => {
        setFeed(
          individualPostLists
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
        setIsLoading(false)
      })
    }
  }, [followingList])

  if (feed) {
    return { isLoading: false, feed }
  }

  return { isLoading, feed }
}
