import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { CurrentUserAuthContext } from '../context/CurrentUserAuthContext'
import {
  following,
  followingIndex,
  FollowingShape,
  FollowingShapeIndexType,
  FollowingShapeType,
} from '../generated/shex'

export const useFollowingList = () => {
  const { session: currentSession } = useContext(CurrentUserAuthContext)
  const [isLoading, setIsLoading] = useState(false)
  const [followingList, setFollowingList] = useState<FollowingShape | null>(
    null
  )
  const [createNewIndex, setCreateNewIndex] = useState(false)
  const publicTypeIndexUrl = useMemo(
    () =>
      currentSession?.info.webId?.replace(
        'profile/card#me',
        `settings/publicTypeIndex.ttl`
      ),
    [currentSession]
  )
  const followingUrl = useMemo(
    () =>
      currentSession?.info.webId?.replace(
        'profile/card#me',
        `profile/following#me`
      ),
    [currentSession]
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
              : followingList?.following
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

  return {
    isLoading,
    isFollowing,
    toggleFollowing: isLoading ? null : toggleFollowing,
    followingList,
  }
}
