import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'

import {
  following,
  followingIndex,
  FollowingShape,
  FollowingShapeIndexType,
  FollowingShapeType,
} from '../generated/shex'
import { authState } from '../state/auth'
import { followingState } from '../state/following'

export const useFollowingList = () => {
  const [{ session: currentSession, storage }] = useRecoilState(authState)
  const [isLoading, setIsLoading] = useState(false)
  const [followingList, setFollowingList] = useRecoilState(followingState)
  const [createNewIndex, setCreateNewIndex] = useState(false)
  const publicTypeIndexUrl = useMemo(
    () => storage + `settings/publicTypeIndex.ttl`,
    [storage]
  )
  const followingUrl = useMemo(
    () => storage + `profile/following#me`,
    [storage]
  )

  useEffect(() => {
    if (currentSession) {
      setIsLoading(true)
      followingIndex.fetcher._fetch = currentSession?.fetch
      following.fetcher._fetch = currentSession?.fetch
      followingIndex
        .findAll({ doc: publicTypeIndexUrl as string })
        .then((result) => {
          if (
            !result.data ||
            result.data.length === 0 ||
            !result.data.find((index) => index.id === followingUrl)
          ) {
            setCreateNewIndex(true)
            setFollowingList([] as unknown as FollowingShape)
            setIsLoading(false)
          } else {
            following
              .findOne({
                where: { id: followingUrl },
                doc: followingUrl as string,
              })
              .then((list) => {
                setFollowingList(list.data as FollowingShape)
                setIsLoading(false)
              })
          }
        })
    }
  }, [currentSession])

  // migrate following list to ess 2.2
  useEffect(() => {
    if (currentSession && followingList?.following) {
      following.fetcher._fetch = currentSession?.fetch
      let needsUpdate = false
      if (Array.isArray(followingList.following)) {
        if (
          followingList.following.find((following) =>
            following.includes('pod.inrupt.com')
          )
        ) {
          needsUpdate = true
        }
      } else if (followingList.following?.includes('pod.inrupt.com')) {
        needsUpdate = true
      }

      if (needsUpdate) {
        const newFollowing = Array.isArray(followingList.following)
          ? followingList.following.map((following) => {
              if (following.includes('pod.inrupt.com')) {
                return new URL(
                  following
                    .replace('pod.inrupt.com', 'id.inrupt.com')
                    .replace('/profile/card#me', '')
                )
              }
              return new URL(following)
            })
          : [
              followingList.following.includes('pod.inrupt.com')
                ? new URL(
                    followingList.following
                      .replace('pod.inrupt.com', 'id.inrupt.com')
                      .replace('/profile/card#me', '')
                  )
                : new URL(followingList.following),
            ]
        following
          .update({
            data: {
              id: followingList.id,
              type: followingList.type,
              following: newFollowing,
            },
            doc: followingUrl,
          })
          .then((res) => {
            console.debug(res, 'lala')
          })
          .catch((e) => {
            console.debug(e)
          })
      }
    }
  }, [followingList])

  const isFollowing = useCallback(
    (webId: URL) =>
      !!(typeof followingList?.following === 'string'
        ? followingList.following === webId.href
        : followingList?.following?.find(
            (following) => following === webId.href
          )),
    [followingList]
  )

  const toggleFollowing = useCallback(
    async (webId: URL) => {
      setIsLoading(true)
      if (createNewIndex) {
        const followingList = await following.create({
          data: {
            id: followingUrl as string,
            type: FollowingShapeType.Following,
            following: [webId],
          },
          doc: followingUrl as string,
        })
        if (followingList.data) {
          const followingListURL = new URL(followingList.data?.id as string)
          followingIndex.create({
            data: {
              id: followingList.doc as string,
              followingIndex: followingListURL,
              type: FollowingShapeIndexType.FollowingIndex,
            },
            doc: publicTypeIndexUrl as string,
          })
          setFollowingList(followingList.data)
          setCreateNewIndex(false)
        }
        setIsLoading(false)
      } else {
        if (followingList?.following && followingUrl && publicTypeIndexUrl) {
          let newFollowings =
            typeof followingList?.following === 'string'
              ? [followingList.following]
              : [...followingList.following]
          if (isFollowing(webId)) {
            newFollowings = newFollowings?.filter(
              (following) => following !== webId.href
            )
          } else {
            newFollowings?.push(webId.href)
          }
          if (newFollowings.length === 0) {
            await following.delete({
              where: { id: followingList.id },
              doc: followingList.id.replace('#me', ''),
            })
            await followingIndex.delete({
              where: { id: followingList.id },
              doc: publicTypeIndexUrl,
            })
            setFollowingList(null)
            setCreateNewIndex(true)
          } else {
            const newFollowingList = await following.update({
              data: {
                id: followingUrl,
                following: newFollowings.map((webId) => new URL(webId)),
              },
              doc: followingUrl.replace('#me', ''),
            })
            if (newFollowingList?.data) {
              setFollowingList(newFollowingList.data)
            }
          }
        }
        setIsLoading(false)
      }
    },
    [createNewIndex, followingUrl, followingList]
  )

  if (followingList) {
    return { isLoading: false, isFollowing, toggleFollowing, followingList }
  }

  return {
    isLoading,
    isFollowing,
    toggleFollowing: isLoading ? null : toggleFollowing,
    followingList,
  }
}
