import { Session } from '@inrupt/solid-client-authn-browser'
import {  useEffect, useState } from 'react'

import { PostShape } from '../generated/shex'
import { fetchPosts } from '../pages/ProfilePage/ProfilePage'

import { useFollowingList } from './useFollowingList'

export const useFeed = (currentSession: Session|null) => {
  const { followingList } = useFollowingList()
  const [isLoading, setIsLoading] = useState(true)
  const [feed, setFeed] = useState<{ post: PostShape; user: string }[]>([])

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

  return { isLoading, feed }
}
